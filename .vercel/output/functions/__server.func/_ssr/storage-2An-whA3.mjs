import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DVuXxYI6.mjs";
import { a as signOut } from "./client-Hb_FAdbz.mjs";
import { t as useCurrentUser } from "./use-current-user-Bh_x61Ff.mjs";
import { i as hasGateSessionMarker } from "./verify.server-DOT7e69R.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/storage-2An-whA3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Abmelden…" : "Abmelden"
			})
		]
	});
}
function projectForAccount(project) {
	return {
		...project,
		name: project.name.slice(0, 80),
		messages: project.messages.slice(-80).map((message) => ({
			...message,
			content: message.content.slice(0, 6e3)
		})),
		files: project.files.slice(0, 24).map((file) => ({
			path: file.path.slice(0, 120),
			content: file.content.slice(0, 6e4)
		})),
		images: project.images.slice(-8).map((image) => ({
			...image,
			prompt: image.prompt.slice(0, 500),
			url: image.url.startsWith("https://") && image.url.length <= 300 ? image.url : ""
		}))
	};
}
function restoreImages(remote, local) {
	const localImages = new Map(local.images.map((image) => [image.id, image]));
	return {
		...remote,
		images: remote.images.map((image) => {
			if (image.url) return image;
			const previous = localImages.get(image.id);
			return previous?.url ? {
				...image,
				url: previous.url
			} : image;
		})
	};
}
function mergeAccountProjects(local, remote) {
	const byId = new Map(local.map((project) => [project.id, project]));
	for (const project of remote) {
		const current = byId.get(project.id);
		if (!current || project.updatedAt > current.updatedAt) byId.set(project.id, current ? restoreImages(project, current) : project);
	}
	const projects = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20);
	const remoteById = new Map(remote.map((project) => [project.id, project]));
	return {
		projects,
		push: projects.filter((project) => {
			const current = remoteById.get(project.id);
			return !current || project.updatedAt > current.updatedAt;
		})
	};
}
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
var listStudioProjects = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4e27e81de1719bcaf4773de3cefb3b027d4f442592d7c928d2534263563cfe9f"));
var saveStudioProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => projectFromUnknown(input)).handler(createSsrRpc("2070b8fbe5da387b5bbd613741ab21d23719c4ae16aff0b30a746ea8815d26d1"));
var deleteStudioProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = clip(input?.id, 80);
	if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) throw new Error("Projekt-ID ungültig.");
	return { id };
}).handler(createSsrRpc("aad44d343010c820e33d9ea9d12f256f5db5a17e6903a82d5e013c58f1b71a34"));
var KEY = "susiai-studio-v1";
var DEFAULT_PREFS = {
	language: "Deutsch",
	tone: "Präzise",
	notes: ""
};
var DEFAULT_LINKS = {
	provider: "grok",
	dahlKey: "",
	dahlModel: "MiniMaxAI/MiniMax-M2.7",
	gonkaKey: "",
	gonkaModel: "MiniMaxAI/MiniMax-M2.7",
	sambanovaKey: "",
	sambanovaModel: "Meta-Llama-3.3-70B-Instruct",
	codekitKey: "",
	githubToken: "",
	appUrl: "",
	mcp: []
};
function defaultFiles() {
	return [
		{
			path: "src/page.tsx",
			content: `export default function Home() {
  return (
    <main className="hero">
      <h1>Build with SusiAI</h1>
      <p>Multimodale AI Creation Platform</p>
      <button>Start creating</button>
    </main>
  );
}
`
		},
		{
			path: "src/styles.css",
			content: `body {
  margin: 0;
  font-family: Outfit, sans-serif;
  background: #080a0f;
  color: #e9edf5;
}

.hero {
  min-height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
}

button {
  background: #8b6cff;
  color: #f6f3ff;
  border: 0;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 700;
}
`
		},
		{
			path: "preview.html",
			content: `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <title>SusiAI Preview</title>
    <style>
      body { margin: 0; font-family: Outfit, sans-serif; background: #080a0f; color: #e9edf5; }
      main { min-height: 100vh; display: grid; place-items: center; text-align: center; padding: 24px; }
      h1 { font-size: 40px; letter-spacing: -0.04em; margin: 0 0 8px; }
      p { color: #8d97aa; }
      button { background: #8b6cff; color: #f6f3ff; border: 0; border-radius: 12px; padding: 12px 18px; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <div>
        <h1>Build with SusiAI</h1>
        <p>Multimodale AI Creation Platform</p>
        <button>Start creating</button>
      </div>
    </main>
  </body>
</html>
`
		},
		{
			path: "README.md",
			content: `# SusiAI Lab

Dieses Projekt lebt lokal in deinem Browser.
Frag SusiAI im Code-Studio nach Erklärungen, Fixes oder Tests.
`
		}
	];
}
function makeProject(name) {
	const files = defaultFiles();
	return {
		id: crypto.randomUUID(),
		name,
		updatedAt: Date.now(),
		messages: [],
		files,
		activePath: files[0].path,
		images: [],
		storyboard: null
	};
}
function freshState() {
	const project = makeProject("SusiAI Lab");
	return {
		activeId: project.id,
		prefs: { ...DEFAULT_PREFS },
		projects: [project],
		links: {
			...DEFAULT_LINKS,
			mcp: []
		}
	};
}
function normalizeProject(input) {
	const files = Array.isArray(input.files) && input.files.length > 0 ? input.files.filter((f) => f && typeof f.path === "string" && typeof f.content === "string") : defaultFiles();
	const safeFiles = files.length ? files : defaultFiles();
	const activePath = safeFiles.some((f) => f.path === input.activePath) ? input.activePath : safeFiles[0].path;
	return {
		id: typeof input.id === "string" ? input.id : crypto.randomUUID(),
		name: typeof input.name === "string" && input.name.trim() ? input.name : "Projekt",
		updatedAt: typeof input.updatedAt === "number" ? input.updatedAt : Date.now(),
		messages: Array.isArray(input.messages) ? input.messages : [],
		files: safeFiles,
		activePath,
		images: Array.isArray(input.images) ? input.images : [],
		storyboard: input.storyboard && Array.isArray(input.storyboard.scenes) ? input.storyboard : null
	};
}
function normalizeLinks(input) {
	const provider = [
		"grok",
		"dahl",
		"gonka",
		"sambanova"
	].includes(input?.provider) ? input?.provider : "grok";
	const mcp = Array.isArray(input?.mcp) ? input.mcp.filter((item) => Boolean(item && typeof item.id === "string" && typeof item.url === "string")).slice(0, 12).map((item) => ({
		id: item.id,
		name: typeof item.name === "string" && item.name.trim() ? item.name.slice(0, 60) : "MCP",
		url: item.url.slice(0, 300),
		token: typeof item.token === "string" ? item.token.slice(0, 300) : ""
	})) : [];
	return {
		provider,
		dahlKey: typeof input?.dahlKey === "string" ? input.dahlKey.slice(0, 300) : "",
		dahlModel: typeof input?.dahlModel === "string" && input.dahlModel.trim() ? input.dahlModel.slice(0, 120) : DEFAULT_LINKS.dahlModel,
		gonkaKey: typeof input?.gonkaKey === "string" ? input.gonkaKey.slice(0, 300) : "",
		gonkaModel: typeof input?.gonkaModel === "string" && input.gonkaModel.trim() ? input.gonkaModel.slice(0, 120) : DEFAULT_LINKS.gonkaModel,
		sambanovaKey: typeof input?.sambanovaKey === "string" ? input.sambanovaKey.slice(0, 300) : "",
		sambanovaModel: typeof input?.sambanovaModel === "string" && input.sambanovaModel.trim() ? input.sambanovaModel.slice(0, 120) : DEFAULT_LINKS.sambanovaModel,
		codekitKey: typeof input?.codekitKey === "string" ? input.codekitKey.slice(0, 300) : "",
		githubToken: typeof input?.githubToken === "string" ? input.githubToken.slice(0, 400) : "",
		appUrl: typeof input?.appUrl === "string" ? input.appUrl.slice(0, 300) : "",
		mcp
	};
}
function routeFromLinks(links) {
	if (links.provider === "dahl") return {
		provider: links.provider,
		key: links.dahlKey,
		model: links.dahlModel
	};
	if (links.provider === "gonka") return {
		provider: links.provider,
		key: links.gonkaKey,
		model: links.gonkaModel
	};
	if (links.provider === "sambanova") return {
		provider: links.provider,
		key: links.sambanovaKey,
		model: links.sambanovaModel
	};
	return {
		provider: "grok",
		key: "",
		model: ""
	};
}
function providerLabel(provider) {
	if (provider === "dahl") return "Dahl";
	if (provider === "gonka") return "GonkaRouter";
	if (provider === "sambanova") return "SambaNova";
	return "SusiAI";
}
function loadState() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!data || !Array.isArray(data.projects) || data.projects.length === 0) return null;
		const projects = data.projects.map((p) => normalizeProject(p));
		return {
			activeId: projects.some((p) => p.id === data.activeId) ? data.activeId : projects[0].id,
			prefs: {
				language: typeof data.prefs?.language === "string" ? data.prefs.language : DEFAULT_PREFS.language,
				tone: typeof data.prefs?.tone === "string" ? data.prefs.tone : DEFAULT_PREFS.tone,
				notes: typeof data.prefs?.notes === "string" ? data.prefs.notes : ""
			},
			projects,
			links: normalizeLinks(data.links)
		};
	} catch {
		return null;
	}
}
function saveState(state) {
	queue = queue.then(() => writeState(state)).catch(() => void 0);
}
var queue = Promise.resolve();
async function writeState(state) {
	const projects = [];
	for (const project of state.projects.slice(0, 20)) {
		const images = [];
		for (const image of project.images.slice(-8)) {
			if (!image.url || image.url.startsWith("idb:") || image.url.length <= 180) {
				images.push(image);
				continue;
			}
			try {
				await putImage(image.id, image.url);
				images.push({
					...image,
					url: `idb:${image.id}`
				});
			} catch {
				images.push({
					...image,
					url: image.url.slice(0, 180)
				});
			}
		}
		projects.push({
			...project,
			messages: project.messages.slice(-80),
			images,
			files: project.files.slice(0, 24).map((file) => ({
				path: file.path,
				content: file.content.slice(0, 6e4)
			}))
		});
	}
	try {
		localStorage.setItem(KEY, JSON.stringify({
			...state,
			projects
		}));
	} catch {}
}
function imageDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("susiai-studio", 1);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains("images")) request.result.createObjectStore("images");
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
function putImage(id, url) {
	return imageDb().then((db) => new Promise((resolve, reject) => {
		const tx = db.transaction("images", "readwrite");
		tx.objectStore("images").put(url, id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	}));
}
function readImage(id) {
	return imageDb().then((db) => new Promise((resolve, reject) => {
		const request = db.transaction("images", "readonly").objectStore("images").get(id);
		request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : null);
		request.onerror = () => reject(request.error);
	}));
}
async function hydrateImages(state) {
	const projects = await Promise.all(state.projects.map(async (project) => ({
		...project,
		images: await Promise.all(project.images.map(async (image) => {
			if (!image.url.startsWith("idb:")) return image;
			const url = await readImage(image.url.slice(4)).catch(() => null);
			return url ? {
				...image,
				url
			} : image;
		}))
	})));
	return {
		...state,
		projects
	};
}
//#endregion
export { listStudioProjects as a, mergeAccountProjects as c, routeFromLinks as d, saveState as f, hydrateImages as i, projectForAccount as l, deleteStudioProject as n, loadState as o, saveStudioProject as p, freshState as r, makeProject as s, UserButton as t, providerLabel as u };
