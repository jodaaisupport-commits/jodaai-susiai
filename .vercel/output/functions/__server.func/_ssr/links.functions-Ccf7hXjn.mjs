import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-DVuXxYI6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/links.functions-Ccf7hXjn.js
function clip(value, max) {
	return typeof value === "string" ? value.slice(0, max) : "";
}
function publicHttps(raw) {
	let url;
	try {
		url = new URL(raw.trim());
	} catch {
		return null;
	}
	if (url.protocol !== "https:" || url.username || url.password) return null;
	const host = url.hostname.toLowerCase();
	if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.includes(":")) return null;
	const ip = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(host);
	if (ip) {
		const a = Number(ip[1]);
		const b = Number(ip[2]);
		if (a === 10 || a === 127 || a === 0 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168) return null;
	}
	return url.toString();
}
async function readModelIds(url, key) {
	const headers = {};
	if (key) headers.Authorization = `Bearer ${key}`;
	const res = await fetch(url, {
		headers,
		signal: AbortSignal.timeout(15e3)
	});
	if (!res.ok) return {
		ok: false,
		error: `Modelle nicht erreichbar (${res.status}).`
	};
	const models = ((await res.json()).data ?? []).map((item) => typeof item.id === "string" ? item.id : "").filter(Boolean).slice(0, 40);
	if (!models.length) return {
		ok: false,
		error: "Keine Modelle in der Antwort."
	};
	return {
		ok: true,
		models
	};
}
var listRemoteModels_createServerFn_handler = createServerRpc({
	id: "8ff7c5403f7dccaa6260d5a781323edde1faca6e83545ff50510c0ea3fa30e91",
	name: "listRemoteModels",
	filename: "src/lib/studio/links.functions.ts"
}, (opts) => listRemoteModels.__executeServer(opts));
var listRemoteModels = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		provider: data.provider === "gonka" ? "gonka" : data.provider === "sambanova" ? "sambanova" : "dahl",
		key: clip(data.key, 300)
	};
}).handler(listRemoteModels_createServerFn_handler, async ({ data }) => {
	const url = data.provider === "gonka" ? "https://api.gonkarouter.io/v1/models" : data.provider === "sambanova" ? "https://api.sambanova.ai/v1/models" : "https://inference.dahl.global/v1/models";
	if (data.provider === "gonka" && !data.key.trim()) return {
		ok: false,
		error: "GonkaRouter braucht einen API-Schlüssel."
	};
	try {
		return await readModelIds(url, data.key.trim());
	} catch {
		return {
			ok: false,
			error: "Modelle konnten nicht geladen werden."
		};
	}
});
var dahlBalance_createServerFn_handler = createServerRpc({
	id: "fb1ef6a035c9b1b883cdccf71dc4a62d01d34393cdc1ee1f64ff918a009019f1",
	name: "dahlBalance",
	filename: "src/lib/studio/links.functions.ts"
}, (opts) => dahlBalance.__executeServer(opts));
var dahlBalance = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { key: clip((input ?? {}).key, 300) };
}).handler(dahlBalance_createServerFn_handler, async ({ data }) => {
	const key = data.key.trim();
	if (!key) return {
		ok: false,
		tokens: null,
		error: "Schlüssel fehlt."
	};
	try {
		const res = await fetch("https://inference.dahl.global/tokens/current", {
			headers: { Authorization: `Bearer ${key}` },
			signal: AbortSignal.timeout(12e3)
		});
		const body = await res.json().catch(() => null);
		const tokens = typeof body?.available_tokens === "number" ? body.available_tokens : null;
		if (res.status === 402 || tokens === 0) return {
			ok: false,
			tokens: 0,
			error: "Guthaben leer. Neuen Schlüssel anlegen."
		};
		if (!res.ok) return {
			ok: false,
			tokens,
			error: res.status === 401 ? "Schlüssel abgelehnt." : body?.error?.message?.slice(0, 160) || `Status ${res.status}`
		};
		return {
			ok: true,
			tokens,
			error: ""
		};
	} catch {
		return {
			ok: false,
			tokens: null,
			error: "Kontostand nicht erreichbar."
		};
	}
});
var probeCodekit_createServerFn_handler = createServerRpc({
	id: "ccb7df1537186240f9e7e3e56ec0f63026e825d2920268cc8c0aab5cc350ec55",
	name: "probeCodekit",
	filename: "src/lib/studio/links.functions.ts"
}, (opts) => probeCodekit.__executeServer(opts));
var probeCodekit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { key: clip((input ?? {}).key, 300) };
}).handler(probeCodekit_createServerFn_handler, async ({ data }) => {
	const key = data.key.trim();
	if (!key) return {
		ok: false,
		error: "Schlüssel fehlt."
	};
	try {
		const res = await fetch("https://prod.0codekit.com/1saas/auth", {
			method: "POST",
			headers: {
				auth: key,
				"Content-Type": "application/json"
			},
			body: "{}",
			signal: AbortSignal.timeout(12e3)
		});
		if (res.status === 401) return {
			ok: false,
			error: "0CodeKit hat den Schlüssel abgelehnt."
		};
		if (!res.ok) return {
			ok: false,
			error: `0CodeKit Status ${res.status}.`
		};
		return {
			ok: true,
			error: ""
		};
	} catch {
		return {
			ok: false,
			error: "0CodeKit nicht erreichbar."
		};
	}
});
var probeGithub_createServerFn_handler = createServerRpc({
	id: "d51ea6c6d401635fdc651c02072b264e06e0b4be629a0feac63e58262d142b94",
	name: "probeGithub",
	filename: "src/lib/studio/links.functions.ts"
}, (opts) => probeGithub.__executeServer(opts));
var probeGithub = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { token: clip((input ?? {}).token, 400) };
}).handler(probeGithub_createServerFn_handler, async ({ data }) => {
	const token = data.token.trim();
	if (token.length < 8) return {
		ok: false,
		error: "GitHub-Token fehlt.",
		login: "",
		repos: []
	};
	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github+json",
		"User-Agent": "SusiAI-Studio",
		"X-GitHub-Api-Version": "2022-11-28"
	};
	try {
		const userRes = await fetch("https://api.github.com/user", {
			headers,
			signal: AbortSignal.timeout(12e3)
		});
		if (userRes.status === 401) return {
			ok: false,
			error: "GitHub hat den Token abgelehnt.",
			login: "",
			repos: []
		};
		if (!userRes.ok) return {
			ok: false,
			error: `GitHub Status ${userRes.status}.`,
			login: "",
			repos: []
		};
		const user = await userRes.json();
		const repoRes = await fetch("https://api.github.com/user/repos?per_page=6&sort=updated&affiliation=owner,collaborator", {
			headers,
			signal: AbortSignal.timeout(12e3)
		});
		const payload = repoRes.ok ? await repoRes.json() : [];
		const repos = (Array.isArray(payload) ? payload : []).filter((row) => typeof row.full_name === "string" && typeof row.html_url === "string").slice(0, 6).map((row) => ({
			fullName: row.full_name,
			htmlUrl: row.html_url
		}));
		return {
			ok: true,
			error: "",
			login: user.login || "GitHub",
			repos
		};
	} catch {
		return {
			ok: false,
			error: "GitHub nicht erreichbar.",
			login: "",
			repos: []
		};
	}
});
function parseRpc(text) {
	const trimmed = text.trim();
	const candidates = trimmed.startsWith("{") ? [trimmed] : trimmed.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).filter((line) => line && line !== "[DONE]");
	const raw = candidates[candidates.length - 1];
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
async function mcpPost(url, token, body, session) {
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json, text/event-stream"
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	if (session) headers["Mcp-Session-Id"] = session;
	const res = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
		redirect: "error",
		signal: AbortSignal.timeout(12e3)
	});
	return {
		status: res.status,
		session: res.headers.get("mcp-session-id"),
		text: await res.text()
	};
}
var probeMcpServer_createServerFn_handler = createServerRpc({
	id: "e3bbdd6d5bf71cd641b0c342ec5085386c41e0fbeea2241401cfb24d8a809dd6",
	name: "probeMcpServer",
	filename: "src/lib/studio/links.functions.ts"
}, (opts) => probeMcpServer.__executeServer(opts));
var probeMcpServer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		url: clip(data.url, 300),
		token: clip(data.token, 300)
	};
}).handler(probeMcpServer_createServerFn_handler, async ({ data }) => {
	const url = publicHttps(data.url);
	if (!url) return {
		ok: false,
		error: "Nur öffentliche https-Adressen sind erlaubt.",
		tools: []
	};
	try {
		const init = await mcpPost(url, data.token.trim(), {
			jsonrpc: "2.0",
			id: 1,
			method: "initialize",
			params: {
				protocolVersion: "2025-03-26",
				capabilities: {},
				clientInfo: {
					name: "SusiAI Studio",
					version: "1.0"
				}
			}
		}, null);
		if (init.status >= 400) return {
			ok: false,
			error: `MCP hat mit Status ${init.status} geantwortet.`,
			tools: []
		};
		const rpc = parseRpc((await mcpPost(url, data.token.trim(), {
			jsonrpc: "2.0",
			id: 2,
			method: "tools/list",
			params: {}
		}, init.session)).text);
		if (rpc?.error?.message) return {
			ok: false,
			error: rpc.error.message.slice(0, 180),
			tools: []
		};
		return {
			ok: true,
			error: "",
			tools: (Array.isArray(rpc?.result?.tools) ? rpc.result.tools : []).slice(0, 40).map((tool) => {
				const row = tool;
				return {
					name: clip(row.name, 80) || "tool",
					description: clip(row.description, 160)
				};
			})
		};
	} catch {
		return {
			ok: false,
			error: "MCP-Server nicht erreichbar.",
			tools: []
		};
	}
});
var probePlatformLinks_createServerFn_handler = createServerRpc({
	id: "a1f7cd54115a8e8a7e5effe0d03ce964d854ace09464900d4b7ee8d295078676",
	name: "probePlatformLinks",
	filename: "src/lib/studio/links.functions.ts"
}, (opts) => probePlatformLinks.__executeServer(opts));
var probePlatformLinks = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(probePlatformLinks_createServerFn_handler, async () => {
	const { callTool, ConnectorType, GoogleCalendarTools, GoogleDriveTools, getConnectorAccessToken } = await import("./client.server-CxSaonOL.mjs");
	async function check(type, tool, args) {
		const result = await callTool(tool, args, { connectorType: type });
		const raw = result.errorMessage ?? "";
		const message = result.ok ? "Verbunden" : result.pending ? "Wartet auf die Grok-Verbindung." : result.loginRequired ? "Anmeldung über Grok nötig." : raw.slice(0, 160) || "Nicht verbunden";
		return {
			ok: result.ok,
			message
		};
	}
	const [drive, calendar] = await Promise.all([check(ConnectorType.GoogleDrive, GoogleDriveTools.search, {
		q: "susi",
		pageSize: 1
	}), check(ConnectorType.GoogleCalendar, GoogleCalendarTools.listCalendars, {})]);
	return {
		tokenReady: Boolean(getConnectorAccessToken()),
		checks: {
			GoogleDrive: drive,
			GoogleCalendar: calendar
		}
	};
});
var callCatalogTool_createServerFn_handler = createServerRpc({
	id: "e4d8efcfe1e13ee52aa92c2a65dd5a620ef0485ebfd815cdef8bb637fed55825",
	name: "callCatalogTool",
	filename: "src/lib/studio/links.functions.ts"
}, (opts) => callCatalogTool.__executeServer(opts));
var callCatalogTool = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	let args = {};
	if (typeof data.args === "string" && data.args.trim()) try {
		const parsed = JSON.parse(data.args);
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) args = parsed;
	} catch {
		args = { invalid: true };
	}
	return {
		catalogId: clip(data.catalogId, 120),
		tool: clip(data.tool, 80),
		args,
		badJson: args.invalid === true
	};
}).handler(callCatalogTool_createServerFn_handler, async ({ data }) => {
	if (!data.catalogId || !data.tool) return {
		ok: false,
		message: "Katalog-ID und Werkzeugname fehlen.",
		preview: ""
	};
	if (data.badJson) return {
		ok: false,
		message: "Argumente sind kein JSON-Objekt.",
		preview: ""
	};
	const { callTool, ConnectorType } = await import("./client.server-CxSaonOL.mjs");
	const result = await callTool(data.tool, data.args, {
		connectorType: ConnectorType.Mcp,
		connectorCatalogId: data.catalogId
	});
	if (!result.ok) return {
		ok: false,
		message: result.pending ? "Wartet auf die Grok-Verbindung." : (result.errorMessage || "Aufruf fehlgeschlagen").slice(0, 180),
		preview: ""
	};
	let preview = "";
	try {
		preview = JSON.stringify(result.data).slice(0, 500);
	} catch {
		preview = "";
	}
	return {
		ok: true,
		message: "Aufgerufen",
		preview
	};
});
//#endregion
export { callCatalogTool_createServerFn_handler, dahlBalance_createServerFn_handler, listRemoteModels_createServerFn_handler, probeCodekit_createServerFn_handler, probeGithub_createServerFn_handler, probeMcpServer_createServerFn_handler, probePlatformLinks_createServerFn_handler };
