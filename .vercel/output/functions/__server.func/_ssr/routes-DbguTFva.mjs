import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Navigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DVuXxYI6.mjs";
import { r as getBearerToken } from "./client-Hb_FAdbz.mjs";
import { n as useCurrentUserState } from "./use-current-user-Bh_x61Ff.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { a as listStudioProjects, c as mergeAccountProjects, d as routeFromLinks, f as saveState, i as hydrateImages, l as projectForAccount, n as deleteStudioProject, o as loadState, p as saveStudioProject, r as freshState, s as makeProject, t as UserButton, u as providerLabel } from "./storage-2An-whA3.mjs";
import { A as Bot, C as Film, D as CircleHelp, E as CodeXml, O as Check, S as FolderOpen, T as Copy, _ as MessageSquare, a as TestTubeDiagonal, b as Image, c as Settings, d as Plug, f as Plus, g as Mic, h as Paperclip, i as Trash2, k as Bug, l as Send, m as Pencil, n as WandSparkles, o as Square, p as Play, s as Sparkles, t as X, u as Search, v as Menu, w as Download, x as History, y as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { a as parseCodeReply, i as generateStudioImage, n as askStudio, o as studioHealth, r as generateStoryboard } from "./router-BXxjGaHL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DbguTFva.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function clip(value, max) {
	return typeof value === "string" ? value.slice(0, max) : "";
}
var listRemoteModels = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		provider: data.provider === "gonka" ? "gonka" : data.provider === "sambanova" ? "sambanova" : "dahl",
		key: clip(data.key, 300)
	};
}).handler(createSsrRpc("8ff7c5403f7dccaa6260d5a781323edde1faca6e83545ff50510c0ea3fa30e91"));
var dahlBalance = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { key: clip((input ?? {}).key, 300) };
}).handler(createSsrRpc("fb1ef6a035c9b1b883cdccf71dc4a62d01d34393cdc1ee1f64ff918a009019f1"));
var probeCodekit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { key: clip((input ?? {}).key, 300) };
}).handler(createSsrRpc("ccb7df1537186240f9e7e3e56ec0f63026e825d2920268cc8c0aab5cc350ec55"));
var probeGithub = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { token: clip((input ?? {}).token, 400) };
}).handler(createSsrRpc("d51ea6c6d401635fdc651c02072b264e06e0b4be629a0feac63e58262d142b94"));
var probeMcpServer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		url: clip(data.url, 300),
		token: clip(data.token, 300)
	};
}).handler(createSsrRpc("e3bbdd6d5bf71cd641b0c342ec5085386c41e0fbeea2241401cfb24d8a809dd6"));
var probePlatformLinks = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("a1f7cd54115a8e8a7e5effe0d03ce964d854ace09464900d4b7ee8d295078676"));
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
}).handler(createSsrRpc("e4d8efcfe1e13ee52aa92c2a65dd5a620ef0485ebfd815cdef8bb637fed55825"));
async function consumeStudioStream(body, signal, onDelta) {
	const token = getBearerToken();
	const res = await fetch("/api/studio/stream", {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
			...token ? { Authorization: `Bearer ${token}` } : {}
		},
		body: JSON.stringify(body),
		signal
	});
	const type = res.headers.get("content-type") ?? "";
	if (!res.ok || type.includes("application/json")) return {
		ok: false,
		text: "",
		error: (await res.json().catch(() => null))?.error || `Status ${res.status}`
	};
	const reader = res.body?.getReader();
	if (!reader) return {
		ok: false,
		text: "",
		error: "Die KI hat keine Antwort geliefert."
	};
	const decoder = new TextDecoder();
	let text = "";
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		text += decoder.decode(value, { stream: true });
		if (text) onDelta(text);
	}
	if (!text.trim()) return {
		ok: false,
		text: "",
		error: "Die KI hat keine Antwort geliefert."
	};
	return {
		ok: true,
		text,
		error: ""
	};
}
var modelCache = {};
var PLATFORM = [
	{
		id: "GoogleDrive",
		label: "Google Drive",
		detail: "Dateien suchen"
	},
	{
		id: "Gmail",
		label: "Gmail",
		detail: "Postfach"
	},
	{
		id: "GoogleCalendar",
		label: "Google Kalender",
		detail: "Termine"
	},
	{
		id: "Outlook",
		label: "Outlook",
		detail: "Mail"
	},
	{
		id: "OutlookCalendar",
		label: "Outlook Kalender",
		detail: "Termine"
	},
	{
		id: "MicrosoftTeams",
		label: "Microsoft Teams",
		detail: "Chats"
	},
	{
		id: "Mcp",
		label: "MCP-Katalog",
		detail: "Server aus dem Grok-Konto"
	}
];
function LinksPane({ links, prefs, grokReady, onChange }) {
	const [dahlModels, setDahlModels] = (0, import_react.useState)([]);
	const [gonkaModels, setGonkaModels] = (0, import_react.useState)([]);
	const [sambaModels, setSambaModels] = (0, import_react.useState)([]);
	const [codekitNote, setCodekitNote] = (0, import_react.useState)("");
	const [githubLogin, setGithubLogin] = (0, import_react.useState)("");
	const [repos, setRepos] = (0, import_react.useState)([]);
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)("");
	const [mcpName, setMcpName] = (0, import_react.useState)("");
	const [mcpUrl, setMcpUrl] = (0, import_react.useState)("");
	const [mcpToken, setMcpToken] = (0, import_react.useState)("");
	const [tools, setTools] = (0, import_react.useState)({});
	const [gate, setGate] = (0, import_react.useState)("");
	const [checks, setChecks] = (0, import_react.useState)({});
	const [catalogId, setCatalogId] = (0, import_react.useState)("");
	const [catalogTool, setCatalogTool] = (0, import_react.useState)("");
	const [catalogArgs, setCatalogArgs] = (0, import_react.useState)("{}");
	const [catalogNote, setCatalogNote] = (0, import_react.useState)("");
	const [tab, setTab] = (0, import_react.useState)("modelle");
	const [dahlTokens, setDahlTokens] = (0, import_react.useState)(null);
	const [dahlNote, setDahlNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (modelCache.dahl) setDahlModels(modelCache.dahl);
		else listRemoteModels({ data: {
			provider: "dahl",
			key: ""
		} }).then((result) => {
			if (result.ok) {
				modelCache.dahl = result.models;
				setDahlModels(result.models);
			}
		}).catch(() => void 0);
		if (modelCache.sambanova) setSambaModels(modelCache.sambanova);
		else listRemoteModels({ data: {
			provider: "sambanova",
			key: ""
		} }).then((result) => {
			if (result.ok) {
				modelCache.sambanova = result.models;
				setSambaModels(result.models);
			}
		}).catch(() => void 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const key = links.dahlKey.trim();
		if (key.length < 8) {
			setDahlTokens(null);
			setDahlNote("");
			return;
		}
		let cancelled = false;
		const timer = setTimeout(() => {
			dahlBalance({ data: { key } }).then((result) => {
				if (cancelled) return;
				setDahlTokens(result.tokens);
				setDahlNote(result.ok ? "" : result.error);
			}).catch(() => {
				if (!cancelled) setDahlNote("Kontostand nicht erreichbar.");
			});
		}, 500);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [links.dahlKey]);
	function routeFor(provider) {
		return routeFromLinks({
			...links,
			provider
		});
	}
	async function testProvider(provider) {
		setBusy(provider);
		setNote("");
		try {
			const result = await askStudio({ data: {
				mode: "chat",
				messages: [{
					role: "user",
					content: "Antworte nur mit OK."
				}],
				preferences: prefs,
				route: routeFor(provider)
			} });
			setNote(result.ok ? `${label(provider)} antwortet.` : result.error);
		} catch {
			setNote("Prüfung fehlgeschlagen.");
		} finally {
			setBusy("");
		}
	}
	async function loadGonka() {
		setBusy("gonka-models");
		try {
			const result = await listRemoteModels({ data: {
				provider: "gonka",
				key: links.gonkaKey
			} });
			if (!result.ok) setNote(result.error);
			else {
				setGonkaModels(result.models);
				if (!result.models.includes(links.gonkaModel)) onChange({
					...links,
					gonkaModel: result.models[0]
				});
			}
		} finally {
			setBusy("");
		}
	}
	async function checkMcp(item) {
		setBusy(item.id);
		const result = await probeMcpServer({ data: {
			url: item.url,
			token: item.token
		} });
		setTools((current) => ({
			...current,
			[item.id]: result.ok ? result.tools.map((tool) => tool.name) : []
		}));
		setNote(result.ok ? `${result.tools.length} Werkzeuge von ${item.name}.` : result.error);
		setBusy("");
	}
	async function checkCodekit() {
		setBusy("codekit");
		setCodekitNote("");
		try {
			const result = await probeCodekit({ data: { key: links.codekitKey } });
			setCodekitNote(result.ok ? "0CodeKit ist verbunden." : result.error);
		} catch {
			setCodekitNote("Prüfung fehlgeschlagen.");
		} finally {
			setBusy("");
		}
	}
	async function checkGithub() {
		setBusy("github");
		try {
			const result = await probeGithub({ data: { token: links.githubToken } });
			setGithubLogin(result.ok ? result.login : "");
			setRepos(result.ok ? result.repos : []);
			setNote(result.ok ? `GitHub: ${result.login}` : result.error);
		} catch {
			setNote("GitHub-Prüfung fehlgeschlagen.");
		} finally {
			setBusy("");
		}
	}
	async function checkGate() {
		setBusy("gate");
		try {
			const result = await probePlatformLinks();
			setGate(result.tokenReady ? "Grok-Token vorhanden." : "Noch kein Connector-Token. In der Grok-Vorschau erscheint es automatisch.");
			setChecks({
				GoogleDrive: result.checks.GoogleDrive.message,
				GoogleCalendar: result.checks.GoogleCalendar.message
			});
		} catch {
			setGate("Status gerade nicht prüfbar.");
		} finally {
			setBusy("");
		}
	}
	async function runCatalog() {
		setBusy("catalog");
		setCatalogNote("");
		try {
			const result = await callCatalogTool({ data: {
				catalogId,
				tool: catalogTool,
				args: catalogArgs
			} });
			setCatalogNote(result.ok ? result.preview || result.message : result.message);
		} catch {
			setCatalogNote("Aufruf fehlgeschlagen.");
		} finally {
			setBusy("");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-0 flex-1 overflow-y-auto p-4 sm:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-3xl flex-col gap-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "Anbindungen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Chat, Code und Storyboards laufen über die aktive Verbindung. Schlüssel bleiben in diesem Browser."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 rounded-xl bg-bg p-1",
					children: [
						["modelle", "Modelle"],
						["werkzeuge", "Werkzeuge"],
						["grok", "Grok"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `h-10 rounded-lg text-sm font-semibold ${tab === id ? "bg-raised text-fg" : "text-muted"}`,
						onClick: () => setTab(id),
						children: label
					}, id))
				}),
				tab === "modelle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderCard, {
							title: "SusiAI",
							detail: "Grok über die eingebaute Verbindung",
							active: links.provider === "grok",
							status: grokReady === null ? "Prüfe…" : grokReady ? "Bereit" : "Offline",
							onSelect: () => onChange({
								...links,
								provider: "grok"
							}),
							onTest: () => testProvider("grok"),
							testing: busy === "grok"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProviderCard, {
							title: "Dahl",
							detail: "inference.dahl.global",
							active: links.provider === "dahl",
							status: !links.dahlKey.trim() ? "Schlüssel fehlt" : dahlTokens === 0 ? "Guthaben leer" : dahlTokens != null ? `${new Intl.NumberFormat("de-DE").format(dahlTokens)} Tokens` : "Schlüssel gesetzt",
							onSelect: () => onChange({
								...links,
								provider: "dahl"
							}),
							onTest: () => testProvider("dahl"),
							testing: busy === "dahl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secret, {
									label: "Dahl API-Schlüssel",
									value: links.dahlKey,
									onChange: (dahlKey) => onChange({
										...links,
										dahlKey
									})
								}),
								dahlNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-danger",
									children: dahlNote
								}),
								dahlTokens === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "text-sm text-primary underline",
									href: "https://inference.dahl.global/account",
									target: "_blank",
									rel: "noreferrer",
									children: "Neuen Schlüssel anlegen"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelPick, {
									value: links.dahlModel,
									models: dahlModels,
									onChange: (dahlModel) => onChange({
										...links,
										dahlModel
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProviderCard, {
							title: "GonkaRouter",
							detail: "api.gonkarouter.io",
							active: links.provider === "gonka",
							status: links.gonkaKey.trim() ? "Schlüssel gesetzt" : "Schlüssel fehlt",
							onSelect: () => onChange({
								...links,
								provider: "gonka"
							}),
							onTest: () => testProvider("gonka"),
							testing: busy === "gonka",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secret, {
								label: "GonkaRouter API-Schlüssel",
								value: links.gonkaKey,
								onChange: (gonkaKey) => onChange({
									...links,
									gonkaKey
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelPick, {
									value: links.gonkaModel,
									models: gonkaModels,
									onChange: (gonkaModel) => onChange({
										...links,
										gonkaModel
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "h-10 rounded-xl border border-line px-3 text-sm",
									onClick: loadGonka,
									disabled: busy === "gonka-models",
									children: "Modelle laden"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProviderCard, {
							title: "SambaNova Cloud",
							detail: "api.sambanova.ai",
							active: links.provider === "sambanova",
							status: links.sambanovaKey.trim() ? "Schlüssel gesetzt" : "Schlüssel fehlt",
							onSelect: () => onChange({
								...links,
								provider: "sambanova"
							}),
							onTest: () => testProvider("sambanova"),
							testing: busy === "sambanova",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secret, {
									label: "SambaNova API-Schlüssel",
									value: links.sambanovaKey,
									onChange: (sambanovaKey) => onChange({
										...links,
										sambanovaKey
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelPick, {
									value: links.sambanovaModel,
									models: sambaModels,
									onChange: (sambanovaModel) => onChange({
										...links,
										sambanovaModel
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "text-sm text-primary underline",
									href: "https://cloud.sambanova.ai/apis",
									target: "_blank",
									rel: "noreferrer",
									children: "Schlüssel erstellen"
								})
							]
						})
					]
				}), note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: note
				})] }),
				tab === "werkzeuge" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plug, {
								size: 16,
								className: "text-primary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: "MCP-Server"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Streamable HTTP. Die Prüfung listet Werkzeuge, sie ruft sie nicht auf."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-2 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: mcpName,
									onChange: (e) => setMcpName(e.target.value),
									placeholder: "Name",
									className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: mcpUrl,
									onChange: (e) => setMcpUrl(e.target.value),
									placeholder: "https://…/mcp",
									className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: mcpToken,
									onChange: (e) => setMcpToken(e.target.value),
									placeholder: "Optionaler Bearer-Token",
									type: "password",
									autoComplete: "off",
									className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none sm:col-span-2"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "mt-3 h-11 rounded-xl bg-primary px-4 font-semibold text-primary-fg disabled:opacity-40",
							disabled: !mcpUrl.trim(),
							onClick: () => {
								const item = {
									id: crypto.randomUUID(),
									name: mcpName.trim() || "MCP",
									url: mcpUrl.trim(),
									token: mcpToken.trim()
								};
								onChange({
									...links,
									mcp: [item, ...links.mcp].slice(0, 12)
								});
								setMcpName("");
								setMcpUrl("");
								setMcpToken("");
							},
							children: "Server hinzufügen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-2",
							children: [links.mcp.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Noch kein MCP-Server."
							}), links.mcp.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-xl border border-line bg-bg p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold",
												children: item.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate text-sm text-muted",
												children: item.url
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											"aria-label": "MCP entfernen",
											className: "grid size-10 place-items-center text-muted hover:text-danger",
											onClick: () => onChange({
												...links,
												mcp: links.mcp.filter((row) => row.id !== item.id)
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "mt-2 h-10 rounded-xl border border-line px-3 text-sm",
										disabled: busy === item.id,
										onClick: () => checkMcp(item),
										children: busy === item.id ? "Prüfe…" : "Werkzeuge laden"
									}),
									tools[item.id] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted",
										children: tools[item.id].length ? tools[item.id].join(", ") : "Keine Werkzeuge gemeldet."
									})
								]
							}, item.id))]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold",
							children: "Werkzeug-Connectoren"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Schlüssel und Tokens bleiben in diesem Browser und werden nicht als Chat-Modell benutzt."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-xl border border-line bg-bg p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold",
											children: "0CodeKit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "prod.0codekit.com · Code, PDF und Automatisierung"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex flex-col gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secret, {
													label: "0CodeKit API-Schlüssel",
													value: links.codekitKey,
													onChange: (codekitKey) => onChange({
														...links,
														codekitKey
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-wrap items-center gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														className: "h-10 rounded-xl border border-line px-3 text-sm",
														disabled: busy === "codekit",
														onClick: checkCodekit,
														children: busy === "codekit" ? "Prüfe…" : "Prüfen"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														className: "text-sm text-primary underline",
														href: "https://www.0codekit.com",
														target: "_blank",
														rel: "noreferrer",
														children: "Konto"
													})]
												}),
												codekitNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm text-muted",
													children: codekitNote
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-xl border border-line bg-bg p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold",
											children: "GitHub"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: githubLogin ? `Angemeldet als ${githubLogin}` : "Personal Access Token mit Leserecht"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex flex-col gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secret, {
													label: "GitHub-Token",
													value: links.githubToken,
													onChange: (githubToken) => onChange({
														...links,
														githubToken
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-wrap items-center gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														className: "h-10 rounded-xl border border-line px-3 text-sm",
														disabled: busy === "github",
														onClick: checkGithub,
														children: busy === "github" ? "Lade…" : "Konto laden"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														className: "text-sm text-primary underline",
														href: "https://github.com/settings/tokens",
														target: "_blank",
														rel: "noreferrer",
														children: "Token erstellen"
													})]
												}),
												repos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
													className: "flex flex-col gap-1 text-sm",
													children: repos.map((repo) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														className: "text-primary underline",
														href: repo.htmlUrl,
														target: "_blank",
														rel: "noreferrer",
														children: repo.fullName
													}) }, repo.fullName))
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-xl border border-line bg-bg p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold",
											children: "AppDeploy"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "Veröffentlichte Apps im Dashboard. Die gemerkte URL bleibt lokal."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex flex-col gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: links.appUrl,
												onChange: (e) => onChange({
													...links,
													appUrl: e.target.value
												}),
												placeholder: "https://….appdeploy.ai",
												"aria-label": "AppDeploy URL",
												className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													className: "text-sm text-primary underline",
													href: "https://dashboard.appdeploy.ai",
													target: "_blank",
													rel: "noreferrer",
													children: "Dashboard öffnen"
												}), safeHttps(links.appUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													className: "text-sm text-primary underline",
													href: safeHttps(links.appUrl),
													target: "_blank",
													rel: "noreferrer",
													children: "App öffnen"
												})]
											})]
										})
									]
								})
							]
						})
					]
				})] }),
				tab === "grok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: "Grok-Connectors"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "h-10 rounded-xl border border-line px-3 text-sm",
								onClick: checkGate,
								disabled: busy === "gate",
								children: busy === "gate" ? "Prüfe…" : "Status prüfen"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Drive, Gmail, Kalender, Outlook, Teams und MCP-Katalog laufen über das Grok-Konto."
						}),
						gate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: gate
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid gap-2 sm:grid-cols-2",
							children: PLATFORM.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-xl border border-line bg-bg px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-muted",
									children: checks[item.id] || item.detail
								})]
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs tracking-widest text-faint",
									children: "MCP-KATALOG AUFRUFEN"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: catalogId,
									onChange: (e) => setCatalogId(e.target.value),
									placeholder: "Katalog-ID",
									className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: catalogTool,
									onChange: (e) => setCatalogTool(e.target.value),
									placeholder: "Werkzeugname",
									className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: catalogArgs,
									onChange: (e) => setCatalogArgs(e.target.value),
									rows: 3,
									className: "rounded-xl border border-line bg-bg p-3 font-mono text-sm outline-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "h-11 w-fit rounded-xl border border-line px-4 text-sm",
									disabled: busy === "catalog",
									onClick: runCatalog,
									children: busy === "catalog" ? "Rufe auf…" : "Werkzeug aufrufen"
								}),
								catalogNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "break-words text-sm text-muted",
									children: catalogNote
								})
							]
						})
					]
				}) })
			]
		})
	});
}
function label(provider) {
	return providerLabel(provider);
}
function safeHttps(value) {
	try {
		const url = new URL(value.trim());
		return url.protocol === "https:" ? url.toString() : "";
	} catch {
		return "";
	}
}
function ProviderCard({ title, detail, active, status, onSelect, onTest, testing, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: `rounded-2xl border p-4 ${active ? "border-primary bg-surface" : "border-line bg-surface"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: detail
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-faint",
					children: status
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: `h-10 rounded-xl px-3 text-sm ${active ? "bg-primary text-primary-fg" : "border border-line"}`,
					onClick: onSelect,
					children: active ? "Aktiv" : "Nutzen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "h-10 rounded-xl border border-line px-3 text-sm",
					onClick: onTest,
					disabled: testing,
					children: testing ? "…" : "Prüfen"
				})]
			})]
		}), children && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex flex-col gap-2",
			children
		})]
	});
}
function Secret({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type: "password",
		autoComplete: "off",
		"aria-label": label,
		value,
		placeholder: label,
		onChange: (e) => onChange(e.target.value),
		className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
	});
}
function ModelPick({ value, models, onChange }) {
	if (!models.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		value,
		onChange: (e) => onChange(e.target.value),
		"aria-label": "Modell",
		className: "h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 outline-none"
	});
	const options = models.includes(value) ? models : [value, ...models];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		value,
		onChange: (e) => onChange(e.target.value),
		"aria-label": "Modell",
		className: "h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 outline-none",
		children: options.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: model,
			children: model
		}, model))
	});
}
var MODES = [
	{
		id: "chat",
		label: "Chat",
		icon: MessageSquare
	},
	{
		id: "code",
		label: "Code",
		icon: CodeXml
	},
	{
		id: "image",
		label: "Image Studio",
		icon: Image
	},
	{
		id: "video",
		label: "Video Studio",
		icon: Film
	},
	{
		id: "agent",
		label: "Agent",
		icon: Bot
	}
];
var TITLES = {
	chat: "AI Workspace",
	code: "Code Studio",
	image: "Image Studio",
	video: "Video Studio",
	agent: "Agent",
	projects: "Projekte",
	memory: "Memory",
	history: "Verlauf",
	settings: "Einstellungen",
	help: "Hilfe",
	links: "Anbindungen"
};
var TONES = [
	"Präzise",
	"Kreativ",
	"Einfach erklärt",
	"Technisch"
];
var LANGUAGES = ["Deutsch", "English"];
function StudioApp() {
	const [state, setState] = (0, import_react.useState)(() => freshState());
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("chat");
	const [input, setInput] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)("");
	const abortRef = (0, import_react.useRef)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [dahlHint, setDahlHint] = (0, import_react.useState)("");
	const [ai, setAi] = (0, import_react.useState)(null);
	const [navOpen, setNavOpen] = (0, import_react.useState)(false);
	const [palette, setPalette] = (0, import_react.useState)(false);
	const [paletteQuery, setPaletteQuery] = (0, import_react.useState)("");
	const [copiedId, setCopiedId] = (0, import_react.useState)("");
	const [style, setStyle] = (0, import_react.useState)("cinematic");
	const [aspect, setAspect] = (0, import_react.useState)("1:1");
	const [videoAspect, setVideoAspect] = (0, import_react.useState)("16:9");
	const [duration, setDuration] = (0, import_react.useState)(10);
	const [note, setNote] = (0, import_react.useState)("Bereit — frag SusiAI nach einer Änderung.");
	const [previewOn, setPreviewOn] = (0, import_react.useState)(false);
	const [draftName, setDraftName] = (0, import_react.useState)(null);
	const [rename, setRename] = (0, import_react.useState)("");
	const [confirmId, setConfirmId] = (0, import_react.useState)("");
	const [confirmWipe, setConfirmWipe] = (0, import_react.useState)(false);
	const [accountOn, setAccountOn] = (0, import_react.useState)(null);
	const pushedRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const endRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const paletteRef = (0, import_react.useRef)(null);
	const project = state.projects.find((p) => p.id === state.activeId) ?? state.projects[0];
	const activeFile = project.files.find((f) => f.path === project.activePath) ?? project.files[0];
	const route = routeFromLinks(state.links);
	const linkOn = route.provider === "grok" ? Boolean(ai) : route.key.trim().length > 8;
	const linkLabel = providerLabel(route.provider);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		(async () => {
			const loaded = loadState();
			const local = loaded ? await hydrateImages(loaded).catch(() => loaded) : null;
			if (cancel) return;
			if (local) setState(local);
			let next = local ?? freshState();
			try {
				const remote = await listStudioProjects();
				if (cancel) return;
				const merged = mergeAccountProjects(local?.projects ?? [], remote.projects);
				const projects = merged.projects.length ? merged.projects : next.projects;
				const activeId = projects.some((item) => item.id === next.activeId) ? next.activeId : projects[0].id;
				next = {
					...next,
					projects,
					activeId
				};
				setState(next);
				setAccountOn(true);
				const pending = merged.projects.length ? merged.push : projects;
				await Promise.all(pending.map((project) => saveStudioProject({ data: projectForAccount(project) }))).catch(() => void 0);
				pushedRef.current = new Map(next.projects.map((project) => [project.id, project.updatedAt]));
			} catch {
				if (!cancel) {
					setState(next);
					setAccountOn(false);
				}
			} finally {
				if (!cancel) setHydrated(true);
			}
		})();
		studioHealth().then((r) => setAi(r.ai)).catch(() => setAi(false));
		return () => {
			cancel = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated || accountOn !== true) return;
		const timer = window.setTimeout(() => {
			for (const project of state.projects) {
				if (pushedRef.current.get(project.id) === project.updatedAt) continue;
				const stamp = project.updatedAt;
				saveStudioProject({ data: projectForAccount(project) }).then((result) => {
					if (result.stored) pushedRef.current.set(project.id, stamp);
				}).catch(() => void 0);
			}
		}, 800);
		return () => window.clearTimeout(timer);
	}, [
		state.projects,
		hydrated,
		accountOn
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const timer = window.setTimeout(() => saveState(state), 400);
		return () => window.clearTimeout(timer);
	}, [state, hydrated]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const flush = () => saveState(state);
		window.addEventListener("pagehide", flush);
		return () => window.removeEventListener("pagehide", flush);
	}, [state, hydrated]);
	(0, import_react.useEffect)(() => {
		const node = endRef.current;
		const scroller = node?.parentElement;
		if (!node || !scroller) return;
		if (scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 160) node.scrollIntoView({ block: "end" });
	}, [
		project.messages,
		busy,
		mode
	]);
	(0, import_react.useEffect)(() => {
		if (!error.toLowerCase().includes("dahl") || !state.links.dahlKey.trim()) {
			setDahlHint("");
			return;
		}
		let cancel = false;
		dahlBalance({ data: { key: state.links.dahlKey } }).then((result) => {
			if (cancel) return;
			setDahlHint(result.tokens === 0 ? "Kontostand: 0 Tokens." : result.tokens != null ? `Kontostand: ${new Intl.NumberFormat("de-DE").format(result.tokens)} Tokens.` : result.error);
		}).catch(() => {
			if (!cancel) setDahlHint("");
		});
		return () => {
			cancel = true;
		};
	}, [error, state.links.dahlKey]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPalette(true);
				setPaletteQuery("");
			}
			if (e.key === "Escape") setPalette(false);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	(0, import_react.useEffect)(() => {
		if (palette) paletteRef.current?.focus();
	}, [palette]);
	function patch(update) {
		setState((current) => ({
			...current,
			projects: current.projects.map((item) => item.id === current.activeId ? {
				...update(item),
				updatedAt: Date.now()
			} : item)
		}));
	}
	function selectMode(next) {
		setMode(next);
		setNavOpen(false);
		setError("");
		setPalette(false);
	}
	function selectProject(id) {
		setState((current) => ({
			...current,
			activeId: id
		}));
		setNote("Bereit — frag SusiAI nach einer Änderung.");
		setPreviewOn(false);
		setError("");
		selectMode("chat");
	}
	function createProject() {
		const created = makeProject(`Projekt ${state.projects.length + 1}`);
		setState((current) => ({
			...current,
			activeId: created.id,
			projects: [created, ...current.projects].slice(0, 20)
		}));
		setInput("");
		selectMode("chat");
	}
	function stopWork() {
		abortRef.current?.abort();
		abortRef.current = null;
		setBusy(false);
	}
	async function runChat(text = input) {
		const content = text.trim();
		if (!content || busy) return;
		const user = {
			id: crypto.randomUUID(),
			role: "user",
			content,
			createdAt: Date.now()
		};
		const replyId = crypto.randomUUID();
		const history = [...project.messages, user];
		patch((item) => ({
			...item,
			messages: [...history, {
				id: replyId,
				role: "assistant",
				content: "",
				createdAt: Date.now()
			}]
		}));
		setInput("");
		inputRef.current = "";
		setBusy(true);
		setError("");
		const controller = new AbortController();
		abortRef.current = controller;
		const apiMode = mode === "agent" ? "agent" : mode === "code" ? "code" : "chat";
		try {
			const result = await consumeStudioStream({
				kind: "chat",
				mode: apiMode,
				messages: history,
				preferences: state.prefs,
				route
			}, controller.signal, (next) => {
				patch((item) => ({
					...item,
					messages: item.messages.map((message) => message.id === replyId ? {
						...message,
						content: next
					} : message)
				}));
			});
			if (!result.ok && !controller.signal.aborted) {
				patch((item) => ({
					...item,
					messages: item.messages.map((message) => message.id === replyId ? {
						...message,
						content: result.error
					} : message)
				}));
				setError(result.error);
			}
		} catch (error) {
			if (controller.signal.aborted) return;
			const message = error instanceof Error ? error.message : "Die Anfrage konnte nicht gesendet werden.";
			setError(message);
		} finally {
			if (abortRef.current === controller) abortRef.current = null;
			setBusy(false);
		}
	}
	async function runCode(action, instruction = "") {
		if (busy) return;
		if (action === "custom" && !instruction.trim()) return;
		setBusy(true);
		setError("");
		if (action === "custom") {
			setInput("");
			inputRef.current = "";
		}
		const controller = new AbortController();
		abortRef.current = controller;
		let streamed = "";
		try {
			const result = await consumeStudioStream({
				kind: "code",
				action,
				path: activeFile.path,
				content: activeFile.content,
				instruction: instruction.trim(),
				preferences: state.prefs,
				route
			}, controller.signal, (next) => {
				streamed = next;
				setNote(next);
			});
			if (controller.signal.aborted) {
				setNote(streamed ? `${streamed}\n\nAbgebrochen.` : "Abgebrochen.");
				return;
			}
			if (!result.ok) {
				setError(result.error);
				setNote(result.error);
				return;
			}
			const parsed = parseCodeReply(result.text, action);
			setNote(parsed.explanation);
			patch((item) => {
				let files = item.files;
				let activePath = item.activePath;
				if (parsed.code && action !== "explain") {
					if (action === "tests") {
						const testPath = `tests/${item.activePath.replace(/^.*\//, "").replace(/\.[^.]+$/, "")}.test.ts`;
						files = upsertFile(item.files, testPath, parsed.code);
						activePath = testPath;
					} else files = upsertFile(item.files, item.activePath, parsed.code);
				}
				const label = action === "custom" ? instruction.trim() : `${action} · ${item.activePath}`;
				return {
					...item,
					files,
					activePath,
					messages: [
						...item.messages,
						{
							id: crypto.randomUUID(),
							role: "user",
							content: label,
							createdAt: Date.now()
						},
						{
							id: crypto.randomUUID(),
							role: "assistant",
							content: parsed.explanation,
							createdAt: Date.now()
						}
					]
				};
			});
		} catch {
			if (!controller.signal.aborted) setError("Code-Anfrage fehlgeschlagen.");
		} finally {
			if (abortRef.current === controller) abortRef.current = null;
			setBusy(false);
		}
	}
	async function runImage() {
		const prompt = input.trim();
		if (!prompt || busy) return;
		setBusy(true);
		setError("");
		try {
			const result = await generateStudioImage({ data: {
				prompt,
				style,
				aspect
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			patch((item) => ({
				...item,
				images: [{
					id: crypto.randomUUID(),
					prompt,
					url: result.url,
					createdAt: Date.now()
				}, ...item.images].slice(0, 8)
			}));
		} catch {
			setError("Bild konnte nicht erzeugt werden.");
		} finally {
			setBusy(false);
		}
	}
	async function runVideo() {
		const prompt = input.trim();
		if (!prompt || busy) return;
		setBusy(true);
		setError("");
		try {
			const result = await generateStoryboard({ data: {
				prompt,
				aspect: videoAspect,
				duration,
				route
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			patch((item) => ({
				...item,
				storyboard: result.storyboard
			}));
		} catch {
			setError("Storyboard konnte nicht erstellt werden.");
		} finally {
			setBusy(false);
		}
	}
	function submit() {
		if (mode === "image") return runImage();
		if (mode === "video") return runVideo();
		if (mode === "code") return runCode("custom", input);
		return runChat();
	}
	function onAttach(file) {
		if (!file) return;
		if (file.size > 1e5) {
			setError("Dateien über 100 KB werden nicht angehängt.");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const content = String(reader.result ?? "");
			const path = file.name.replace(/[^\w.\-/]/g, "_");
			patch((item) => ({
				...item,
				files: upsertFile(item.files, path, content),
				activePath: path
			}));
			selectMode("code");
		};
		reader.readAsText(file);
	}
	function startMic() {
		const w = window;
		const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
		if (!Ctor) {
			setError("Spracheingabe wird in diesem Browser nicht unterstützt.");
			return;
		}
		const rec = new Ctor();
		rec.lang = state.prefs.language === "English" ? "en-US" : "de-DE";
		rec.onresult = (ev) => {
			const transcript = ev.results?.[0]?.[0]?.transcript ?? "";
			if (transcript) setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
		};
		rec.onerror = () => setError("Spracheingabe abgebrochen.");
		rec.start();
	}
	function downloadText(filename, content) {
		const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}
	async function downloadImage(url) {
		try {
			const blob = await (await fetch(url)).blob();
			const objectUrl = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = objectUrl;
			a.download = "susiai-image.jpg";
			a.click();
			URL.revokeObjectURL(objectUrl);
		} catch {
			window.open(url, "_blank", "noopener,noreferrer");
		}
	}
	function addNamedFile() {
		const name = (draftName ?? "").trim().replace(/[^\w.\-/]/g, "");
		if (!name) return;
		patch((item) => ({
			...item,
			files: upsertFile(item.files, name, item.files.some((f) => f.path === name) ? item.files.find((f) => f.path === name).content : ""),
			activePath: name
		}));
		setDraftName(null);
	}
	const composerOn = mode === "chat" || mode === "code" || mode === "image" || mode === "video" || mode === "agent";
	const placeholder = mode === "image" ? "Beschreibe dein Bild…" : mode === "video" ? "Beschreibe dein Video…" : mode === "code" ? "Sag SusiAI, was sich im Code ändern soll…" : mode === "agent" ? "Beschreibe das Ziel für den Agenten…" : "Frag SusiAI, was du erstellen möchtest…";
	const commands = (0, import_react.useMemo)(() => {
		const q = paletteQuery.trim().toLowerCase();
		const items = [
			...MODES.map((item) => ({
				id: item.id,
				label: item.label,
				hint: "Modus",
				run: () => selectMode(item.id)
			})),
			{
				id: "projects",
				label: "Projekte",
				hint: "Übersicht",
				run: () => selectMode("projects")
			},
			{
				id: "memory",
				label: "Memory",
				hint: "Präferenzen",
				run: () => selectMode("memory")
			},
			{
				id: "history",
				label: "Verlauf",
				hint: "Nachrichten",
				run: () => selectMode("history")
			},
			{
				id: "settings",
				label: "Einstellungen",
				hint: "Studio",
				run: () => selectMode("settings")
			},
			{
				id: "help",
				label: "Hilfe",
				hint: "Kurz",
				run: () => selectMode("help")
			},
			{
				id: "links",
				label: "Anbindungen",
				hint: "MCP und Provider",
				run: () => selectMode("links")
			},
			{
				id: "new",
				label: "Neues Projekt",
				hint: "Anlegen",
				run: createProject
			},
			...state.projects.map((item) => ({
				id: item.id,
				label: item.name,
				hint: "Projekt öffnen",
				run: () => selectProject(item.id)
			}))
		];
		return q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
	}, [paletteQuery, state.projects]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh overflow-hidden bg-bg text-fg",
		children: [
			navOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "fixed inset-0 z-30 bg-scrim lg:hidden",
				"aria-label": "Menü schließen",
				onClick: () => setNavOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: `fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-4 border-r border-line bg-surface p-4 transition-transform lg:static lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leading-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-lg font-semibold tracking-tight",
								children: "SusiAI"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs font-medium tracking-widest text-faint",
								children: "STUDIO"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-raised font-semibold hover:border-primary",
						onClick: createProject,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), " Neues Projekt"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-col gap-1",
						children: MODES.map((item) => {
							const Icon = item.icon;
							const active = mode === item.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `flex h-11 items-center gap-3 rounded-lg border-l-2 px-3 text-left ${active ? "border-primary bg-raised text-fg" : "border-transparent text-muted hover:bg-raised hover:text-fg"}`,
								onClick: () => selectMode(item.id),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }),
									item.id === "agent" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto rounded bg-raised px-1.5 py-0.5 text-xs text-faint",
										children: "Beta"
									})
								]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-h-0 flex-1 overflow-y-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 px-2 text-xs tracking-widest text-faint",
							children: "PROJEKTE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-1",
							children: state.projects.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: `truncate rounded-lg px-3 py-2 text-left text-sm ${item.id === project.id ? "bg-raised text-fg" : "text-muted hover:bg-raised hover:text-fg"}`,
								onClick: () => selectProject(item.id),
								children: item.name
							}, item.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/dashboard",
								className: "flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-raised hover:text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { size: 16 }), "Dashboard"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLink, {
								icon: FolderOpen,
								label: "Alle Projekte",
								active: mode === "projects",
								onClick: () => selectMode("projects")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLink, {
								icon: Sparkles,
								label: "Memory",
								active: mode === "memory",
								onClick: () => selectMode("memory")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLink, {
								icon: History,
								label: "Verlauf",
								active: mode === "history",
								onClick: () => selectMode("history")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLink, {
								icon: Plug,
								label: "Anbindungen",
								active: mode === "links",
								onClick: () => selectMode("links")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLink, {
								icon: CircleHelp,
								label: "Hilfe",
								active: mode === "help",
								onClick: () => selectMode("help")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLink, {
								icon: Settings,
								label: "Einstellungen",
								active: mode === "settings",
								onClick: () => selectMode("settings")
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 overflow-hidden border-t border-line pt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/80 px-3 backdrop-blur sm:px-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "grid size-11 place-items-center rounded-lg border border-line lg:hidden",
								onClick: () => setNavOpen(true),
								"aria-label": "Menü",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { size: 18 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs tracking-widest text-faint",
									children: "MULTIMODAL WORKSPACE"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "truncate text-lg font-semibold",
									children: TITLES[mode]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "flex h-11 max-w-[40vw] items-center gap-2 rounded-lg border border-line bg-bg px-2 text-sm text-muted sm:max-w-none sm:px-3",
										onClick: () => selectMode("links"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `size-2 shrink-0 rounded-full ${linkOn ? "bg-accent" : "bg-faint"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: ai === null && route.provider === "grok" ? "Prüfe KI…" : linkOn ? linkLabel : `${linkLabel} offline`
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "flex h-11 items-center gap-2 rounded-lg border border-line bg-bg px-3 text-muted hover:text-fg",
										onClick: () => {
											setPalette(true);
											setPaletteQuery("");
										},
										"aria-label": "Befehlspalette",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
											className: "hidden text-xs text-faint sm:inline",
											children: "Strg+K"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/dashboard",
										className: "grid size-11 place-items-center rounded-lg border border-line bg-bg text-muted hover:text-fg",
										"aria-label": "Dashboard",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { size: 18 })
									})
								]
							})
						]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 border-b border-line bg-raised px-4 py-2 text-sm text-danger",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: error }), dahlHint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-muted",
							children: [
								dahlHint,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "text-primary underline",
									href: "https://inference.dahl.global/account",
									target: "_blank",
									rel: "noreferrer",
									children: "Neuen Schlüssel anlegen"
								})
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-label": "Hinweis schließen",
							onClick: () => setError(""),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 flex-col",
						children: [
							mode === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPane, {
								messages: project.messages,
								busy,
								copiedId,
								onCopy: (id, text) => {
									navigator.clipboard?.writeText(text);
									setCopiedId(id);
									setTimeout(() => setCopiedId(""), 1200);
								},
								onPrompt: (text) => runChat(text),
								onMode: selectMode,
								endRef
							}),
							mode === "agent" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentPane, {
								messages: project.messages,
								busy,
								onPrompt: (text) => {
									setMode("agent");
									runChat(text);
								},
								endRef
							}),
							mode === "code" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodePane, {
								files: project.files,
								active: activeFile,
								note,
								busy,
								previewOn,
								draftName,
								onDraft: setDraftName,
								onAdd: addNamedFile,
								onSelect: (path) => patch((item) => ({
									...item,
									activePath: path
								})),
								onChange: (content) => patch((item) => ({
									...item,
									files: item.files.map((file) => file.path === item.activePath ? {
										...file,
										content
									} : file)
								})),
								onRemove: (path) => patch((item) => {
									const files = item.files.filter((file) => file.path !== path);
									const next = files.length ? files : item.files;
									return {
										...item,
										files: next,
										activePath: next[0].path
									};
								}),
								onTool: (action) => runCode(action),
								onPreview: () => setPreviewOn((v) => !v),
								onExport: () => downloadText(activeFile.path.split("/").pop() || "datei.txt", activeFile.content)
							}),
							mode === "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePane, {
								images: project.images,
								style,
								aspect,
								busy,
								canGenerate: Boolean(input.trim()),
								onStyle: setStyle,
								onAspect: setAspect,
								onGenerate: runImage,
								onDownload: downloadImage
							}),
							mode === "video" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoPane, {
								board: project.storyboard,
								aspect: videoAspect,
								duration,
								busy,
								canGenerate: Boolean(input.trim()),
								onAspect: setVideoAspect,
								onDuration: setDuration,
								onGenerate: runVideo,
								onExport: () => project.storyboard && downloadText("storyboard.md", storyboardMarkdown(project.storyboard))
							}),
							mode === "projects" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsPane, {
								projects: state.projects,
								activeId: project.id,
								confirmId,
								rename,
								hydrated,
								onRenameStart: (item) => {
									setRename(item.name);
									setConfirmId(`rename:${item.id}`);
								},
								onRename: setRename,
								onRenameSave: (id) => {
									const name = rename.trim();
									if (!name) return;
									setState((current) => ({
										...current,
										projects: current.projects.map((item) => item.id === id ? {
											...item,
											name,
											updatedAt: Date.now()
										} : item)
									}));
									setConfirmId("");
								},
								onOpen: selectProject,
								onAskDelete: setConfirmId,
								onDelete: (id) => {
									deleteStudioProject({ data: { id } }).catch(() => void 0);
									pushedRef.current.delete(id);
									setState((current) => {
										const projects = current.projects.filter((item) => item.id !== id);
										const next = projects.length ? projects : [makeProject("SusiAI Lab")];
										const activeId = next.some((item) => item.id === current.activeId) ? current.activeId : next[0].id;
										return {
											...current,
											projects: next,
											activeId
										};
									});
									setConfirmId("");
								}
							}),
							mode === "memory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefsPane, {
								prefs: state.prefs,
								onChange: (prefs) => setState((current) => ({
									...current,
									prefs
								}))
							}),
							mode === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPane, {
								messages: project.messages,
								onClear: () => patch((item) => ({
									...item,
									messages: []
								}))
							}),
							mode === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-h-0 flex-1 overflow-y-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefsPane, {
									prefs: state.prefs,
									onChange: (prefs) => setState((current) => ({
										...current,
										prefs
									}))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mx-auto w-full max-w-xl px-4 pb-8",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-2xl border border-line bg-surface p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "font-semibold",
												children: "Lokale Daten"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm text-muted",
												children: "Projekte liegen am Konto. Schlüssel und Bilder bleiben in diesem Browser."
											}),
											confirmWipe ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3 flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "h-11 rounded-xl bg-danger px-4 font-semibold text-bg",
													onClick: () => {
														const ids = state.projects.map((item) => item.id);
														const next = freshState();
														setState(next);
														saveState(next);
														pushedRef.current = /* @__PURE__ */ new Map();
														Promise.all(ids.map((id) => deleteStudioProject({ data: { id } }))).catch(() => void 0);
														setConfirmWipe(false);
														selectMode("chat");
													},
													children: "Wirklich löschen"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "h-11 rounded-xl border border-line px-4",
													onClick: () => setConfirmWipe(false),
													children: "Abbrechen"
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "mt-3 h-11 rounded-xl border border-line px-4 text-danger",
												onClick: () => setConfirmWipe(true),
												children: "Projekte vom Konto und aus diesem Browser löschen"
											})
										]
									})
								})]
							}),
							mode === "help" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpPane, {}),
							mode === "links" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinksPane, {
								links: state.links,
								prefs: state.prefs,
								grokReady: ai,
								onChange: (links) => setState((current) => ({
									...current,
									links
								}))
							})
						]
					}),
					composerOn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 border-t border-line bg-surface px-3 py-3 sm:px-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end gap-2 rounded-2xl border border-line bg-bg p-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: ".txt,.md,.tsx,.ts,.jsx,.js,.css,.json,.html",
									className: "hidden",
									onChange: (e) => {
										onAttach(e.target.files?.[0]);
										e.target.value = "";
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-raised hover:text-fg",
									"aria-label": "Datei anhängen",
									onClick: () => fileRef.current?.click(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 18 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: input,
									onChange: (e) => {
										setInput(e.target.value);
										inputRef.current = e.target.value;
									},
									onKeyDown: (e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											submit();
										}
									},
									rows: 1,
									placeholder,
									className: "max-h-36 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base outline-none placeholder:text-faint"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-raised hover:text-fg",
									"aria-label": "Spracheingabe",
									onClick: startMic,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { size: 18 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg disabled:opacity-40",
									onClick: busy ? stopWork : submit,
									disabled: !busy && !input.trim(),
									"aria-label": busy ? "Abbrechen" : "Senden",
									children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
										size: 16,
										fill: "currentColor"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 18 })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex justify-between px-1 text-xs text-faint",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Enter senden · Shift+Enter neue Zeile", busy ? " · Stop beendet die Antwort" : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate",
								children: [
									project.name,
									" · ",
									linkLabel,
									route.model ? ` · ${route.model}` : "",
									accountOn === true ? " · Am Konto" : accountOn === false ? " · Nur dieser Browser" : ""
								]
							})]
						})]
					})
				]
			}),
			palette && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-start bg-scrim px-4 pt-[12vh]",
				onClick: () => setPalette(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-label": "Befehlspalette",
					className: "w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-line px-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							size: 16,
							className: "text-faint"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: paletteRef,
							value: paletteQuery,
							onChange: (e) => setPaletteQuery(e.target.value),
							placeholder: "Modus oder Projekt…",
							className: "h-12 flex-1 bg-transparent outline-none"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-h-80 overflow-y-auto p-2",
						children: [commands.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-3 py-6 text-sm text-muted",
							children: "Nichts gefunden."
						}), commands.slice(0, 12).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "flex h-11 w-full items-center justify-between rounded-lg px-3 text-left hover:bg-raised",
							onClick: item.run,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-faint",
								children: item.hint
							})]
						}, item.id))]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				role: "status",
				children: busy ? "SusiAI arbeitet" : ""
			})
		]
	});
}
function SideLink({ icon: Icon, label, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		className: `flex h-10 items-center gap-3 rounded-lg px-3 text-sm ${active ? "bg-raised text-fg" : "text-muted hover:bg-raised hover:text-fg"}`,
		onClick,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 16 }), label]
	});
}
function ChatPane({ messages, busy, copiedId, onCopy, onPrompt, onMode, endRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8",
		children: [messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-3xl flex-col items-center pt-8 text-center sm:pt-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-16 place-items-center rounded-2xl bg-primary text-primary-fg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 28 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-5 text-3xl font-semibold tracking-tight",
					children: "Was möchtest du erschaffen?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-md text-muted",
					children: "Chat, Code, Bilder und Video-Storyboards in einem Workspace."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid w-full gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
							icon: CodeXml,
							title: "Seite entwerfen",
							detail: "Struktur und Text",
							onClick: () => onPrompt("Entwirf eine klare Landingpage für ein KI-Studio: Abschnitte, Überschriften und den ersten React-Komponentenentwurf.")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
							icon: Image,
							title: "Bild generieren",
							detail: "Text zu Bild",
							onClick: () => onMode("image")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
							icon: Film,
							title: "Video planen",
							detail: "Prompt zu Storyboard",
							onClick: () => onMode("video")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
							icon: Bot,
							title: "Agent verstehen",
							detail: "Werkzeuge und Ablauf",
							onClick: () => onPrompt("Erkläre in klaren Schritten, wie ein KI-Agent ein Ziel in Werkzeugaufrufe zerlegt.")
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-3xl flex-col gap-4",
			children: [
				messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: `flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${message.role === "user" ? "bg-raised" : "bg-primary text-primary-fg"}`,
						children: message.role === "user" ? "Du" : "✦"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `min-w-0 max-w-[85%] rounded-2xl border border-line px-4 py-3 ${message.role === "user" ? "bg-raised" : "bg-surface"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-1 text-xs text-faint",
								children: message.role === "user" ? "Du" : "SusiAI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichText, { text: message.content }),
							message.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "mt-2 text-muted hover:text-fg",
								"aria-label": "Kopieren",
								onClick: () => onCopy(message.id, message.content),
								children: copiedId === message.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { size: 14 })
							})
						]
					})]
				}, message.id)),
				busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "susi-dot size-1.5 rounded-full bg-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "susi-dot size-1.5 rounded-full bg-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "susi-dot size-1.5 rounded-full bg-primary" }),
						"SusiAI arbeitet…"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })
			]
		})]
	});
}
function Quick({ icon: Icon, title, detail, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		className: "flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left hover:border-primary",
		onClick,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			size: 18,
			className: "text-primary"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
			className: "block font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
			className: "text-muted",
			children: detail
		})] })]
	});
}
function AgentPane({ messages, busy, onPrompt, endRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs tracking-widest text-faint",
						children: "AGENT · BETA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-2xl font-semibold",
						children: "Ein Ziel, ein Plan."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "SusiAI liefert einen knappen Ablauf und den ersten brauchbaren Entwurf. Es wird nichts automatisch im Hintergrund ausgeführt."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-col gap-2",
						children: ["Plane einen kleinen Landingpage-Launch: Seiten, Texte, offene Punkte.", "Zerlege die Aufgabe, eine Bildergalerie zu bauen, in konkrete Schritte."].map((goal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "rounded-xl border border-line px-3 py-3 text-left text-sm hover:border-primary",
							onClick: () => onPrompt(goal),
							children: goal
						}, goal))
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-4",
				children: [
					messages.slice(-6).map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-line bg-bg px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1 text-xs text-faint",
							children: message.role === "user" ? "Ziel" : "Plan"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichText, { text: message.content })]
					}, message.id)),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted",
						children: "Agent plant…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })
				]
			})]
		})
	});
}
function CodePane({ files, active, note, busy, previewOn, draftName, onDraft, onAdd, onSelect, onChange, onRemove, onTool, onPreview, onExport }) {
	const html = previewHtml(active);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[13rem_minmax(0,1fr)_14rem] lg:overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-line p-3 lg:overflow-y-auto lg:border-b-0 lg:border-r",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs tracking-widest text-faint",
							children: "DATEIEN"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-label": "Datei anlegen",
							className: "grid size-8 place-items-center rounded-lg hover:bg-raised",
							onClick: () => onDraft(draftName === null ? "src/neu.ts" : null),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 })
						})]
					}),
					draftName !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draftName,
							onChange: (e) => onDraft(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && onAdd(),
							className: "h-9 min-w-0 flex-1 rounded-lg border border-line bg-bg px-2 text-sm outline-none"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "h-9 rounded-lg bg-primary px-2 text-sm text-primary-fg",
							onClick: onAdd,
							children: "OK"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto lg:flex-col",
						children: files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center lg:w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: `h-9 truncate rounded-lg px-2 text-left text-sm lg:flex-1 ${file.path === active.path ? "bg-raised text-fg" : "text-muted hover:bg-raised"}`,
								onClick: () => onSelect(file.path),
								children: file.path
							}), files.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"aria-label": `${file.path} entfernen`,
								className: "grid size-8 place-items-center text-faint hover:text-danger",
								onClick: () => onRemove(file.path),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 })
							})]
						}, file.path))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-[50vh] flex-col lg:min-h-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-11 items-center justify-between border-b border-line px-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate font-mono text-muted",
							children: active.path
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "flex h-8 items-center gap-1 rounded-lg px-2 text-muted hover:bg-raised hover:text-fg",
							onClick: () => onTool("fix"),
							disabled: busy,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { size: 14 }), " Fix"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: active.content,
						onChange: (e) => onChange(e.target.value),
						spellCheck: false,
						className: "min-h-64 flex-1 resize-none bg-bg p-4 font-mono text-sm leading-6 outline-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-line bg-surface px-3 py-2 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mr-2 inline-block size-2 rounded-full bg-accent align-middle" }), busy ? "SusiAI liest den Code…" : note]
					}),
					previewOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						title: "Vorschau",
						sandbox: "",
						srcDoc: html,
						className: "h-56 w-full border-t border-line bg-bg"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 border-t border-line p-3 lg:flex-col lg:border-t-0 lg:border-l",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full text-xs tracking-widest text-faint",
						children: "WERKZEUGE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tool, {
						icon: Bot,
						label: "Erklären",
						onClick: () => onTool("explain"),
						disabled: busy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tool, {
						icon: WandSparkles,
						label: "Optimieren",
						onClick: () => onTool("optimize"),
						disabled: busy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tool, {
						icon: TestTubeDiagonal,
						label: "Tests",
						onClick: () => onTool("tests"),
						disabled: busy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tool, {
						icon: Bug,
						label: "Debug",
						onClick: () => onTool("debug"),
						disabled: busy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tool, {
						icon: Play,
						label: "Vorschau",
						onClick: onPreview,
						disabled: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tool, {
						icon: Download,
						label: "Export",
						onClick: onExport,
						disabled: false
					})
				]
			})
		]
	});
}
function Tool({ icon: Icon, label, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		className: "flex h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm hover:border-primary disabled:opacity-40 lg:w-full",
		onClick,
		disabled,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 16 }),
			" ",
			label
		]
	});
}
function ImagePane({ images, style, aspect, busy, canGenerate, onStyle, onAspect, onGenerate, onDownload }) {
	const current = images[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[20rem_minmax(0,1fr)] lg:overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 border-b border-line p-4 lg:border-b-0 lg:border-r",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs tracking-widest text-faint",
					children: "BILD"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Stil",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
						value: style,
						options: [
							["cinematic", "Cinematic"],
							["3d", "3D"],
							["photo", "Foto"],
							["cyber", "Cyber"]
						],
						onChange: onStyle
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Format",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
						value: aspect,
						options: [
							["1:1", "1:1"],
							["16:9", "16:9"],
							["9:16", "9:16"]
						],
						onChange: onAspect
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "flex h-11 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-fg disabled:opacity-40",
					disabled: busy || !canGenerate,
					onClick: onGenerate,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 16 }),
						" ",
						busy ? "Erzeuge…" : "Bild erzeugen"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Der Prompt steht unten im Eingabefeld. Jedes Bild ist ein einzelner Aufruf."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-col p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid min-h-64 flex-1 place-items-center overflow-hidden rounded-2xl border border-line bg-bg",
					children: current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: current.url,
						alt: current.prompt,
						className: "max-h-[55vh] w-full object-contain"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						icon: Image,
						title: "Deine Kreation erscheint hier",
						text: "Beschreibe unten, was SusiAI erzeugen soll."
					})
				}),
				current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-muted",
						children: current.prompt
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line px-3 text-sm",
						onClick: () => onDownload(current.url),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), " Sichern"]
					})]
				}),
				images.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex gap-2 overflow-x-auto",
					children: images.map((image) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: image.url,
						alt: "",
						className: "h-16 w-16 shrink-0 rounded-lg border border-line object-cover"
					}, image.id))
				})
			]
		})]
	});
}
function VideoPane({ board, aspect, duration, busy, canGenerate, onAspect, onDuration, onGenerate, onExport }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[20rem_minmax(0,1fr)] lg:overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 border-b border-line p-4 lg:border-b-0 lg:border-r",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs tracking-widest text-faint",
					children: "VIDEO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Format",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
						value: aspect,
						options: [
							["16:9", "16:9"],
							["9:16", "9:16"],
							["1:1", "1:1"]
						],
						onChange: onAspect
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Dauer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
						value: String(duration),
						options: [
							["6", "6 Sek"],
							["10", "10 Sek"],
							["15", "15 Sek"]
						],
						onChange: (value) => onDuration(Number(value))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "flex h-11 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-fg disabled:opacity-40",
					disabled: busy || !canGenerate,
					onClick: onGenerate,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { size: 16 }),
						" ",
						busy ? "Plane…" : "Storyboard erstellen"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "SusiAI schreibt vier Szenen, Kamera, Voiceover und Musik. Es wird kein Videoclip gerendert."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 overflow-y-auto p-4",
			children: [!board && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				icon: Film,
				title: "Video-Arbeitsfläche",
				text: "Beschreibe unten die Szene. Du bekommst ein Storyboard, das du exportieren kannst."
			}), board && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-3xl flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-semibold",
							children: board.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								board.aspect,
								" · ",
								board.duration,
								"s"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "flex h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm",
							onClick: onExport,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), " Export"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: board.scenes.map((scene, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-2xl border border-line bg-surface p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-faint",
									children: ["Szene ", index + 1]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold",
									children: scene.title
								}),
								scene.camera && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm text-muted",
									children: ["Kamera: ", scene.camera]
								}),
								scene.action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm",
									children: scene.action
								}),
								scene.visual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: scene.visual
								})
							]
						}, `${scene.title}-${index}`))
					}),
					(board.voiceover || board.music) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-line bg-bg p-4 text-sm",
						children: [board.voiceover && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Stimme: ", board.voiceover] }), board.music && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-muted",
							children: ["Musik: ", board.music]
						})]
					})
				]
			})]
		})]
	});
}
function ProjectsPane({ projects, activeId, confirmId, rename, hydrated, onRenameStart, onRename, onRenameSave, onOpen, onAskDelete, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-0 flex-1 overflow-y-auto p-4 sm:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto grid max-w-3xl gap-3",
			children: projects.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-2xl border border-line bg-surface p-4",
				children: [
					confirmId === `rename:${item.id}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: rename,
							onChange: (e) => onRename(e.target.value),
							className: "h-11 flex-1 rounded-xl border border-line bg-bg px-3 outline-none"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "h-11 rounded-xl bg-primary px-4 text-primary-fg",
							onClick: () => onRenameSave(item.id),
							children: "Speichern"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "truncate text-lg font-semibold",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									item.messages.length,
									" Nachrichten · ",
									item.files.length,
									" Dateien",
									hydrated ? ` · ${new Date(item.updatedAt).toLocaleString("de-DE")}` : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "Umbenennen",
								onClick: () => onRenameStart(item),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { size: 16 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
								label: "Löschen",
								onClick: () => confirmId === item.id ? onDelete(item.id) : onAskDelete(item.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 })
							})]
						})]
					}),
					confirmId === item.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-danger",
						children: "Nochmal tippen, um dieses Projekt zu löschen."
					}),
					item.id !== activeId && confirmId !== `rename:${item.id}` && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "mt-3 h-10 rounded-xl border border-line px-3 text-sm",
						onClick: () => onOpen(item.id),
						children: "Öffnen"
					}),
					item.id === activeId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 text-xs text-accent",
						children: "Aktiv"
					})
				]
			}, item.id))
		})
	});
}
function PrefsPane({ prefs, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-xl p-4 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-semibold",
				children: "Was SusiAI über dich wissen soll"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Bleibt in diesem Browser und wird jeder Antwort mitgegeben."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Sprache",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
							value: prefs.language,
							options: LANGUAGES.map((lang) => [lang, lang]),
							onChange: (language) => onChange({
								...prefs,
								language
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ton",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
							value: prefs.tone,
							options: TONES.map((tone) => [tone, tone]),
							onChange: (tone) => onChange({
								...prefs,
								tone
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-2 text-sm text-muted",
						children: ["Notizen", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: prefs.notes,
							onChange: (e) => onChange({
								...prefs,
								notes: e.target.value.slice(0, 500)
							}),
							rows: 5,
							placeholder: "Zum Beispiel: kurze Sätze, TypeScript, kein Fachjargon.",
							className: "rounded-xl border border-line bg-surface p-3 text-fg outline-none"
						})]
					})
				]
			})
		]
	});
}
function HistoryPane({ messages, onClear }) {
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-0 flex-1 overflow-y-auto p-4 sm:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-semibold",
						children: "Verlauf dieses Projekts"
					}), messages.length > 0 && (confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "h-10 rounded-xl bg-danger px-3 text-sm font-semibold text-bg",
						onClick: onClear,
						children: "Leeren"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "h-10 rounded-xl border border-line px-3 text-sm",
						onClick: () => setConfirm(true),
						children: "Chat leeren"
					}))]
				}),
				messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Noch keine Nachrichten."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-line bg-surface px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-faint",
							children: message.role === "user" ? "Du" : "SusiAI"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 line-clamp-4 whitespace-pre-wrap break-words text-sm",
							children: message.content
						})]
					}, message.id))
				})
			]
		})
	});
}
function HelpPane() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-0 flex-1 overflow-y-auto p-4 sm:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-semibold",
				children: "Kurzbedienung"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-col gap-3",
				children: [
					["Chat", "Fragen, Entwürfe und Erklärungen. Enter sendet."],
					["Code", "Dateien bearbeiten, anhängen und von SusiAI erklären, verbessern oder testen lassen. Vorschau zeigt HTML."],
					["Image", "Ein Prompt, ein Bild. Stil und Format sitzen links."],
					["Video", "Du bekommst ein Storyboard mit vier Szenen, keine gerenderte Videodatei."],
					["Speicher", "Projekte liegen am Konto. Schlüssel, Tokens und Bilder bleiben in diesem Browser."],
					["Anbindungen", "SusiAI, Dahl und GonkaRouter schalten den Chat um. MCP-Server und Grok-Connectors prüfst du dort."]
				].map(([title, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: body
					})]
				}, title))
			})]
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-2 text-xs tracking-widest text-faint",
		children: label.toUpperCase()
	}), children] });
}
function Chips({ value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: options.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			"aria-pressed": value === id,
			className: `h-10 rounded-xl border px-3 text-sm ${value === id ? "border-primary bg-primary text-primary-fg" : "border-line text-muted hover:text-fg"}`,
			onClick: () => onChange(id),
			children: label
		}, id))
	});
}
function Empty({ icon: Icon, title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex max-w-sm flex-col items-center px-6 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				size: 36,
				className: "text-faint"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
				className: "mt-3",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 text-sm text-muted",
				children: text
			})
		]
	});
}
function IconBtn({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		"aria-label": label,
		className: "grid size-10 place-items-center rounded-lg text-muted hover:bg-raised hover:text-fg",
		onClick,
		children
	});
}
function RichText({ text }) {
	const blocks = [];
	const re = /```[\w-]*\n?([\s\S]*?)```/g;
	let last = 0;
	let match;
	while (match = re.exec(text)) {
		if (match.index > last) blocks.push({
			code: false,
			body: text.slice(last, match.index)
		});
		blocks.push({
			code: true,
			body: match[1]
		});
		last = match.index + match[0].length;
	}
	if (last < text.length) blocks.push({
		code: false,
		body: text.slice(last)
	});
	if (!blocks.length) blocks.push({
		code: false,
		body: text
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2 break-words",
		children: blocks.map((block, index) => block.code ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "overflow-x-auto rounded-lg bg-bg p-3 font-mono text-sm leading-6",
			children: block.body.replace(/\n$/, "")
		}, index) : block.body.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "whitespace-pre-wrap leading-6",
			children: block.body.trim()
		}, index))
	});
}
function upsertFile(files, path, content) {
	return (files.some((file) => file.path === path) ? files.map((file) => file.path === path ? {
		...file,
		content
	} : file) : [...files, {
		path,
		content
	}]).slice(0, 24);
}
function previewHtml(file) {
	const content = file.content.trim();
	if (/<!doctype html|<html[\s>]/i.test(content)) return file.content;
	return `<!doctype html><html><body style="margin:0;background:#080a0f;color:#e9edf5;font:14px/1.5 ui-monospace,monospace;padding:16px;white-space:pre-wrap">${file.content.replace(/&/g, "&").replace(/</g, "<")}</body></html>`;
}
function storyboardMarkdown(board) {
	const scenes = board.scenes.map((scene, index) => `## Szene ${index + 1} — ${scene.title}\nKamera: ${scene.camera}\nAktion: ${scene.action}\nBild: ${scene.visual}`).join("\n\n");
	return `# ${board.title}\n\n${board.aspect} · ${board.duration}s\n\n${scenes}\n\nStimme: ${board.voiceover}\nMusik: ${board.music}\n`;
}
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 w-64 animate-pulse rounded-2xl bg-surface" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioApp, {});
}
//#endregion
export { Home as component };
