import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { C as require_jsx_runtime, S as useRouter, X as require_react, _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DVuXxYI6.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { n as assertSameSiteRequest } from "./isolation.server-BKF16Jvd.mjs";
import { n as CONNECTOR_TOKEN_READY_EVENT } from "./types-D3FEuKtl.mjs";
import { r as auth, t as requireUserId } from "./verify.server-DOT7e69R.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BXxjGaHL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-Bo4DkVMh.css";
var APP_NAME = "SusiAI Studio";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "SusiAI Studio — Chat, Code, Bilder und Video-Storyboards in einem Workspace."
			},
			{
				name: "theme-color",
				content: "#080a0f"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "de",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$2 = () => import("./routes-DbguTFva.mjs");
var Route$4 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./dashboard-DG_zdK-f.mjs");
var Route$3 = createFileRoute("/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./login-3txyP0lJ.mjs");
var Route$2 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$1 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var CHAT_MODEL = "grok-4.5";
var ASPECTS = /* @__PURE__ */ new Set([
	"1:1",
	"16:9",
	"9:16"
]);
var ACTIONS = /* @__PURE__ */ new Set([
	"explain",
	"fix",
	"optimize",
	"tests",
	"debug",
	"custom"
]);
function readKey() {
	return process.env.XAI_API_KEY;
}
function clip(value, max) {
	return typeof value === "string" ? value.slice(0, max) : "";
}
function prefsOf(input) {
	const prefs = input ?? {};
	return {
		language: clip(prefs.language, 40) || "Deutsch",
		tone: clip(prefs.tone, 80) || "Präzise",
		notes: clip(prefs.notes, 500)
	};
}
function systemPrompt(mode, prefs) {
	return [
		"Du bist SusiAI, die Assistentin in SusiAI Studio.",
		`Modus: ${mode}.`,
		`Sprache der Antwort: ${prefs.language}.`,
		`Ton: ${prefs.tone}.`,
		`Notizen des Nutzers: ${prefs.notes || "keine"}.`,
		"Antworte hilfreich, konkret und ohne Floskeln.",
		"Bei Code liefere vollständige Beispiele in Markdown-Codeblöcken.",
		"Erfinde keine API-Keys und keine privaten Daten."
	].join("\n");
}
var ENDPOINTS = {
	dahl: {
		url: "https://inference.dahl.global/v1/chat/completions",
		model: "MiniMaxAI/MiniMax-M2.7",
		label: "Dahl"
	},
	gonka: {
		url: "https://api.gonkarouter.io/v1/chat/completions",
		model: "MiniMaxAI/MiniMax-M2.7",
		label: "GonkaRouter"
	},
	sambanova: {
		url: "https://api.sambanova.ai/v1/chat/completions",
		model: "Meta-Llama-3.3-70B-Instruct",
		label: "SambaNova"
	}
};
function routeOf(input) {
	const data = (input ?? {}).route ?? {};
	return {
		provider: data.provider === "dahl" || data.provider === "gonka" || data.provider === "sambanova" ? data.provider : "grok",
		key: clip(data.key, 300),
		model: clip(data.model, 120)
	};
}
async function providerError(res, label) {
	let message = "";
	try {
		const body = await res.json();
		message = typeof body.error === "string" ? body.error : body.error?.message ?? "";
	} catch {
		message = "";
	}
	const text = message.toLowerCase();
	if (res.status === 402 || text.includes("exhausted") || text.includes("insufficient")) return label === "Dahl" ? "Dahl-Guthaben ist leer. Lege auf inference.dahl.global/account einen neuen Schlüssel an und ersetze ihn unter Anbindungen." : `${label}-Guthaben ist aufgebraucht. Trag unter Anbindungen einen neuen Schlüssel ein.`;
	if (res.status === 401) return `${label} hat den Schlüssel abgelehnt. Prüfe ihn unter Anbindungen.`;
	return message ? `${label}: ${message.slice(0, 160)}` : `${label} hat mit Status ${res.status} geantwortet.`;
}
async function openStudioStream(input, signal) {
	const bag = input ?? {};
	const route = routeOf(input);
	const prefs = prefsOf(input?.preferences);
	const kind = bag.kind === "code" ? "code" : "chat";
	let messages = [];
	let maxTokens = 900;
	if (kind === "code") {
		const action = ACTIONS.has(bag.action) ? bag.action : "explain";
		const path = clip(bag.path, 120) || "datei.txt";
		const content = clip(bag.content, 12e3);
		const instructionText = clip(bag.instruction, 2e3);
		const instruction = action === "explain" ? "Erkläre die Datei klar. Setze code auf null." : action === "fix" ? "Korrigiere Fehler. code ist die vollständige Datei." : action === "optimize" ? "Verbessere Lesbarkeit und Struktur, ohne das Verhalten zu ändern. code ist die vollständige Datei." : action === "tests" ? "Schreibe eine fokussierte Testdatei. code ist NUR die Testdatei." : action === "debug" ? "Finde den wahrscheinlichsten Fehler und liefere die korrigierte Datei in code." : instructionText || "Setze die Anweisung um. code ist die vollständige Datei, oder null wenn keine Änderung nötig ist.";
		messages = [{
			role: "system",
			content: [
				systemPrompt("code", prefs),
				"Antworte NUR mit JSON: {\"explanation\":\"kurz\",\"code\":null oder \"vollständiger Dateitext\"}.",
				"Kein Markdown außerhalb des JSON."
			].join("\n")
		}, {
			role: "user",
			content: `Datei: ${path}\nAktion: ${action}\n${instruction}\n\n---\n${content}`
		}];
		maxTokens = 1400;
	} else {
		const safe = (Array.isArray(bag.messages) ? bag.messages.slice(-12) : []).map((row) => {
			const message = row;
			const role = message.role === "assistant" ? "assistant" : message.role === "user" ? "user" : null;
			const content = clip(message.content, 6e3);
			if (!role || !content.trim()) return null;
			return {
				role,
				content
			};
		}).filter((row) => row !== null);
		if (!safe.length || safe[safe.length - 1]?.role !== "user") return Response.json({ error: "Nachricht fehlt." }, { status: 400 });
		const mode = clip(bag.mode, 24) || "chat";
		messages = [{
			role: "system",
			content: systemPrompt(mode, prefs)
		}, ...safe];
		maxTokens = mode === "agent" ? 1100 : 900;
	}
	const external = route.provider === "grok" ? null : ENDPOINTS[route.provider];
	const apiKey = external ? route.key.trim() : readKey();
	const label = external?.label ?? "SusiAI";
	if (!apiKey) return Response.json({ error: external ? `Schlüssel für ${label} fehlt. Trag ihn unter Anbindungen ein.` : "KI ist in dieser Umgebung nicht verfügbar." }, { status: 400 });
	const model = external ? route.model.trim() || external.model : CHAT_MODEL;
	let res;
	try {
		res = await fetch(external?.url ?? "https://api.x.ai/v1/chat/completions", {
			method: "POST",
			signal,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model,
				messages,
				max_tokens: maxTokens,
				temperature: .5,
				stream: true
			})
		});
	} catch {
		return Response.json({ error: "Die Anfrage hat zu lange gedauert oder ist fehlgeschlagen." }, { status: 504 });
	}
	if (!res.ok) return Response.json({ error: await providerError(res, label) }, { status: res.status });
	if (!(res.headers.get("content-type") ?? "").includes("text/event-stream")) {
		const text = (await res.json().catch(() => null))?.choices?.[0]?.message?.content ?? "";
		if (!text.trim()) return Response.json({ error: "Die KI hat keine Antwort geliefert." }, { status: 502 });
		return new Response(text, { headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"X-Studio-Model": model
		} });
	}
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const upstream = res.body;
	if (!upstream) return Response.json({ error: "Die KI hat keine Antwort geliefert." }, { status: 502 });
	const stream = new ReadableStream({ async start(controller) {
		const reader = upstream.getReader();
		let buffer = "";
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed.startsWith("data:")) continue;
					const payload = trimmed.slice(5).trim();
					if (!payload || payload === "[DONE]") continue;
					try {
						const delta = JSON.parse(payload).choices?.[0]?.delta?.content ?? "";
						if (delta) controller.enqueue(encoder.encode(delta));
					} catch {}
				}
			}
			controller.close();
		} catch (error) {
			controller.error(error);
		}
	} });
	return new Response(stream, { headers: {
		"Content-Type": "text/plain; charset=utf-8",
		"Cache-Control": "no-cache",
		"X-Studio-Model": model
	} });
}
var studioHealth = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3f12d3b5daae56e18f96f8cbcbe0714ebb06c8be1e3207016f53a788cbd16e04"));
var askStudio = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const safe = (Array.isArray(data.messages) ? data.messages.slice(-12) : []).map((m) => {
		const row = m;
		const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
		const content = clip(row.content, 6e3);
		if (!role || !content.trim()) return null;
		return {
			role,
			content
		};
	}).filter((m) => m !== null);
	return {
		mode: clip(data.mode, 24) || "chat",
		messages: safe,
		preferences: prefsOf(data.preferences),
		route: routeOf(input)
	};
}).handler(createSsrRpc("104fae29e9363c75fe7dd83e380eb5f1166f5f8139f0c3a4a1426c62cffb233e"));
var generateStudioImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const aspect = ASPECTS.has(clip(data.aspect, 8)) ? clip(data.aspect, 8) : "1:1";
	const style = clip(data.style, 24);
	return {
		prompt: clip(data.prompt, 1200).trim(),
		style,
		aspect
	};
}).handler(createSsrRpc("a5ed83bf093f40bb0b0d19874c0852366b84d57752b5a99b9d8c9fd1ce43943e"));
var generateStoryboard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const aspect = ASPECTS.has(clip(data.aspect, 8)) ? clip(data.aspect, 8) : "16:9";
	const duration = data.duration === 6 || data.duration === 10 || data.duration === 15 ? data.duration : 10;
	return {
		prompt: clip(data.prompt, 1200).trim(),
		aspect,
		duration,
		route: routeOf(input)
	};
}).handler(createSsrRpc("e601ccdc6dadb5fca9a803c9f0761607c6896fb7fa66a78d59565c09e096b95a"));
function parseCodeReply(text, action) {
	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	const raw = (fenced ? fenced[1] : text).trim();
	try {
		const parsed = JSON.parse(raw);
		return {
			explanation: clip(parsed.explanation, 4e3) || "Fertig.",
			code: action === "explain" ? null : typeof parsed.code === "string" ? parsed.code : null
		};
	} catch {
		const block = text.match(/```[\w-]*\n([\s\S]*?)```/);
		return {
			explanation: text.slice(0, 4e3),
			code: action === "explain" ? null : block ? block[1] : null
		};
	}
}
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		action: ACTIONS.has(data.action) ? data.action : "explain",
		path: clip(data.path, 120) || "datei.txt",
		content: clip(data.content, 12e3),
		instruction: clip(data.instruction, 2e3),
		preferences: prefsOf(data.preferences),
		route: routeOf(input)
	};
}).handler(createSsrRpc("a98c7cb21212b3c717ab44977ed40fde0acbb8c74337fc1b2091b6d163e0ee6f"));
var Route = createFileRoute("/api/studio/stream")({ server: { handlers: { POST: async ({ request }) => {
	try {
		assertSameSiteRequest();
		const header = request.headers.get("authorization") ?? "";
		const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : void 0;
		await requireUserId(bearer);
	} catch {
		return Response.json({ error: "Bitte zuerst anmelden." }, { status: 401 });
	}
	return openStudioStream(await request.json().catch(() => null), request.signal);
} } } });
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	DashboardRoute: Route$3.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => Route$5
	}),
	LoginRoute: Route$2.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$5
	}),
	ApiAuthSplatRoute: Route$1.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$5
	}),
	ApiStudioStreamRoute: Route.update({
		id: "/api/studio/stream",
		path: "/api/studio/stream",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { parseCodeReply as a, generateStudioImage as i, askStudio as n, studioHealth as o, generateStoryboard as r, router_exports as t };
