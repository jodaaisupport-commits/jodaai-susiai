import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { ChatMessage, GalleryItem, Project, Storyboard, StudioFile } from "@/lib/studio/types";

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function httpsUrl(value: unknown) {
  const url = clip(value, 300);
  return url.startsWith("https://") ? url : "";
}

export function projectFromUnknown(input: unknown): Project {
  const data = (input ?? {}) as Partial<Project>;
  const id = clip(data.id, 80);
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) throw new Error("Projekt-ID ungültig.");
  const files = (Array.isArray(data.files) ? data.files : [])
    .slice(0, 24)
    .map((file) => {
      const row = file as Partial<StudioFile>;
      const path = clip(row.path, 120).replace(/[^\w.\-/]/g, "") || "datei.txt";
      return { path, content: clip(row.content, 60_000) };
    });
  const safeFiles = files.length ? files : [{ path: "src/page.tsx", content: "" }];
  const active = clip(data.activePath, 120);
  const messages = (Array.isArray(data.messages) ? data.messages : [])
    .slice(-80)
    .map((message) => {
      const row = message as Partial<ChatMessage>;
      const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
      const content = clip(row.content, 6000);
      if (!role || !content.trim()) return null;
      return {
        id: clip(row.id, 80) || crypto.randomUUID(),
        role,
        content,
        createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
      } satisfies ChatMessage;
    })
    .filter((message): message is ChatMessage => message !== null);
  const images = (Array.isArray(data.images) ? data.images : []).slice(-8).map((image) => {
    const row = image as Partial<GalleryItem>;
    return {
      id: clip(row.id, 80) || crypto.randomUUID(),
      prompt: clip(row.prompt, 500),
      url: httpsUrl(row.url),
      createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
    } satisfies GalleryItem;
  });
  const board = data.storyboard;
  const storyboard: Storyboard | null =
    board && Array.isArray(board.scenes)
      ? {
          title: clip(board.title, 120),
          aspect: clip(board.aspect, 12) || "16:9",
          duration: board.duration === 6 || board.duration === 10 || board.duration === 15 ? board.duration : 10,
          voiceover: clip(board.voiceover, 500),
          music: clip(board.music, 200),
          scenes: board.scenes.slice(0, 8).map((scene) => ({
            title: clip(scene?.title, 120),
            camera: clip(scene?.camera, 200),
            action: clip(scene?.action, 400),
            visual: clip(scene?.visual, 400),
          })),
        }
      : null;
  return {
    id,
    name: clip(data.name, 80).trim() || "Projekt",
    updatedAt: typeof data.updatedAt === "number" && Number.isFinite(data.updatedAt) ? data.updatedAt : Date.now(),
    messages,
    files: safeFiles,
    activePath: safeFiles.some((file) => file.path === active) ? active : safeFiles[0].path,
    images,
    storyboard,
  };
}

function readPayload(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
}

export const listStudioProjects = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string; name: string; updated_at: number; payload: unknown }>`
      select id, name, updated_at, payload
      from studio_project
      where user_id = ${context.userId}
      order by updated_at desc
      limit 20
    `;
    const projects = rows.flatMap((row) => {
      try {
        const payload = readPayload(row.payload) as Partial<Project> | null;
        return [projectFromUnknown({ ...payload, id: row.id, name: row.name, updatedAt: Number(row.updated_at) })];
      } catch {
        return [];
      }
    });
    return { projects };
  });

export const saveStudioProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => projectFromUnknown(input))
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ updated_at: number }>`
      insert into studio_project (id, user_id, name, updated_at, payload)
      values (${data.id}, ${context.userId}, ${data.name}, ${data.updatedAt}, ${JSON.stringify(data)}::jsonb)
      on conflict (user_id, id) do update
      set name = excluded.name,
          updated_at = excluded.updated_at,
          payload = excluded.payload
      where studio_project.updated_at <= excluded.updated_at
      returning updated_at
    `;
    return { ok: true as const, stored: rows.length > 0 };
  });

export const deleteStudioProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const id = clip((input as { id?: unknown } | null)?.id, 80);
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) throw new Error("Projekt-ID ungültig.");
    return { id };
  })
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from studio_project where user_id = ${context.userId} and id = ${data.id}`;
    return { ok: true as const };
  });
