import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { ChatRoute, CodeAction, Prefs, ProviderId, Storyboard } from "@/lib/studio/types";

const CHAT_MODEL = "grok-4.5";
const IMAGE_MODEL = "grok-imagine-image";

type PrefInput = Pick<Prefs, "language" | "tone" | "notes">;

const ASPECTS = new Set(["1:1", "16:9", "9:16"]);
const ACTIONS = new Set<CodeAction>(["explain", "fix", "optimize", "tests", "debug", "custom"]);

function readKey() {
  return process.env.XAI_API_KEY;
}

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function prefsOf(input: unknown): PrefInput {
  const prefs = (input ?? {}) as Partial<PrefInput>;
  return {
    language: clip(prefs.language, 40) || "Deutsch",
    tone: clip(prefs.tone, 80) || "Präzise",
    notes: clip(prefs.notes, 500),
  };
}

function systemPrompt(mode: string, prefs: PrefInput) {
  return [
    "Du bist SusiAI, die Assistentin in SusiAI Studio.",
    `Modus: ${mode}.`,
    `Sprache der Antwort: ${prefs.language}.`,
    `Ton: ${prefs.tone}.`,
    `Notizen des Nutzers: ${prefs.notes || "keine"}.`,
    "Antworte hilfreich, konkret und ohne Floskeln.",
    "Bei Code liefere vollständige Beispiele in Markdown-Codeblöcken.",
    "Erfinde keine API-Keys und keine privaten Daten.",
  ].join("\n");
}

const ENDPOINTS: Record<Exclude<ProviderId, "grok">, { url: string; model: string; label: string }> = {
  dahl: {
    url: "https://inference.dahl.global/v1/chat/completions",
    model: "MiniMaxAI/MiniMax-M2.7",
    label: "Dahl",
  },
  gonka: {
    url: "https://api.gonkarouter.io/v1/chat/completions",
    model: "MiniMaxAI/MiniMax-M2.7",
    label: "GonkaRouter",
  },
  sambanova: {
    url: "https://api.sambanova.ai/v1/chat/completions",
    model: "Meta-Llama-3.3-70B-Instruct",
    label: "SambaNova",
  },
};

export function routeOf(input: unknown): ChatRoute {
  const bag = (input ?? {}) as { route?: unknown };
  const data = (bag.route ?? {}) as Partial<ChatRoute>;
  const provider: ProviderId =
    data.provider === "dahl" || data.provider === "gonka" || data.provider === "sambanova" ? data.provider : "grok";
  return {
    provider,
    key: clip(data.key, 300),
    model: clip(data.model, 120),
  };
}

async function chatComplete(
  messages: { role: string; content: string }[],
  maxTokens: number,
  route: ChatRoute = { provider: "grok", key: "", model: "" },
) {
  const external = route.provider === "grok" ? null : ENDPOINTS[route.provider];
  const apiKey = external ? route.key.trim() : readKey();
  if (!apiKey) {
    return {
      ok: false as const,
      error: external
        ? `Schlüssel für ${external.label} fehlt. Trag ihn unter Anbindungen ein.`
        : "KI ist in dieser Umgebung nicht verfügbar.",
    };
  }
  try {
    const res = await fetch(external?.url ?? "https://api.x.ai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(45_000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: external ? route.model.trim() || external.model : CHAT_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.5,
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: await providerError(res, external?.label ?? "SusiAI") };
    }
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Die KI hat keine Antwort geliefert." };
    return { ok: true as const, text };
  } catch {
    return { ok: false as const, error: "Die Anfrage hat zu lange gedauert oder ist fehlgeschlagen." };
  }
}

async function providerError(res: Response, label: string) {
  let message = "";
  try {
    const body = (await res.json()) as { error?: { message?: string } | string };
    message = typeof body.error === "string" ? body.error : (body.error?.message ?? "");
  } catch {
    message = "";
  }
  const text = message.toLowerCase();
  if (res.status === 402 || text.includes("exhausted") || text.includes("insufficient")) {
    return label === "Dahl"
      ? "Dahl-Guthaben ist leer. Lege auf inference.dahl.global/account einen neuen Schlüssel an und ersetze ihn unter Anbindungen."
      : `${label}-Guthaben ist aufgebraucht. Trag unter Anbindungen einen neuen Schlüssel ein.`;
  }
  if (res.status === 401) return `${label} hat den Schlüssel abgelehnt. Prüfe ihn unter Anbindungen.`;
  return message ? `${label}: ${message.slice(0, 160)}` : `${label} hat mit Status ${res.status} geantwortet.`;
}

export async function openStudioStream(input: unknown, signal: AbortSignal): Promise<Response> {
  const bag = (input ?? {}) as {
    kind?: unknown;
    mode?: unknown;
    messages?: unknown;
    action?: unknown;
    path?: unknown;
    content?: unknown;
    instruction?: unknown;
  };
  const route = routeOf(input);
  const prefs = prefsOf((input as { preferences?: unknown } | null)?.preferences);
  const kind = bag.kind === "code" ? "code" : "chat";
  let messages: { role: string; content: string }[] = [];
  let maxTokens = 900;
  if (kind === "code") {
    const action = ACTIONS.has(bag.action as CodeAction) ? (bag.action as CodeAction) : "explain";
    const path = clip(bag.path, 120) || "datei.txt";
    const content = clip(bag.content, 12_000);
    const instructionText = clip(bag.instruction, 2000);
    const instruction =
      action === "explain"
        ? "Erkläre die Datei klar. Setze code auf null."
        : action === "fix"
          ? "Korrigiere Fehler. code ist die vollständige Datei."
          : action === "optimize"
            ? "Verbessere Lesbarkeit und Struktur, ohne das Verhalten zu ändern. code ist die vollständige Datei."
            : action === "tests"
              ? "Schreibe eine fokussierte Testdatei. code ist NUR die Testdatei."
              : action === "debug"
                ? "Finde den wahrscheinlichsten Fehler und liefere die korrigierte Datei in code."
                : instructionText || "Setze die Anweisung um. code ist die vollständige Datei, oder null wenn keine Änderung nötig ist.";
    messages = [
      {
        role: "system",
        content: [
          systemPrompt("code", prefs),
          'Antworte NUR mit JSON: {"explanation":"kurz","code":null oder "vollständiger Dateitext"}.',
          "Kein Markdown außerhalb des JSON.",
        ].join("\n"),
      },
      { role: "user", content: `Datei: ${path}\nAktion: ${action}\n${instruction}\n\n---\n${content}` },
    ];
    maxTokens = 1400;
  } else {
    const rows = Array.isArray(bag.messages) ? bag.messages.slice(-12) : [];
    const safe = rows
      .map((row) => {
        const message = row as { role?: unknown; content?: unknown };
        const role = message.role === "assistant" ? "assistant" : message.role === "user" ? "user" : null;
        const content = clip(message.content, 6000);
        if (!role || !content.trim()) return null;
        return { role, content };
      })
      .filter((row): row is { role: "user" | "assistant"; content: string } => row !== null);
    if (!safe.length || safe[safe.length - 1]?.role !== "user") {
      return Response.json({ error: "Nachricht fehlt." }, { status: 400 });
    }
    const mode = clip(bag.mode, 24) || "chat";
    messages = [{ role: "system", content: systemPrompt(mode, prefs) }, ...safe];
    maxTokens = mode === "agent" ? 1100 : 900;
  }

  const external = route.provider === "grok" ? null : ENDPOINTS[route.provider];
  const apiKey = external ? route.key.trim() : readKey();
  const label = external?.label ?? "SusiAI";
  if (!apiKey) {
    return Response.json(
      { error: external ? `Schlüssel für ${label} fehlt. Trag ihn unter Anbindungen ein.` : "KI ist in dieser Umgebung nicht verfügbar." },
      { status: 400 },
    );
  }
  const model = external ? route.model.trim() || external.model : CHAT_MODEL;
  let res: Response;
  try {
    res = await fetch(external?.url ?? "https://api.x.ai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.5, stream: true }),
    });
  } catch {
    return Response.json({ error: "Die Anfrage hat zu lange gedauert oder ist fehlgeschlagen." }, { status: 504 });
  }
  if (!res.ok) return Response.json({ error: await providerError(res, label) }, { status: res.status });
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("text/event-stream")) {
    const body = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
    const text = body?.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) return Response.json({ error: "Die KI hat keine Antwort geliefert." }, { status: 502 });
    return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Studio-Model": model } });
  }
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const upstream = res.body;
  if (!upstream) return Response.json({ error: "Die KI hat keine Antwort geliefert." }, { status: 502 });
  const stream = new ReadableStream({
    async start(controller) {
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
              const json = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] };
              const delta = json.choices?.[0]?.delta?.content ?? "";
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              /* keepalive */
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Studio-Model": model },
  });
}

export const studioHealth = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async () => {
  return { ai: Boolean(readKey()) };
});

type ChatPayload = {
  mode: string;
  messages: { role: "user" | "assistant"; content: string }[];
  preferences: PrefInput;
  route: ChatRoute;
};

export const askStudio = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown): ChatPayload => {
    const data = (input ?? {}) as {
      mode?: unknown;
      messages?: unknown;
      preferences?: unknown;
    };
    const messages = Array.isArray(data.messages) ? data.messages.slice(-12) : [];
    const safe = messages
      .map((m) => {
        const row = m as { role?: unknown; content?: unknown };
        const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
        const content = clip(row.content, 6000);
        if (!role || !content.trim()) return null;
        return { role, content };
      })
      .filter((m): m is { role: "user" | "assistant"; content: string } => m !== null);
    const mode = clip(data.mode, 24) || "chat";
    return { mode, messages: safe, preferences: prefsOf(data.preferences), route: routeOf(input) };
  })
  .handler(async ({ data }) => {
    if (!data.messages.length || data.messages[data.messages.length - 1]?.role !== "user") {
      return { ok: false as const, error: "Nachricht fehlt." };
    }
    const result = await chatComplete(
      [{ role: "system", content: systemPrompt(data.mode, data.preferences) }, ...data.messages],
      data.mode === "agent" ? 1100 : 900,
      data.route,
    );
    return result;
  });

type ImagePayload = { prompt: string; style: string; aspect: string };

const STYLE_HINT: Record<string, string> = {
  cinematic: "cinematic lighting, film still, shallow depth of field",
  "3d": "polished 3D render, studio lighting",
  photo: "photorealistic, natural light, sharp detail",
  cyber: "cyberpunk neon night, controlled highlights",
};

export const generateStudioImage = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown): ImagePayload => {
    const data = (input ?? {}) as Partial<ImagePayload>;
    const aspect = ASPECTS.has(clip(data.aspect, 8)) ? clip(data.aspect, 8) : "1:1";
    const style = clip(data.style, 24);
    return { prompt: clip(data.prompt, 1200).trim(), style, aspect };
  })
  .handler(async ({ data }) => {
    if (data.prompt.length < 2) return { ok: false as const, error: "Beschreibe zuerst das Bild." };
    const apiKey = readKey();
    if (!apiKey) return { ok: false as const, error: "Bildgenerierung ist gerade nicht verfügbar." };
    const hint = STYLE_HINT[data.style];
    const prompt = hint ? `${data.prompt}. Style: ${hint}.` : data.prompt;
    try {
      const res = await fetch("https://api.x.ai/v1/images/generations", {
        method: "POST",
        signal: AbortSignal.timeout(60_000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt,
          n: 1,
          aspect_ratio: data.aspect,
          resolution: "1k",
          response_format: "url",
        }),
      });
      if (!res.ok) {
        return { ok: false as const, error: `Bild fehlgeschlagen (Status ${res.status}).` };
      }
      const body = (await res.json()) as { data?: { url?: string }[]; url?: string };
      const url = body.data?.[0]?.url || body.url || "";
      if (!url) return { ok: false as const, error: "Kein Bild zurückgekommen." };
      return { ok: true as const, url };
    } catch {
      return { ok: false as const, error: "Die Bildanfrage hat zu lange gedauert." };
    }
  });

type VideoPayload = { prompt: string; aspect: string; duration: number; route: ChatRoute };

function asStoryboard(text: string, aspect: string, duration: number): Storyboard {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  try {
    const parsed = JSON.parse(raw) as Partial<Storyboard>;
    const scenes = Array.isArray(parsed.scenes) ? parsed.scenes.slice(0, 6) : [];
    const clean = scenes
      .map((scene) => ({
        title: clip(scene?.title, 80) || "Szene",
        camera: clip(scene?.camera, 180),
        action: clip(scene?.action, 240),
        visual: clip(scene?.visual, 400),
      }))
      .filter((scene) => scene.visual || scene.action || scene.camera);
    if (!clean.length) throw new Error("empty");
    return {
      title: clip(parsed.title, 80) || "Storyboard",
      aspect: clip(parsed.aspect, 12) || aspect,
      duration: typeof parsed.duration === "number" ? parsed.duration : duration,
      voiceover: clip(parsed.voiceover, 400),
      music: clip(parsed.music, 200),
      scenes: clean,
    };
  } catch {
    return {
      title: "Storyboard",
      aspect,
      duration,
      voiceover: "",
      music: "",
      scenes: [{ title: "Entwurf", camera: "", action: "", visual: text.slice(0, 4000) }],
    };
  }
}

export const generateStoryboard = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown): VideoPayload => {
    const data = (input ?? {}) as Partial<VideoPayload>;
    const aspect = ASPECTS.has(clip(data.aspect, 8)) ? clip(data.aspect, 8) : "16:9";
    const duration = data.duration === 6 || data.duration === 10 || data.duration === 15 ? data.duration : 10;
    return { prompt: clip(data.prompt, 1200).trim(), aspect, duration, route: routeOf(input) };
  })
  .handler(async ({ data }) => {
    if (data.prompt.length < 2) return { ok: false as const, error: "Beschreibe zuerst das Video." };
    const result = await chatComplete(
      [
        {
          role: "system",
          content:
            'Erstelle ein Kurzvideo-Storyboard. Antworte NUR mit JSON: {"title":"","aspect":"","duration":10,"voiceover":"","music":"","scenes":[{"title":"","camera":"","action":"","visual":""}]}. Genau 4 Szenen. Sprache: Deutsch.',
        },
        {
          role: "user",
          content: `Prompt: ${data.prompt}\nFormat: ${data.aspect}\nDauer: ${data.duration} Sekunden`,
        },
      ],
      900,
      data.route,
    );
    if (!result.ok) return result;
    return { ok: true as const, storyboard: asStoryboard(result.text, data.aspect, data.duration) };
  });

type CodePayload = {
  action: CodeAction;
  path: string;
  content: string;
  instruction: string;
  preferences: PrefInput;
  route: ChatRoute;
};

export function parseCodeReply(text: string, action: CodeAction) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  try {
    const parsed = JSON.parse(raw) as { explanation?: unknown; code?: unknown };
    const explanation = clip(parsed.explanation, 4000) || "Fertig.";
    const code = action === "explain" ? null : typeof parsed.code === "string" ? parsed.code : null;
    return { explanation, code };
  } catch {
    const block = text.match(/```[\w-]*\n([\s\S]*?)```/);
    return {
      explanation: text.slice(0, 4000),
      code: action === "explain" ? null : block ? block[1] : null,
    };
  }
}

export const assistCode = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown): CodePayload => {
    const data = (input ?? {}) as Partial<CodePayload>;
    const action = ACTIONS.has(data.action as CodeAction) ? (data.action as CodeAction) : "explain";
    return {
      action,
      path: clip(data.path, 120) || "datei.txt",
      content: clip(data.content, 12_000),
      instruction: clip(data.instruction, 2000),
      preferences: prefsOf(data.preferences),
      route: routeOf(input),
    };
  })
  .handler(async ({ data }) => {
    const instruction =
      data.action === "explain"
        ? "Erkläre die Datei klar. Setze code auf null."
        : data.action === "fix"
          ? "Korrigiere Fehler. code ist die vollständige Datei."
          : data.action === "optimize"
            ? "Verbessere Lesbarkeit und Struktur, ohne das Verhalten zu ändern. code ist die vollständige Datei."
            : data.action === "tests"
              ? "Schreibe eine fokussierte Testdatei. code ist NUR die Testdatei."
              : data.action === "debug"
                ? "Finde den wahrscheinlichsten Fehler und liefere die korrigierte Datei in code."
                : data.instruction || "Setze die Anweisung um. code ist die vollständige Datei, oder null wenn keine Änderung nötig ist.";

    const result = await chatComplete(
      [
        {
          role: "system",
          content: [
            systemPrompt("code", data.preferences),
            'Antworte NUR mit JSON: {"explanation":"kurz","code":null oder "vollständiger Dateitext"}.',
            "Kein Markdown außerhalb des JSON.",
          ].join("\n"),
        },
        {
          role: "user",
          content: `Datei: ${data.path}\nAktion: ${data.action}\n${instruction}\n\n---\n${data.content}`,
        },
      ],
      1800,
      data.route,
    );
    if (!result.ok) return result;
    const parsed = parseCodeReply(result.text, data.action);
    return { ok: true as const, explanation: parsed.explanation, code: parsed.code };
  });
