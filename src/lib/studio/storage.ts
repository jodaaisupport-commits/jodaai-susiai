import type { McpEndpoint, Persisted, Prefs, Project, ProviderId, StudioFile, StudioLinks } from "@/lib/studio/types";

const KEY = "susiai-studio-v1";

export const DEFAULT_PREFS: Prefs = {
  language: "Deutsch",
  tone: "Präzise",
  notes: "",
};

export const DEFAULT_LINKS: StudioLinks = {
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
  mcp: [],
};

export function defaultFiles(): StudioFile[] {
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
`,
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
`,
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
`,
    },
    {
      path: "README.md",
      content: `# SusiAI Lab

Dieses Projekt lebt lokal in deinem Browser.
Frag SusiAI im Code-Studio nach Erklärungen, Fixes oder Tests.
`,
    },
  ];
}

export function makeProject(name: string): Project {
  const files = defaultFiles();
  return {
    id: crypto.randomUUID(),
    name,
    updatedAt: Date.now(),
    messages: [],
    files,
    activePath: files[0].path,
    images: [],
    storyboard: null,
  };
}

export function freshState(): Persisted {
  const project = makeProject("SusiAI Lab");
  return {
    activeId: project.id,
    prefs: { ...DEFAULT_PREFS },
    projects: [project],
    links: { ...DEFAULT_LINKS, mcp: [] },
  };
}

function normalizeProject(input: Partial<Project>): Project {
  const files =
    Array.isArray(input.files) && input.files.length > 0
      ? input.files.filter((f) => f && typeof f.path === "string" && typeof f.content === "string")
      : defaultFiles();
  const safeFiles = files.length ? files : defaultFiles();
  const activePath = safeFiles.some((f) => f.path === input.activePath)
    ? (input.activePath as string)
    : safeFiles[0].path;
  return {
    id: typeof input.id === "string" ? input.id : crypto.randomUUID(),
    name: typeof input.name === "string" && input.name.trim() ? input.name : "Projekt",
    updatedAt: typeof input.updatedAt === "number" ? input.updatedAt : Date.now(),
    messages: Array.isArray(input.messages) ? input.messages : [],
    files: safeFiles,
    activePath,
    images: Array.isArray(input.images) ? input.images : [],
    storyboard: input.storyboard && Array.isArray(input.storyboard.scenes) ? input.storyboard : null,
  };
}

function normalizeLinks(input: Partial<StudioLinks> | undefined): StudioLinks {
  const known: ProviderId[] = ["grok", "dahl", "gonka", "sambanova"];
  const provider: ProviderId = known.includes(input?.provider as ProviderId)
    ? (input?.provider as ProviderId)
    : "grok";
  const mcp = Array.isArray(input?.mcp)
    ? input.mcp
        .filter((item): item is McpEndpoint =>
          Boolean(item && typeof item.id === "string" && typeof item.url === "string"),
        )
        .slice(0, 12)
        .map((item) => ({
          id: item.id,
          name: typeof item.name === "string" && item.name.trim() ? item.name.slice(0, 60) : "MCP",
          url: item.url.slice(0, 300),
          token: typeof item.token === "string" ? item.token.slice(0, 300) : "",
        }))
    : [];
  return {
    provider,
    dahlKey: typeof input?.dahlKey === "string" ? input.dahlKey.slice(0, 300) : "",
    dahlModel:
      typeof input?.dahlModel === "string" && input.dahlModel.trim()
        ? input.dahlModel.slice(0, 120)
        : DEFAULT_LINKS.dahlModel,
    gonkaKey: typeof input?.gonkaKey === "string" ? input.gonkaKey.slice(0, 300) : "",
    gonkaModel:
      typeof input?.gonkaModel === "string" && input.gonkaModel.trim()
        ? input.gonkaModel.slice(0, 120)
        : DEFAULT_LINKS.gonkaModel,
    sambanovaKey: typeof input?.sambanovaKey === "string" ? input.sambanovaKey.slice(0, 300) : "",
    sambanovaModel:
      typeof input?.sambanovaModel === "string" && input.sambanovaModel.trim()
        ? input.sambanovaModel.slice(0, 120)
        : DEFAULT_LINKS.sambanovaModel,
    codekitKey: typeof input?.codekitKey === "string" ? input.codekitKey.slice(0, 300) : "",
    githubToken: typeof input?.githubToken === "string" ? input.githubToken.slice(0, 400) : "",
    appUrl: typeof input?.appUrl === "string" ? input.appUrl.slice(0, 300) : "",
    mcp,
  };
}

export function routeFromLinks(links: StudioLinks) {
  if (links.provider === "dahl") return { provider: links.provider, key: links.dahlKey, model: links.dahlModel };
  if (links.provider === "gonka") return { provider: links.provider, key: links.gonkaKey, model: links.gonkaModel };
  if (links.provider === "sambanova") {
    return { provider: links.provider, key: links.sambanovaKey, model: links.sambanovaModel };
  }
  return { provider: "grok" as const, key: "", model: "" };
}

export function providerLabel(provider: ProviderId) {
  if (provider === "dahl") return "Dahl";
  if (provider === "gonka") return "GonkaRouter";
  if (provider === "sambanova") return "SambaNova";
  return "SusiAI";
}

export function loadState(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Persisted>;
    if (!data || !Array.isArray(data.projects) || data.projects.length === 0) return null;
    const projects = data.projects.map((p) => normalizeProject(p));
    const activeId = projects.some((p) => p.id === data.activeId) ? (data.activeId as string) : projects[0].id;
    const prefs = {
      language: typeof data.prefs?.language === "string" ? data.prefs.language : DEFAULT_PREFS.language,
      tone: typeof data.prefs?.tone === "string" ? data.prefs.tone : DEFAULT_PREFS.tone,
      notes: typeof data.prefs?.notes === "string" ? data.prefs.notes : "",
    };
    return { activeId, prefs, projects, links: normalizeLinks(data.links) };
  } catch {
    return null;
  }
}

export function saveState(state: Persisted) {
  queue = queue.then(() => writeState(state)).catch(() => undefined);
}

let queue: Promise<void> = Promise.resolve();

async function writeState(state: Persisted) {
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
        images.push({ ...image, url: `idb:${image.id}` });
      } catch {
        images.push({ ...image, url: image.url.slice(0, 180) });
      }
    }
    projects.push({
      ...project,
      messages: project.messages.slice(-80),
      images,
      files: project.files.slice(0, 24).map((file) => ({
        path: file.path,
        content: file.content.slice(0, 60_000),
      })),
    });
  }
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, projects }));
  } catch {
    /* storage full — keep the session in memory */
  }
}

function imageDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("susiai-studio", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("images")) request.result.createObjectStore("images");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putImage(id: string, url: string) {
  return imageDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction("images", "readwrite");
        tx.objectStore("images").put(url, id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

function readImage(id: string) {
  return imageDb().then(
    (db) =>
      new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction("images", "readonly");
        const request = tx.objectStore("images").get(id);
        request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : null);
        request.onerror = () => reject(request.error);
      }),
  );
}

export async function hydrateImages(state: Persisted): Promise<Persisted> {
  const projects = await Promise.all(
    state.projects.map(async (project) => ({
      ...project,
      images: await Promise.all(
        project.images.map(async (image) => {
          if (!image.url.startsWith("idb:")) return image;
          const url = await readImage(image.url.slice(4)).catch(() => null);
          return url ? { ...image, url } : image;
        }),
      ),
    })),
  );
  return { ...state, projects };
}
