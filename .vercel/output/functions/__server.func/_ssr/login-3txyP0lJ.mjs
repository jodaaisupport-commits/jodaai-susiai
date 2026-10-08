import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signIn, t as authClient } from "./client-Hb_FAdbz.mjs";
import { n as useCurrentUserState } from "./use-current-user-Bh_x61Ff.mjs";
import { a as GROK_PROVIDERS } from "./verify.server-DOT7e69R.mjs";
import { s as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-3txyP0lJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSkeleton, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	async function submit(event) {
		event.preventDefault();
		setError("");
		if (mode === "up" && name.trim().length < 2) {
			setError("Wie sollen wir dich nennen?");
			return;
		}
		if (password.length < 8) {
			setError("Das Passwort braucht mindestens 8 Zeichen.");
			return;
		}
		setBusy(true);
		try {
			const result = mode === "up" ? await authClient.signUp.email({
				email: email.trim(),
				password,
				name: name.trim(),
				callbackURL: "/dashboard"
			}) : await authClient.signIn.email({
				email: email.trim(),
				password,
				callbackURL: "/dashboard"
			});
			if (result.error) {
				setError(friendly(result.error.message, mode));
				return;
			}
			window.location.assign("/dashboard");
		} catch {
			setError("Die Anmeldung ist fehlgeschlagen.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg p-6 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-2xl border border-line bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-fg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 18 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-semibold",
						children: "SusiAI Studio"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs tracking-widest text-faint",
						children: "KONTO"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid grid-cols-2 rounded-xl bg-bg p-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `h-10 rounded-lg text-sm font-semibold ${mode === "in" ? "bg-raised text-fg" : "text-muted"}`,
						onClick: () => {
							setMode("in");
							setError("");
						},
						children: "Anmelden"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `h-10 rounded-lg text-sm font-semibold ${mode === "up" ? "bg-raised text-fg" : "text-muted"}`,
						onClick: () => {
							setMode("up");
							setError("");
						},
						children: "Registrieren"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 flex flex-col gap-3",
					onSubmit: submit,
					children: [
						mode === "up" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Name",
							autoComplete: "name",
							"aria-label": "Name",
							className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: email,
							onChange: (e) => setEmail(e.target.value),
							type: "email",
							required: true,
							placeholder: "E-Mail",
							autoComplete: "email",
							"aria-label": "E-Mail",
							className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: password,
							onChange: (e) => setPassword(e.target.value),
							type: "password",
							required: true,
							placeholder: "Passwort",
							autoComplete: mode === "up" ? "new-password" : "current-password",
							"aria-label": "Passwort",
							className: "h-11 rounded-xl border border-line bg-bg px-3 outline-none"
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "h-11 rounded-xl bg-primary font-semibold text-primary-fg disabled:opacity-50",
							children: busy ? "Einen Moment…" : mode === "up" ? "Konto erstellen" : "Anmelden"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-4 flex items-center gap-3 text-xs tracking-widest text-faint",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" }),
						"ODER",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "h-11 rounded-xl border border-line bg-bg font-semibold hover:border-primary",
						onClick: () => {
							setError("");
							signIn(provider.providerId, { callbackURL: "/dashboard" }).catch((err) => {
								setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
							});
						},
						children: ["Weiter mit ", provider.label]
					}, provider.providerId))
				})
			]
		})
	});
}
function friendly(message, mode) {
	const text = (message ?? "").toLowerCase();
	if (text.includes("invalid email") || text.includes("invalid password") || text.includes("invalid")) return mode === "in" ? "E-Mail oder Passwort stimmt nicht." : "Diese Angaben konnte das Konto nicht anlegen.";
	if (text.includes("exist") || text.includes("already")) return "Zu dieser E-Mail gibt es schon ein Konto.";
	return message?.slice(0, 180) || "Das hat nicht geklappt.";
}
function AuthSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 w-full max-w-md animate-pulse rounded-2xl bg-surface" })
	});
}
//#endregion
export { LoginPage as component };
