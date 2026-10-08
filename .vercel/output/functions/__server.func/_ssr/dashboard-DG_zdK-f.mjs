import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Navigate, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-Bh_x61Ff.mjs";
import { a as listStudioProjects, c as mergeAccountProjects, f as saveState, l as projectForAccount, o as loadState, p as saveStudioProject, r as freshState, s as makeProject, t as UserButton, u as providerLabel } from "./storage-2An-whA3.mjs";
import { d as Plug, s as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DG_zdK-f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const navigate = useNavigate();
	const { user, isPending } = useCurrentUserState();
	const [projects, setProjects] = (0, import_react.useState)(() => typeof window === "undefined" ? [] : loadState()?.projects ?? []);
	const [accountOn, setAccountOn] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancel = false;
		listStudioProjects().then(async (remote) => {
			if (cancel) return;
			const local = loadState();
			const merged = mergeAccountProjects(local?.projects ?? [], remote.projects);
			const base = local ?? freshState();
			const nextProjects = merged.projects.length ? merged.projects : base.projects;
			const activeId = nextProjects.some((item) => item.id === base.activeId) ? base.activeId : nextProjects[0].id;
			saveState({
				...base,
				projects: nextProjects,
				activeId
			});
			setProjects(nextProjects);
			setAccountOn(true);
			const pending = merged.projects.length ? merged.push : [];
			await Promise.all(pending.map((project) => saveStudioProject({ data: projectForAccount(project) }))).catch(() => void 0);
		}).catch(() => {
			if (!cancel) setAccountOn(false);
		});
		return () => {
			cancel = true;
		};
	}, [user]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 w-full max-w-3xl animate-pulse rounded-2xl bg-surface" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" });
	const saved = typeof window === "undefined" ? null : loadState();
	const messages = projects.reduce((sum, project) => sum + project.messages.length, 0);
	const images = projects.reduce((sum, project) => sum + project.images.length, 0);
	const links = saved?.links;
	const provider = links ? providerLabel(links.provider) : "SusiAI";
	function openProject(id) {
		const state = loadState() ?? freshState();
		saveState({
			...state,
			activeId: id,
			projects: state.projects.some((item) => item.id === id) ? state.projects : projects
		});
		navigate({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-16 items-center justify-between gap-3 border-b border-line px-4 sm:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-fg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 18 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold",
					children: "SusiAI"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs tracking-widest text-faint",
					children: "DASHBOARD"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-3xl font-semibold",
					children: ["Hallo, ", user.displayName ?? "Studio"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted",
					children: accountOn === false ? "Das Konto ist gerade nicht erreichbar. Es gilt die Fassung in diesem Browser. Schlüssel bleiben hier." : `Projekte liegen an diesem Konto${user.primaryEmail ? ` (${user.primaryEmail})` : ""} und in diesem Browser. Schlüssel bleiben nur hier.`
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Projekte",
							value: String(projects.length)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Nachrichten",
							value: String(messages)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Bilder",
							value: String(images)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 lg:grid-cols-[1.4fr_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border border-line bg-surface p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-semibold",
								children: "Projekte"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "h-10 rounded-xl bg-primary px-4 text-sm font-semibold leading-10 text-primary-fg",
								children: "Workspace öffnen"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-2",
							children: [projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-dashed border-line px-3 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Noch kein Projekt an diesem Konto."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "mt-3 h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg",
									onClick: () => {
										const existing = loadState();
										const created = makeProject("Neues Projekt");
										const next = {
											...existing ?? freshState(),
											activeId: created.id,
											projects: [created, ...existing?.projects ?? []].slice(0, 20)
										};
										saveState(next);
										saveStudioProject({ data: projectForAccount(created) }).catch(() => void 0);
										navigate({ to: "/" });
									},
									children: "Projekt anlegen"
								})]
							}), projects.slice(0, 6).map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => openProject(project.id),
								className: "flex items-center justify-between gap-3 rounded-xl border border-line bg-bg px-3 py-3 text-left hover:border-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-medium",
									children: project.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-xs text-faint",
									children: new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(project.updatedAt)
								})]
							}, project.id))]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border border-line bg-surface p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plug, {
									size: 16,
									className: "text-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-semibold",
									children: "Aktive Verbindung"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-2xl font-semibold",
								children: provider
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [links?.mcp.length ? `${links.mcp.length} MCP-Server` : "Kein MCP-Server", " · Schlüssel bleiben lokal."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "mt-4 inline-flex h-10 items-center text-sm text-primary underline",
								children: "Im Workspace ändern"
							})
						]
					})]
				})
			]
		})]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-line bg-surface p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs tracking-widest text-faint",
			children: label.toUpperCase()
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 text-3xl font-semibold",
			children: value
		})]
	});
}
//#endregion
export { DashboardPage as component };
