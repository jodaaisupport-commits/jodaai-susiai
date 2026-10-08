import { useEffect, useState, type ReactNode } from "react";
import { Plug, Trash2 } from "lucide-react";
import { askStudio } from "@/lib/studio/ai.functions";
import { callCatalogTool, dahlBalance, listRemoteModels, probeCodekit, probeGithub, probeMcpServer, probePlatformLinks } from "@/lib/studio/links.functions";
import { providerLabel, routeFromLinks } from "@/lib/studio/storage";
import type { McpEndpoint, Prefs, StudioLinks } from "@/lib/studio/types";

const modelCache: { dahl?: string[]; sambanova?: string[] } = {};

const PLATFORM = [
  { id: "GoogleDrive", label: "Google Drive", detail: "Dateien suchen" },
  { id: "Gmail", label: "Gmail", detail: "Postfach" },
  { id: "GoogleCalendar", label: "Google Kalender", detail: "Termine" },
  { id: "Outlook", label: "Outlook", detail: "Mail" },
  { id: "OutlookCalendar", label: "Outlook Kalender", detail: "Termine" },
  { id: "MicrosoftTeams", label: "Microsoft Teams", detail: "Chats" },
  { id: "Mcp", label: "MCP-Katalog", detail: "Server aus dem Grok-Konto" },
] as const;

export function LinksPane({
  links,
  prefs,
  grokReady,
  onChange,
}: {
  links: StudioLinks;
  prefs: Prefs;
  grokReady: boolean | null;
  onChange: (links: StudioLinks) => void;
}) {
  const [dahlModels, setDahlModels] = useState<string[]>([]);
  const [gonkaModels, setGonkaModels] = useState<string[]>([]);
  const [sambaModels, setSambaModels] = useState<string[]>([]);
  const [codekitNote, setCodekitNote] = useState("");
  const [githubLogin, setGithubLogin] = useState("");
  const [repos, setRepos] = useState<{ fullName: string; htmlUrl: string }[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [mcpName, setMcpName] = useState("");
  const [mcpUrl, setMcpUrl] = useState("");
  const [mcpToken, setMcpToken] = useState("");
  const [tools, setTools] = useState<Record<string, string[]>>({});
  const [gate, setGate] = useState("");
  const [checks, setChecks] = useState<Record<string, string>>({});
  const [catalogId, setCatalogId] = useState("");
  const [catalogTool, setCatalogTool] = useState("");
  const [catalogArgs, setCatalogArgs] = useState("{}");
  const [catalogNote, setCatalogNote] = useState("");
  const [tab, setTab] = useState<"modelle" | "werkzeuge" | "grok">("modelle");
  const [dahlTokens, setDahlTokens] = useState<number | null>(null);
  const [dahlNote, setDahlNote] = useState("");

  useEffect(() => {
    if (modelCache.dahl) setDahlModels(modelCache.dahl);
    else {
      listRemoteModels({ data: { provider: "dahl", key: "" } })
        .then((result) => {
          if (result.ok) {
            modelCache.dahl = result.models;
            setDahlModels(result.models);
          }
        })
        .catch(() => undefined);
    }
    if (modelCache.sambanova) setSambaModels(modelCache.sambanova);
    else {
      listRemoteModels({ data: { provider: "sambanova", key: "" } })
        .then((result) => {
          if (result.ok) {
            modelCache.sambanova = result.models;
            setSambaModels(result.models);
          }
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const key = links.dahlKey.trim();
    if (key.length < 8) {
      setDahlTokens(null);
      setDahlNote("");
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      dahlBalance({ data: { key } })
        .then((result) => {
          if (cancelled) return;
          setDahlTokens(result.tokens);
          setDahlNote(result.ok ? "" : result.error);
        })
        .catch(() => {
          if (!cancelled) setDahlNote("Kontostand nicht erreichbar.");
        });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [links.dahlKey]);

  function routeFor(provider: StudioLinks["provider"]) {
    return routeFromLinks({ ...links, provider });
  }

  async function testProvider(provider: StudioLinks["provider"]) {
    setBusy(provider);
    setNote("");
    try {
      const result = await askStudio({
        data: {
          mode: "chat",
          messages: [{ role: "user", content: "Antworte nur mit OK." }],
          preferences: prefs,
          route: routeFor(provider),
        },
      });
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
      const result = await listRemoteModels({ data: { provider: "gonka", key: links.gonkaKey } });
      if (!result.ok) setNote(result.error);
      else {
        setGonkaModels(result.models);
        if (!result.models.includes(links.gonkaModel)) onChange({ ...links, gonkaModel: result.models[0] });
      }
    } finally {
      setBusy("");
    }
  }

  async function checkMcp(item: McpEndpoint) {
    setBusy(item.id);
    const result = await probeMcpServer({ data: { url: item.url, token: item.token } });
    setTools((current) => ({
      ...current,
      [item.id]: result.ok ? result.tools.map((tool) => tool.name) : [],
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
      setGate(
        result.tokenReady
          ? "Grok-Token vorhanden."
          : "Noch kein Connector-Token. In der Grok-Vorschau erscheint es automatisch.",
      );
      setChecks({
        GoogleDrive: result.checks.GoogleDrive.message,
        GoogleCalendar: result.checks.GoogleCalendar.message,
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
      const result = await callCatalogTool({
        data: { catalogId, tool: catalogTool, args: catalogArgs },
      });
      setCatalogNote(result.ok ? result.preview || result.message : result.message);
    } catch {
      setCatalogNote("Aufruf fehlgeschlagen.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold">Anbindungen</h2>
          <p className="mt-1 text-sm text-muted">
            Chat, Code und Storyboards laufen über die aktive Verbindung. Schlüssel bleiben in diesem Browser.
          </p>
        </div>

        <div className="grid grid-cols-3 rounded-xl bg-bg p-1">
          {(
            [
              ["modelle", "Modelle"],
              ["werkzeuge", "Werkzeuge"],
              ["grok", "Grok"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={`h-10 rounded-lg text-sm font-semibold ${tab === id ? "bg-raised text-fg" : "text-muted"}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "modelle" && (
        <>
        <section className="grid gap-3">
          <ProviderCard
            title="SusiAI"
            detail="Grok über die eingebaute Verbindung"
            active={links.provider === "grok"}
            status={grokReady === null ? "Prüfe…" : grokReady ? "Bereit" : "Offline"}
            onSelect={() => onChange({ ...links, provider: "grok" })}
            onTest={() => testProvider("grok")}
            testing={busy === "grok"}
          />
          <ProviderCard
            title="Dahl"
            detail="inference.dahl.global"
            active={links.provider === "dahl"}
            status={
              !links.dahlKey.trim()
                ? "Schlüssel fehlt"
                : dahlTokens === 0
                  ? "Guthaben leer"
                  : dahlTokens != null
                    ? `${new Intl.NumberFormat("de-DE").format(dahlTokens)} Tokens`
                    : "Schlüssel gesetzt"
            }
            onSelect={() => onChange({ ...links, provider: "dahl" })}
            onTest={() => testProvider("dahl")}
            testing={busy === "dahl"}
          >
            <Secret label="Dahl API-Schlüssel" value={links.dahlKey} onChange={(dahlKey) => onChange({ ...links, dahlKey })} />
            {dahlNote && <p className="text-sm text-danger">{dahlNote}</p>}
            {dahlTokens === 0 && (
              <a
                className="text-sm text-primary underline"
                href="https://inference.dahl.global/account"
                target="_blank"
                rel="noreferrer"
              >
                Neuen Schlüssel anlegen
              </a>
            )}
            <ModelPick value={links.dahlModel} models={dahlModels} onChange={(dahlModel) => onChange({ ...links, dahlModel })} />
          </ProviderCard>
          <ProviderCard
            title="GonkaRouter"
            detail="api.gonkarouter.io"
            active={links.provider === "gonka"}
            status={links.gonkaKey.trim() ? "Schlüssel gesetzt" : "Schlüssel fehlt"}
            onSelect={() => onChange({ ...links, provider: "gonka" })}
            onTest={() => testProvider("gonka")}
            testing={busy === "gonka"}
          >
            <Secret
              label="GonkaRouter API-Schlüssel"
              value={links.gonkaKey}
              onChange={(gonkaKey) => onChange({ ...links, gonkaKey })}
            />
            <div className="flex flex-wrap items-center gap-2">
              <ModelPick
                value={links.gonkaModel}
                models={gonkaModels}
                onChange={(gonkaModel) => onChange({ ...links, gonkaModel })}
              />
              <button className="h-10 rounded-xl border border-line px-3 text-sm" onClick={loadGonka} disabled={busy === "gonka-models"}>
                Modelle laden
              </button>
            </div>
          </ProviderCard>
          <ProviderCard
            title="SambaNova Cloud"
            detail="api.sambanova.ai"
            active={links.provider === "sambanova"}
            status={links.sambanovaKey.trim() ? "Schlüssel gesetzt" : "Schlüssel fehlt"}
            onSelect={() => onChange({ ...links, provider: "sambanova" })}
            onTest={() => testProvider("sambanova")}
            testing={busy === "sambanova"}
          >
            <Secret
              label="SambaNova API-Schlüssel"
              value={links.sambanovaKey}
              onChange={(sambanovaKey) => onChange({ ...links, sambanovaKey })}
            />
            <ModelPick
              value={links.sambanovaModel}
              models={sambaModels}
              onChange={(sambanovaModel) => onChange({ ...links, sambanovaModel })}
            />
            <a className="text-sm text-primary underline" href="https://cloud.sambanova.ai/apis" target="_blank" rel="noreferrer">
              Schlüssel erstellen
            </a>
          </ProviderCard>
        </section>
        {note && <p className="text-sm text-muted">{note}</p>}
        </>
        )}

        {tab === "werkzeuge" && (
        <>
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2">
            <Plug size={16} className="text-primary" />
            <h3 className="font-semibold">MCP-Server</h3>
          </div>
          <p className="mt-1 text-sm text-muted">Streamable HTTP. Die Prüfung listet Werkzeuge, sie ruft sie nicht auf.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input value={mcpName} onChange={(e) => setMcpName(e.target.value)} placeholder="Name" className="h-11 rounded-xl border border-line bg-bg px-3 outline-none" />
            <input value={mcpUrl} onChange={(e) => setMcpUrl(e.target.value)} placeholder="https://…/mcp" className="h-11 rounded-xl border border-line bg-bg px-3 outline-none" />
            <input
              value={mcpToken}
              onChange={(e) => setMcpToken(e.target.value)}
              placeholder="Optionaler Bearer-Token"
              type="password"
              autoComplete="off"
              className="h-11 rounded-xl border border-line bg-bg px-3 outline-none sm:col-span-2"
            />
          </div>
          <button
            className="mt-3 h-11 rounded-xl bg-primary px-4 font-semibold text-primary-fg disabled:opacity-40"
            disabled={!mcpUrl.trim()}
            onClick={() => {
              const item: McpEndpoint = {
                id: crypto.randomUUID(),
                name: mcpName.trim() || "MCP",
                url: mcpUrl.trim(),
                token: mcpToken.trim(),
              };
              onChange({ ...links, mcp: [item, ...links.mcp].slice(0, 12) });
              setMcpName("");
              setMcpUrl("");
              setMcpToken("");
            }}
          >
            Server hinzufügen
          </button>
          <div className="mt-4 flex flex-col gap-2">
            {links.mcp.length === 0 && <p className="text-sm text-muted">Noch kein MCP-Server.</p>}
            {links.mcp.map((item) => (
              <article key={item.id} className="rounded-xl border border-line bg-bg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold">{item.name}</div>
                    <div className="truncate text-sm text-muted">{item.url}</div>
                  </div>
                  <button
                    aria-label="MCP entfernen"
                    className="grid size-10 place-items-center text-muted hover:text-danger"
                    onClick={() => onChange({ ...links, mcp: links.mcp.filter((row) => row.id !== item.id) })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <button className="mt-2 h-10 rounded-xl border border-line px-3 text-sm" disabled={busy === item.id} onClick={() => checkMcp(item)}>
                  {busy === item.id ? "Prüfe…" : "Werkzeuge laden"}
                </button>
                {tools[item.id] && (
                  <p className="mt-2 text-sm text-muted">
                    {tools[item.id].length ? tools[item.id].join(", ") : "Keine Werkzeuge gemeldet."}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="font-semibold">Werkzeug-Connectoren</h3>
          <p className="mt-1 text-sm text-muted">Schlüssel und Tokens bleiben in diesem Browser und werden nicht als Chat-Modell benutzt.</p>
          <div className="mt-4 grid gap-3">
            <article className="rounded-xl border border-line bg-bg p-3">
              <div className="font-semibold">0CodeKit</div>
              <p className="text-sm text-muted">prod.0codekit.com · Code, PDF und Automatisierung</p>
              <div className="mt-2 flex flex-col gap-2">
                <Secret label="0CodeKit API-Schlüssel" value={links.codekitKey} onChange={(codekitKey) => onChange({ ...links, codekitKey })} />
                <div className="flex flex-wrap items-center gap-3">
                  <button className="h-10 rounded-xl border border-line px-3 text-sm" disabled={busy === "codekit"} onClick={checkCodekit}>
                    {busy === "codekit" ? "Prüfe…" : "Prüfen"}
                  </button>
                  <a className="text-sm text-primary underline" href="https://www.0codekit.com" target="_blank" rel="noreferrer">
                    Konto
                  </a>
                </div>
                {codekitNote && <p className="text-sm text-muted">{codekitNote}</p>}
              </div>
            </article>
            <article className="rounded-xl border border-line bg-bg p-3">
              <div className="font-semibold">GitHub</div>
              <p className="text-sm text-muted">{githubLogin ? `Angemeldet als ${githubLogin}` : "Personal Access Token mit Leserecht"}</p>
              <div className="mt-2 flex flex-col gap-2">
                <Secret label="GitHub-Token" value={links.githubToken} onChange={(githubToken) => onChange({ ...links, githubToken })} />
                <div className="flex flex-wrap items-center gap-3">
                  <button className="h-10 rounded-xl border border-line px-3 text-sm" disabled={busy === "github"} onClick={checkGithub}>
                    {busy === "github" ? "Lade…" : "Konto laden"}
                  </button>
                  <a className="text-sm text-primary underline" href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">
                    Token erstellen
                  </a>
                </div>
                {repos.length > 0 && (
                  <ul className="flex flex-col gap-1 text-sm">
                    {repos.map((repo) => (
                      <li key={repo.fullName}>
                        <a className="text-primary underline" href={repo.htmlUrl} target="_blank" rel="noreferrer">
                          {repo.fullName}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
            <article className="rounded-xl border border-line bg-bg p-3">
              <div className="font-semibold">AppDeploy</div>
              <p className="text-sm text-muted">Veröffentlichte Apps im Dashboard. Die gemerkte URL bleibt lokal.</p>
              <div className="mt-2 flex flex-col gap-2">
                <input
                  value={links.appUrl}
                  onChange={(e) => onChange({ ...links, appUrl: e.target.value })}
                  placeholder="https://….appdeploy.ai"
                  aria-label="AppDeploy URL"
                  className="h-11 rounded-xl border border-line bg-bg px-3 outline-none"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <a className="text-sm text-primary underline" href="https://dashboard.appdeploy.ai" target="_blank" rel="noreferrer">
                    Dashboard öffnen
                  </a>
                  {safeHttps(links.appUrl) && (
                    <a className="text-sm text-primary underline" href={safeHttps(links.appUrl)} target="_blank" rel="noreferrer">
                      App öffnen
                    </a>
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>
        </>
        )}

        {tab === "grok" && (
        <>
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">Grok-Connectors</h3>
            <button className="h-10 rounded-xl border border-line px-3 text-sm" onClick={checkGate} disabled={busy === "gate"}>
              {busy === "gate" ? "Prüfe…" : "Status prüfen"}
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">Drive, Gmail, Kalender, Outlook, Teams und MCP-Katalog laufen über das Grok-Konto.</p>
          {gate && <p className="mt-2 text-sm">{gate}</p>}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PLATFORM.map((item) => (
              <article key={item.id} className="rounded-xl border border-line bg-bg px-3 py-3">
                <div className="font-semibold">{item.label}</div>
                <div className="text-sm text-muted">{checks[item.id] || item.detail}</div>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <div className="text-xs tracking-widest text-faint">MCP-KATALOG AUFRUFEN</div>
            <input value={catalogId} onChange={(e) => setCatalogId(e.target.value)} placeholder="Katalog-ID" className="h-11 rounded-xl border border-line bg-bg px-3 outline-none" />
            <input value={catalogTool} onChange={(e) => setCatalogTool(e.target.value)} placeholder="Werkzeugname" className="h-11 rounded-xl border border-line bg-bg px-3 outline-none" />
            <textarea value={catalogArgs} onChange={(e) => setCatalogArgs(e.target.value)} rows={3} className="rounded-xl border border-line bg-bg p-3 font-mono text-sm outline-none" />
            <button className="h-11 w-fit rounded-xl border border-line px-4 text-sm" disabled={busy === "catalog"} onClick={runCatalog}>
              {busy === "catalog" ? "Rufe auf…" : "Werkzeug aufrufen"}
            </button>
            {catalogNote && <p className="break-words text-sm text-muted">{catalogNote}</p>}
          </div>
        </section>
        </>
        )}
      </div>
    </div>
  );
}

function label(provider: StudioLinks["provider"]) {
  return providerLabel(provider);
}

function safeHttps(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function ProviderCard({
  title,
  detail,
  active,
  status,
  onSelect,
  onTest,
  testing,
  children,
}: {
  title: string;
  detail: string;
  active: boolean;
  status: string;
  onSelect: () => void;
  onTest: () => void;
  testing: boolean;
  children?: ReactNode;
}) {
  return (
    <article className={`rounded-2xl border p-4 ${active ? "border-primary bg-surface" : "border-line bg-surface"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted">{detail}</p>
          <p className="mt-1 text-xs text-faint">{status}</p>
        </div>
        <div className="flex gap-2">
          <button className={`h-10 rounded-xl px-3 text-sm ${active ? "bg-primary text-primary-fg" : "border border-line"}`} onClick={onSelect}>
            {active ? "Aktiv" : "Nutzen"}
          </button>
          <button className="h-10 rounded-xl border border-line px-3 text-sm" onClick={onTest} disabled={testing}>
            {testing ? "…" : "Prüfen"}
          </button>
        </div>
      </div>
      {children && <div className="mt-3 flex flex-col gap-2">{children}</div>}
    </article>
  );
}

function Secret({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="password"
      autoComplete="off"
      aria-label={label}
      value={value}
      placeholder={label}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-xl border border-line bg-bg px-3 outline-none"
    />
  );
}

function ModelPick({
  value,
  models,
  onChange,
}: {
  value: string;
  models: string[];
  onChange: (value: string) => void;
}) {
  if (!models.length) {
    return (
      <input value={value} onChange={(e) => onChange(e.target.value)} aria-label="Modell" className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 outline-none" />
    );
  }
  const options = models.includes(value) ? models : [value, ...models];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Modell" className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 outline-none">
      {options.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
}
