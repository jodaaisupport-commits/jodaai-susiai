import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-DVuXxYI6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-ClkxHau8.js
var CHAT_MODEL = "grok-4.5";
var IMAGE_MODEL = "grok-imagine-image";
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
async function chatComplete(messages, maxTokens, route = {
	provider: "grok",
	key: "",
	model: ""
}) {
	const external = route.provider === "grok" ? null : ENDPOINTS[route.provider];
	const apiKey = external ? route.key.trim() : readKey();
	if (!apiKey) return {
		ok: false,
		error: external ? `Schlüssel für ${external.label} fehlt. Trag ihn unter Anbindungen ein.` : "KI ist in dieser Umgebung nicht verfügbar."
	};
	try {
		const res = await fetch(external?.url ?? "https://api.x.ai/v1/chat/completions", {
			method: "POST",
			signal: AbortSignal.timeout(45e3),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: external ? route.model.trim() || external.model : CHAT_MODEL,
				messages,
				max_tokens: maxTokens,
				temperature: .5
			})
		});
		if (!res.ok) return {
			ok: false,
			error: await providerError(res, external?.label ?? "SusiAI")
		};
		const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
		if (!text) return {
			ok: false,
			error: "Die KI hat keine Antwort geliefert."
		};
		return {
			ok: true,
			text
		};
	} catch {
		return {
			ok: false,
			error: "Die Anfrage hat zu lange gedauert oder ist fehlgeschlagen."
		};
	}
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
var studioHealth_createServerFn_handler = createServerRpc({
	id: "3f12d3b5daae56e18f96f8cbcbe0714ebb06c8be1e3207016f53a788cbd16e04",
	name: "studioHealth",
	filename: "src/lib/studio/ai.functions.ts"
}, (opts) => studioHealth.__executeServer(opts));
var studioHealth = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(studioHealth_createServerFn_handler, async () => {
	return { ai: Boolean(readKey()) };
});
var askStudio_createServerFn_handler = createServerRpc({
	id: "104fae29e9363c75fe7dd83e380eb5f1166f5f8139f0c3a4a1426c62cffb233e",
	name: "askStudio",
	filename: "src/lib/studio/ai.functions.ts"
}, (opts) => askStudio.__executeServer(opts));
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
}).handler(askStudio_createServerFn_handler, async ({ data }) => {
	if (!data.messages.length || data.messages[data.messages.length - 1]?.role !== "user") return {
		ok: false,
		error: "Nachricht fehlt."
	};
	return await chatComplete([{
		role: "system",
		content: systemPrompt(data.mode, data.preferences)
	}, ...data.messages], data.mode === "agent" ? 1100 : 900, data.route);
});
var STYLE_HINT = {
	cinematic: "cinematic lighting, film still, shallow depth of field",
	"3d": "polished 3D render, studio lighting",
	photo: "photorealistic, natural light, sharp detail",
	cyber: "cyberpunk neon night, controlled highlights"
};
var generateStudioImage_createServerFn_handler = createServerRpc({
	id: "a5ed83bf093f40bb0b0d19874c0852366b84d57752b5a99b9d8c9fd1ce43943e",
	name: "generateStudioImage",
	filename: "src/lib/studio/ai.functions.ts"
}, (opts) => generateStudioImage.__executeServer(opts));
var generateStudioImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const aspect = ASPECTS.has(clip(data.aspect, 8)) ? clip(data.aspect, 8) : "1:1";
	const style = clip(data.style, 24);
	return {
		prompt: clip(data.prompt, 1200).trim(),
		style,
		aspect
	};
}).handler(generateStudioImage_createServerFn_handler, async ({ data }) => {
	if (data.prompt.length < 2) return {
		ok: false,
		error: "Beschreibe zuerst das Bild."
	};
	const apiKey = readKey();
	if (!apiKey) return {
		ok: false,
		error: "Bildgenerierung ist gerade nicht verfügbar."
	};
	const hint = STYLE_HINT[data.style];
	const prompt = hint ? `${data.prompt}. Style: ${hint}.` : data.prompt;
	try {
		const res = await fetch("https://api.x.ai/v1/images/generations", {
			method: "POST",
			signal: AbortSignal.timeout(6e4),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: IMAGE_MODEL,
				prompt,
				n: 1,
				aspect_ratio: data.aspect,
				resolution: "1k",
				response_format: "url"
			})
		});
		if (!res.ok) return {
			ok: false,
			error: `Bild fehlgeschlagen (Status ${res.status}).`
		};
		const body = await res.json();
		const url = body.data?.[0]?.url || body.url || "";
		if (!url) return {
			ok: false,
			error: "Kein Bild zurückgekommen."
		};
		return {
			ok: true,
			url
		};
	} catch {
		return {
			ok: false,
			error: "Die Bildanfrage hat zu lange gedauert."
		};
	}
});
function asStoryboard(text, aspect, duration) {
	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	const raw = (fenced ? fenced[1] : text).trim();
	try {
		const parsed = JSON.parse(raw);
		const clean = (Array.isArray(parsed.scenes) ? parsed.scenes.slice(0, 6) : []).map((scene) => ({
			title: clip(scene?.title, 80) || "Szene",
			camera: clip(scene?.camera, 180),
			action: clip(scene?.action, 240),
			visual: clip(scene?.visual, 400)
		})).filter((scene) => scene.visual || scene.action || scene.camera);
		if (!clean.length) throw new Error("empty");
		return {
			title: clip(parsed.title, 80) || "Storyboard",
			aspect: clip(parsed.aspect, 12) || aspect,
			duration: typeof parsed.duration === "number" ? parsed.duration : duration,
			voiceover: clip(parsed.voiceover, 400),
			music: clip(parsed.music, 200),
			scenes: clean
		};
	} catch {
		return {
			title: "Storyboard",
			aspect,
			duration,
			voiceover: "",
			music: "",
			scenes: [{
				title: "Entwurf",
				camera: "",
				action: "",
				visual: text.slice(0, 4e3)
			}]
		};
	}
}
var generateStoryboard_createServerFn_handler = createServerRpc({
	id: "e601ccdc6dadb5fca9a803c9f0761607c6896fb7fa66a78d59565c09e096b95a",
	name: "generateStoryboard",
	filename: "src/lib/studio/ai.functions.ts"
}, (opts) => generateStoryboard.__executeServer(opts));
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
}).handler(generateStoryboard_createServerFn_handler, async ({ data }) => {
	if (data.prompt.length < 2) return {
		ok: false,
		error: "Beschreibe zuerst das Video."
	};
	const result = await chatComplete([{
		role: "system",
		content: "Erstelle ein Kurzvideo-Storyboard. Antworte NUR mit JSON: {\"title\":\"\",\"aspect\":\"\",\"duration\":10,\"voiceover\":\"\",\"music\":\"\",\"scenes\":[{\"title\":\"\",\"camera\":\"\",\"action\":\"\",\"visual\":\"\"}]}. Genau 4 Szenen. Sprache: Deutsch."
	}, {
		role: "user",
		content: `Prompt: ${data.prompt}\nFormat: ${data.aspect}\nDauer: ${data.duration} Sekunden`
	}], 900, data.route);
	if (!result.ok) return result;
	return {
		ok: true,
		storyboard: asStoryboard(result.text, data.aspect, data.duration)
	};
});
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
var assistCode_createServerFn_handler = createServerRpc({
	id: "a98c7cb21212b3c717ab44977ed40fde0acbb8c74337fc1b2091b6d163e0ee6f",
	name: "assistCode",
	filename: "src/lib/studio/ai.functions.ts"
}, (opts) => assistCode.__executeServer(opts));
var assistCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		action: ACTIONS.has(data.action) ? data.action : "explain",
		path: clip(data.path, 120) || "datei.txt",
		content: clip(data.content, 12e3),
		instruction: clip(data.instruction, 2e3),
		preferences: prefsOf(data.preferences),
		route: routeOf(input)
	};
}).handler(assistCode_createServerFn_handler, async ({ data }) => {
	const instruction = data.action === "explain" ? "Erkläre die Datei klar. Setze code auf null." : data.action === "fix" ? "Korrigiere Fehler. code ist die vollständige Datei." : data.action === "optimize" ? "Verbessere Lesbarkeit und Struktur, ohne das Verhalten zu ändern. code ist die vollständige Datei." : data.action === "tests" ? "Schreibe eine fokussierte Testdatei. code ist NUR die Testdatei." : data.action === "debug" ? "Finde den wahrscheinlichsten Fehler und liefere die korrigierte Datei in code." : data.instruction || "Setze die Anweisung um. code ist die vollständige Datei, oder null wenn keine Änderung nötig ist.";
	const result = await chatComplete([{
		role: "system",
		content: [
			systemPrompt("code", data.preferences),
			"Antworte NUR mit JSON: {\"explanation\":\"kurz\",\"code\":null oder \"vollständiger Dateitext\"}.",
			"Kein Markdown außerhalb des JSON."
		].join("\n")
	}, {
		role: "user",
		content: `Datei: ${data.path}\nAktion: ${data.action}\n${instruction}\n\n---\n${data.content}`
	}], 1800, data.route);
	if (!result.ok) return result;
	const parsed = parseCodeReply(result.text, data.action);
	return {
		ok: true,
		explanation: parsed.explanation,
		code: parsed.code
	};
});
//#endregion
export { askStudio_createServerFn_handler, assistCode_createServerFn_handler, generateStoryboard_createServerFn_handler, generateStudioImage_createServerFn_handler, studioHealth_createServerFn_handler };
