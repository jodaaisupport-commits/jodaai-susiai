import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function publicHttps(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.includes(":")
  ) {
    return null;
  }
  const ip = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(host);
  if (ip) {
    const a = Number(ip[1]);
    const b = Number(ip[2]);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return null;
    }
  }
  return url.toString();
}

async function readModelIds(url: string, key: string) {
  const headers: Record<string, string> = {};
  if (key) headers.Authorization = `Bearer ${key}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return { ok: false as const, error: `Modelle nicht erreichbar (${res.status}).` };
  const body = (await res.json()) as { data?: { id?: string }[] };
  const models = (body.data ?? [])
    .map((item) => (typeof item.id === "string" ? item.id : ""))
    .filter(Boolean)
    .slice(0, 40);
  if (!models.length) return { ok: false as const, error: "Keine Modelle in der Antwort." };
  return { ok: true as const, models };
}

export const listRemoteModels = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = (input ?? {}) as { provider?: unknown; key?: unknown };
    return {
      provider:
        data.provider === "gonka" ? ("gonka" as const) : data.provider === "sambanova" ? ("sambanova" as const) : ("dahl" as const),
      key: clip(data.key, 300),
    };
  })
  .handler(async ({ data }) => {
    const url =
      data.provider === "gonka"
        ? "https://api.gonkarouter.io/v1/models"
        : data.provider === "sambanova"
          ? "https://api.sambanova.ai/v1/models"
          : "https://inference.dahl.global/v1/models";
    if (data.provider === "gonka" && !data.key.trim()) {
      return { ok: false as const, error: "GonkaRouter braucht einen API-Schlüssel." };
    }
    try {
      return await readModelIds(url, data.key.trim());
    } catch {
      return { ok: false as const, error: "Modelle konnten nicht geladen werden." };
    }
  });

export const dahlBalance = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = (input ?? {}) as { key?: unknown };
    return { key: clip(data.key, 300) };
  })
  .handler(async ({ data }) => {
    const key = data.key.trim();
    if (!key) return { ok: false as const, tokens: null as number | null, error: "Schlüssel fehlt." };
    try {
      const res = await fetch("https://inference.dahl.global/tokens/current", {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(12_000),
      });
      const body = (await res.json().catch(() => null)) as {
        available_tokens?: number;
        error?: { message?: string };
      } | null;
      const tokens = typeof body?.available_tokens === "number" ? body.available_tokens : null;
      if (res.status === 402 || tokens === 0) {
        return { ok: false as const, tokens: 0, error: "Guthaben leer. Neuen Schlüssel anlegen." };
      }
      if (!res.ok) {
        return {
          ok: false as const,
          tokens,
          error: res.status === 401 ? "Schlüssel abgelehnt." : body?.error?.message?.slice(0, 160) || `Status ${res.status}`,
        };
      }
      return { ok: true as const, tokens, error: "" };
    } catch {
      return { ok: false as const, tokens: null, error: "Kontostand nicht erreichbar." };
    }
  });

export const probeCodekit = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = (input ?? {}) as { key?: unknown };
    return { key: clip(data.key, 300) };
  })
  .handler(async ({ data }) => {
    const key = data.key.trim();
    if (!key) return { ok: false as const, error: "Schlüssel fehlt." };
    try {
      const res = await fetch("https://prod.0codekit.com/1saas/auth", {
        method: "POST",
        headers: { auth: key, "Content-Type": "application/json" },
        body: "{}",
        signal: AbortSignal.timeout(12_000),
      });
      if (res.status === 401) return { ok: false as const, error: "0CodeKit hat den Schlüssel abgelehnt." };
      if (!res.ok) return { ok: false as const, error: `0CodeKit Status ${res.status}.` };
      return { ok: true as const, error: "" };
    } catch {
      return { ok: false as const, error: "0CodeKit nicht erreichbar." };
    }
  });

export const probeGithub = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = (input ?? {}) as { token?: unknown };
    return { token: clip(data.token, 400) };
  })
  .handler(async ({ data }) => {
    const token = data.token.trim();
    if (token.length < 8) return { ok: false as const, error: "GitHub-Token fehlt.", login: "", repos: [] as { fullName: string; htmlUrl: string }[] };
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "SusiAI-Studio",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    try {
      const userRes = await fetch("https://api.github.com/user", { headers, signal: AbortSignal.timeout(12_000) });
      if (userRes.status === 401) return { ok: false as const, error: "GitHub hat den Token abgelehnt.", login: "", repos: [] };
      if (!userRes.ok) return { ok: false as const, error: `GitHub Status ${userRes.status}.`, login: "", repos: [] };
      const user = (await userRes.json()) as { login?: string };
      const repoRes = await fetch("https://api.github.com/user/repos?per_page=6&sort=updated&affiliation=owner,collaborator", {
        headers,
        signal: AbortSignal.timeout(12_000),
      });
      const payload = repoRes.ok ? await repoRes.json() : [];
      const rows = Array.isArray(payload) ? (payload as { full_name?: string; html_url?: string }[]) : [];
      const repos = rows
        .filter((row) => typeof row.full_name === "string" && typeof row.html_url === "string")
        .slice(0, 6)
        .map((row) => ({ fullName: row.full_name as string, htmlUrl: row.html_url as string }));
      return { ok: true as const, error: "", login: user.login || "GitHub", repos };
    } catch {
      return { ok: false as const, error: "GitHub nicht erreichbar.", login: "", repos: [] };
    }
  });

function parseRpc(text: string): { result?: { tools?: unknown }; error?: { message?: string } } | null {
  const trimmed = text.trim();
  const candidates = trimmed.startsWith("{")
    ? [trimmed]
    : trimmed
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .filter((line) => line && line !== "[DONE]");
  const raw = candidates[candidates.length - 1];
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { result?: { tools?: unknown }; error?: { message?: string } };
  } catch {
    return null;
  }
}

async function mcpPost(url: string, token: string, body: unknown, session: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (session) headers["Mcp-Session-Id"] = session;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
  });
  return {
    status: res.status,
    session: res.headers.get("mcp-session-id"),
    text: await res.text(),
  };
}

export const probeMcpServer = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = (input ?? {}) as { url?: unknown; token?: unknown };
    return { url: clip(data.url, 300), token: clip(data.token, 300) };
  })
  .handler(async ({ data }) => {
    const url = publicHttps(data.url);
    if (!url) return { ok: false as const, error: "Nur öffentliche https-Adressen sind erlaubt.", tools: [] as { name: string; description: string }[] };
    try {
      const init = await mcpPost(
        url,
        data.token.trim(),
        {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "SusiAI Studio", version: "1.0" },
          },
        },
        null,
      );
      if (init.status >= 400) {
        return { ok: false as const, error: `MCP hat mit Status ${init.status} geantwortet.`, tools: [] };
      }
      const listed = await mcpPost(
        url,
        data.token.trim(),
        { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
        init.session,
      );
      const rpc = parseRpc(listed.text);
      if (rpc?.error?.message) return { ok: false as const, error: rpc.error.message.slice(0, 180), tools: [] };
      const tools = Array.isArray(rpc?.result?.tools) ? rpc.result.tools : [];
      return {
        ok: true as const,
        error: "",
        tools: tools.slice(0, 40).map((tool) => {
          const row = tool as { name?: unknown; description?: unknown };
          return {
            name: clip(row.name, 80) || "tool",
            description: clip(row.description, 160),
          };
        }),
      };
    } catch {
      return { ok: false as const, error: "MCP-Server nicht erreichbar.", tools: [] };
    }
  });

export const probePlatformLinks = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(async () => {
  const { callTool, ConnectorType, GoogleCalendarTools, GoogleDriveTools, getConnectorAccessToken } =
    await import("@/lib/app-data/client.server");
  async function check(type: "GoogleDrive" | "GoogleCalendar", tool: string, args: Record<string, unknown>) {
    const result = await callTool(tool, args, { connectorType: type });
    const raw = result.errorMessage ?? "";
    const message = result.ok
      ? "Verbunden"
      : result.pending
        ? "Wartet auf die Grok-Verbindung."
        : result.loginRequired
          ? "Anmeldung über Grok nötig."
          : raw.slice(0, 160) || "Nicht verbunden";
    return { ok: result.ok, message };
  }
  const [drive, calendar] = await Promise.all([
    check(ConnectorType.GoogleDrive, GoogleDriveTools.search, { q: "susi", pageSize: 1 }),
    check(ConnectorType.GoogleCalendar, GoogleCalendarTools.listCalendars, {}),
  ]);
  return {
    tokenReady: Boolean(getConnectorAccessToken()),
    checks: { GoogleDrive: drive, GoogleCalendar: calendar },
  };
});

export const callCatalogTool = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = (input ?? {}) as { catalogId?: unknown; tool?: unknown; args?: unknown };
    let args: Record<string, unknown> = {};
    if (typeof data.args === "string" && data.args.trim()) {
      try {
        const parsed = JSON.parse(data.args) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) args = parsed as Record<string, unknown>;
      } catch {
        args = { invalid: true };
      }
    }
    return {
      catalogId: clip(data.catalogId, 120),
      tool: clip(data.tool, 80),
      args,
      badJson: args.invalid === true,
    };
  })
  .handler(async ({ data }) => {
    if (!data.catalogId || !data.tool) return { ok: false as const, message: "Katalog-ID und Werkzeugname fehlen.", preview: "" };
    if (data.badJson) return { ok: false as const, message: "Argumente sind kein JSON-Objekt.", preview: "" };
    const { callTool, ConnectorType } = await import("@/lib/app-data/client.server");
    const result = await callTool(data.tool, data.args, {
      connectorType: ConnectorType.Mcp,
      connectorCatalogId: data.catalogId,
    });
    if (!result.ok) {
      return {
        ok: false as const,
        message: result.pending
          ? "Wartet auf die Grok-Verbindung."
          : (result.errorMessage || "Aufruf fehlgeschlagen").slice(0, 180),
        preview: "",
      };
    }
    let preview = "";
    try {
      preview = JSON.stringify(result.data).slice(0, 500);
    } catch {
      preview = "";
    }
    return { ok: true as const, message: "Aufgerufen", preview };
  });
