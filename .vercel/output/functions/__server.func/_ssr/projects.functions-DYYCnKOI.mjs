import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-DVuXxYI6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects.functions-DYYCnKOI.js
function clip(value, max) {
	return typeof value === "string" ? value.slice(0, max) : "";
}
function httpsUrl(value) {
	const url = clip(value, 300);
	return url.startsWith("https://") ? url : "";
}
function projectFromUnknown(input) {
	const data = input ?? {};
	const id = clip(data.id, 80);
	if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) throw new Error("Projekt-ID ungültig.");
	const files = (Array.isArray(data.files) ? data.files : []).slice(0, 24).map((file) => {
		const row = file;
		return {
			path: clip(row.path, 120).replace(/[^\w.\-/]/g, "") || "datei.txt",
			content: clip(row.content, 6e4)
		};
	});
	const safeFiles = files.length ? files : [{
		path: "src/page.tsx",
		content: ""
	}];
	const active = clip(data.activePath, 120);
	const messages = (Array.isArray(data.messages) ? data.messages : []).slice(-80).map((message) => {
		const row = message;
		const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
		const content = clip(row.content, 6e3);
		if (!role || !content.trim()) return null;
		return {
			id: clip(row.id, 80) || crypto.randomUUID(),
			role,
			content,
			createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now()
		};
	}).filter((message) => message !== null);
	const images = (Array.isArray(data.images) ? data.images : []).slice(-8).map((image) => {
		const row = image;
		return {
			id: clip(row.id, 80) || crypto.randomUUID(),
			prompt: clip(row.prompt, 500),
			url: httpsUrl(row.url),
			createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now()
		};
	});
	const board = data.storyboard;
	const storyboard = board && Array.isArray(board.scenes) ? {
		title: clip(board.title, 120),
		aspect: clip(board.aspect, 12) || "16:9",
		duration: board.duration === 6 || board.duration === 10 || board.duration === 15 ? board.duration : 10,
		voiceover: clip(board.voiceover, 500),
		music: clip(board.music, 200),
		scenes: board.scenes.slice(0, 8).map((scene) => ({
			title: clip(scene?.title, 120),
			camera: clip(scene?.camera, 200),
			action: clip(scene?.action, 400),
			visual: clip(scene?.visual, 400)
		}))
	} : null;
	return {
		id,
		name: clip(data.name, 80).trim() || "Projekt",
		updatedAt: typeof data.updatedAt === "number" && Number.isFinite(data.updatedAt) ? data.updatedAt : Date.now(),
		messages,
		files: safeFiles,
		activePath: safeFiles.some((file) => file.path === active) ? active : safeFiles[0].path,
		images,
		storyboard
	};
}
function readPayload(value) {
	if (typeof value === "string") try {
		return JSON.parse(value);
	} catch {
		return null;
	}
	return value;
}
var listStudioProjects_createServerFn_handler = createServerRpc({
	id: "4e27e81de1719bcaf4773de3cefb3b027d4f442592d7c928d2534263563cfe9f",
	name: "listStudioProjects",
	filename: "src/lib/studio/projects.functions.ts"
}, (opts) => listStudioProjects.__executeServer(opts));
var listStudioProjects = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listStudioProjects_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-CHtCSIp0.mjs").then((n) => n.t).then((n) => n.t);
	return { projects: (await (await getSql())`
      select id, name, updated_at, payload
      from studio_project
      where user_id = ${context.userId}
      order by updated_at desc
      limit 20
    `).flatMap((row) => {
		try {
			return [projectFromUnknown({
				...readPayload(row.payload),
				id: row.id,
				name: row.name,
				updatedAt: Number(row.updated_at)
			})];
		} catch {
			return [];
		}
	}) };
});
var saveStudioProject_createServerFn_handler = createServerRpc({
	id: "2070b8fbe5da387b5bbd613741ab21d23719c4ae16aff0b30a746ea8815d26d1",
	name: "saveStudioProject",
	filename: "src/lib/studio/projects.functions.ts"
}, (opts) => saveStudioProject.__executeServer(opts));
var saveStudioProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => projectFromUnknown(input)).handler(saveStudioProject_createServerFn_handler, async ({ data, context }) => {
	const { getSql } = await import("./db-CHtCSIp0.mjs").then((n) => n.t).then((n) => n.t);
	return {
		ok: true,
		stored: (await (await getSql())`
      insert into studio_project (id, user_id, name, updated_at, payload)
      values (${data.id}, ${context.userId}, ${data.name}, ${data.updatedAt}, ${JSON.stringify(data)}::jsonb)
      on conflict (user_id, id) do update
      set name = excluded.name,
          updated_at = excluded.updated_at,
          payload = excluded.payload
      where studio_project.updated_at <= excluded.updated_at
      returning updated_at
    `).length > 0
	};
});
var deleteStudioProject_createServerFn_handler = createServerRpc({
	id: "aad44d343010c820e33d9ea9d12f256f5db5a17e6903a82d5e013c58f1b71a34",
	name: "deleteStudioProject",
	filename: "src/lib/studio/projects.functions.ts"
}, (opts) => deleteStudioProject.__executeServer(opts));
var deleteStudioProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = clip(input?.id, 80);
	if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) throw new Error("Projekt-ID ungültig.");
	return { id };
}).handler(deleteStudioProject_createServerFn_handler, async ({ data, context }) => {
	const { getSql } = await import("./db-CHtCSIp0.mjs").then((n) => n.t).then((n) => n.t);
	await (await getSql())`delete from studio_project where user_id = ${context.userId} and id = ${data.id}`;
	return { ok: true };
});
//#endregion
export { deleteStudioProject_createServerFn_handler, listStudioProjects_createServerFn_handler, saveStudioProject_createServerFn_handler };
