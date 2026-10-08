import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Bot,
  Bug,
  Check,
  Code2,
  Copy,
  Download,
  Film,
  FolderOpen,
  HelpCircle,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Mic,
  Paperclip,
  Pencil,
  Play,
  Plug,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Square,
  TestTube2,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { parseCodeReply, generateStoryboard, generateStudioImage, studioHealth } from "@/lib/studio/ai.functions";
import { dahlBalance } from "@/lib/studio/links.functions";
import { consumeStudioStream } from "@/lib/studio/stream";
import { LinksPane } from "@/components/studio/links-pane";
import { freshState, hydrateImages, makeProject, providerLabel, routeFromLinks, saveState, loadState } from "@/lib/studio/storage";
import { mergeAccountProjects, projectForAccount } from "@/lib/studio/account-sync";
import { deleteStudioProject, listStudioProjects, saveStudioProject } from "@/lib/studio/projects.functions";
import type { ChatRoute, CodeAction, Mode, Persisted, Project, Storyboard, StudioFile } from "@/lib/studio/types";

const MODES: { id: Mode; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "code", label: "Code", icon: Code2 },
  { id: "image", label: "Image Studio", icon: ImageIcon },
  { id: "video", label: "Video Studio", icon: Film },
  { id: "agent", label: "Agent", icon: Bot },
];

const TITLES: Record<Mode, string> = {
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
  links: "Anbindungen",
};

const TONES = ["Präzise", "Kreativ", "Einfach erklärt", "Technisch"];
const LANGUAGES = ["Deutsch", "English"];

type SpeechResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRec = {
  lang: string;
  onresult: ((ev: SpeechResult) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

export function StudioApp() {
  const [state, setState] = useState<Persisted>(() => freshState());
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [input, setInput] = useState("");
  const inputRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dahlHint, setDahlHint] = useState("");
  const [ai, setAi] = useState<boolean | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [aspect, setAspect] = useState("1:1");
  const [videoAspect, setVideoAspect] = useState("16:9");
  const [duration, setDuration] = useState<6 | 10 | 15>(10);
  const [note, setNote] = useState("Bereit — frag SusiAI nach einer Änderung.");
  const [previewOn, setPreviewOn] = useState(false);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [rename, setRename] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [accountOn, setAccountOn] = useState<boolean | null>(null);
  const pushedRef = useRef<Map<string, number>>(new Map());
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLInputElement>(null);

  const project = state.projects.find((p) => p.id === state.activeId) ?? state.projects[0];
  const activeFile = project.files.find((f) => f.path === project.activePath) ?? project.files[0];
  const route: ChatRoute = routeFromLinks(state.links);
  const linkOn = route.provider === "grok" ? Boolean(ai) : route.key.trim().length > 8;
  const linkLabel = providerLabel(route.provider);

  useEffect(() => {
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
        next = { ...next, projects, activeId };
        setState(next);
        setAccountOn(true);
        const pending = merged.projects.length ? merged.push : projects;
        await Promise.all(pending.map((project) => saveStudioProject({ data: projectForAccount(project) }))).catch(() => undefined);
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
    studioHealth()
      .then((r) => setAi(r.ai))
      .catch(() => setAi(false));
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || accountOn !== true) return;
    const timer = window.setTimeout(() => {
      for (const project of state.projects) {
        if (pushedRef.current.get(project.id) === project.updatedAt) continue;
        const stamp = project.updatedAt;
        saveStudioProject({ data: projectForAccount(project) })
          .then((result) => {
            if (result.stored) pushedRef.current.set(project.id, stamp);
          })
          .catch(() => undefined);
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [state.projects, hydrated, accountOn]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => saveState(state), 400);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const flush = () => saveState(state);
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [state, hydrated]);

  useEffect(() => {
    const node = endRef.current;
    const scroller = node?.parentElement;
    if (!node || !scroller) return;
    const near = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 160;
    if (near) node.scrollIntoView({ block: "end" });
  }, [project.messages, busy, mode]);

  useEffect(() => {
    if (!error.toLowerCase().includes("dahl") || !state.links.dahlKey.trim()) {
      setDahlHint("");
      return;
    }
    let cancel = false;
    dahlBalance({ data: { key: state.links.dahlKey } })
      .then((result) => {
        if (cancel) return;
        setDahlHint(
          result.tokens === 0
            ? "Kontostand: 0 Tokens."
            : result.tokens != null
              ? `Kontostand: ${new Intl.NumberFormat("de-DE").format(result.tokens)} Tokens.`
              : result.error,
        );
      })
      .catch(() => {
        if (!cancel) setDahlHint("");
      });
    return () => {
      cancel = true;
    };
  }, [error, state.links.dahlKey]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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

  useEffect(() => {
    if (palette) paletteRef.current?.focus();
  }, [palette]);

  function patch(update: (project: Project) => Project) {
    setState((current) => ({
      ...current,
      projects: current.projects.map((item) =>
        item.id === current.activeId ? { ...update(item), updatedAt: Date.now() } : item,
      ),
    }));
  }

  function selectMode(next: Mode) {
    setMode(next);
    setNavOpen(false);
    setError("");
    setPalette(false);
  }

  function selectProject(id: string) {
    setState((current) => ({ ...current, activeId: id }));
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
      projects: [created, ...current.projects].slice(0, 20),
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
    const user = { id: crypto.randomUUID(), role: "user" as const, content, createdAt: Date.now() };
    const replyId = crypto.randomUUID();
    const history = [...project.messages, user];
    patch((item) => ({
      ...item,
      messages: [...history, { id: replyId, role: "assistant", content: "", createdAt: Date.now() }],
    }));
    setInput("");
    inputRef.current = "";
    setBusy(true);
    setError("");
    const controller = new AbortController();
    abortRef.current = controller;
    const apiMode = mode === "agent" ? "agent" : mode === "code" ? "code" : "chat";
    try {
      const result = await consumeStudioStream(
        { kind: "chat", mode: apiMode, messages: history, preferences: state.prefs, route },
        controller.signal,
        (next) => {
          patch((item) => ({
            ...item,
            messages: item.messages.map((message) => (message.id === replyId ? { ...message, content: next } : message)),
          }));
        },
      );
      if (!result.ok && !controller.signal.aborted) {
        patch((item) => ({
          ...item,
          messages: item.messages.map((message) =>
            message.id === replyId ? { ...message, content: result.error } : message,
          ),
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

  async function runCode(action: CodeAction, instruction = "") {
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
      const result = await consumeStudioStream(
        {
          kind: "code",
          action,
          path: activeFile.path,
          content: activeFile.content,
          instruction: instruction.trim(),
          preferences: state.prefs,
          route,
        },
        controller.signal,
        (next) => {
          streamed = next;
          setNote(next);
        },
      );
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
            const base = item.activePath.replace(/^.*\//, "").replace(/\.[^.]+$/, "");
            const testPath = `tests/${base}.test.ts`;
            files = upsertFile(item.files, testPath, parsed.code);
            activePath = testPath;
          } else {
            files = upsertFile(item.files, item.activePath, parsed.code);
          }
        }
        const label = action === "custom" ? instruction.trim() : `${action} · ${item.activePath}`;
        return {
          ...item,
          files,
          activePath,
          messages: [
            ...item.messages,
            { id: crypto.randomUUID(), role: "user", content: label, createdAt: Date.now() },
            { id: crypto.randomUUID(), role: "assistant", content: parsed.explanation, createdAt: Date.now() },
          ],
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
      const result = await generateStudioImage({ data: { prompt, style, aspect } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      patch((item) => ({
        ...item,
        images: [
          { id: crypto.randomUUID(), prompt, url: result.url, createdAt: Date.now() },
          ...item.images,
        ].slice(0, 8),
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
      const result = await generateStoryboard({
        data: { prompt, aspect: videoAspect, duration, route },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      patch((item) => ({ ...item, storyboard: result.storyboard }));
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

  function onAttach(file: File | undefined) {
    if (!file) return;
    if (file.size > 100_000) {
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
        activePath: path,
      }));
      selectMode("code");
    };
    reader.readAsText(file);
  }

  function startMic() {
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Spracheingabe wird in diesem Browser nicht unterstützt.");
      return;
    }
    const rec = new Ctor();
    rec.lang = state.prefs.language === "English" ? "en-US" : "de-DE";
    rec.onresult = (ev) => {
      const transcript = ev.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onerror = () => setError("Spracheingabe abgebrochen.");
    rec.start();
  }

  function downloadText(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadImage(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
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
      files: upsertFile(item.files, name, item.files.some((f) => f.path === name) ? item.files.find((f) => f.path === name)!.content : ""),
      activePath: name,
    }));
    setDraftName(null);
  }

  const composerOn = mode === "chat" || mode === "code" || mode === "image" || mode === "video" || mode === "agent";
  const placeholder =
    mode === "image"
      ? "Beschreibe dein Bild…"
      : mode === "video"
        ? "Beschreibe dein Video…"
        : mode === "code"
          ? "Sag SusiAI, was sich im Code ändern soll…"
          : mode === "agent"
            ? "Beschreibe das Ziel für den Agenten…"
            : "Frag SusiAI, was du erstellen möchtest…";

  const commands = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    const items: { id: string; label: string; hint: string; run: () => void }[] = [
      ...MODES.map((item) => ({
        id: item.id,
        label: item.label,
        hint: "Modus",
        run: () => selectMode(item.id),
      })),
      { id: "projects", label: "Projekte", hint: "Übersicht", run: () => selectMode("projects") },
      { id: "memory", label: "Memory", hint: "Präferenzen", run: () => selectMode("memory") },
      { id: "history", label: "Verlauf", hint: "Nachrichten", run: () => selectMode("history") },
      { id: "settings", label: "Einstellungen", hint: "Studio", run: () => selectMode("settings") },
      { id: "help", label: "Hilfe", hint: "Kurz", run: () => selectMode("help") },
      { id: "links", label: "Anbindungen", hint: "MCP und Provider", run: () => selectMode("links") },
      { id: "new", label: "Neues Projekt", hint: "Anlegen", run: createProject },
      ...state.projects.map((item) => ({
        id: item.id,
        label: item.name,
        hint: "Projekt öffnen",
        run: () => selectProject(item.id),
      })),
    ];
    return q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
  }, [paletteQuery, state.projects]);

  return (
    <main className="flex h-dvh overflow-hidden bg-bg text-fg">
      {navOpen && (
        <button
          className="fixed inset-0 z-30 bg-scrim lg:hidden"
          aria-label="Menü schließen"
          onClick={() => setNavOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-4 border-r border-line bg-surface p-4 transition-transform lg:static lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-1">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-fg">
            <Sparkles size={18} />
          </span>
          <div className="leading-none">
            <div className="text-lg font-semibold tracking-tight">SusiAI</div>
            <div className="mt-1 text-xs font-medium tracking-widest text-faint">STUDIO</div>
          </div>
        </div>
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-raised font-semibold hover:border-primary"
          onClick={createProject}
        >
          <Plus size={16} /> Neues Projekt
        </button>
        <nav className="flex flex-col gap-1">
          {MODES.map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                className={`flex h-11 items-center gap-3 rounded-lg border-l-2 px-3 text-left ${
                  active
                    ? "border-primary bg-raised text-fg"
                    : "border-transparent text-muted hover:bg-raised hover:text-fg"
                }`}
                onClick={() => selectMode(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === "agent" && (
                  <span className="ml-auto rounded bg-raised px-1.5 py-0.5 text-xs text-faint">Beta</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mb-2 px-2 text-xs tracking-widest text-faint">PROJEKTE</div>
          <div className="flex flex-col gap-1">
            {state.projects.map((item) => (
              <button
                key={item.id}
                className={`truncate rounded-lg px-3 py-2 text-left text-sm ${
                  item.id === project.id ? "bg-raised text-fg" : "text-muted hover:bg-raised hover:text-fg"
                }`}
                onClick={() => selectProject(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            to="/dashboard"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-raised hover:text-fg"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <SideLink icon={FolderOpen} label="Alle Projekte" active={mode === "projects"} onClick={() => selectMode("projects")} />
          <SideLink icon={Sparkles} label="Memory" active={mode === "memory"} onClick={() => selectMode("memory")} />
          <SideLink icon={History} label="Verlauf" active={mode === "history"} onClick={() => selectMode("history")} />
          <SideLink icon={Plug} label="Anbindungen" active={mode === "links"} onClick={() => selectMode("links")} />
          <SideLink icon={HelpCircle} label="Hilfe" active={mode === "help"} onClick={() => selectMode("help")} />
          <SideLink icon={Settings} label="Einstellungen" active={mode === "settings"} onClick={() => selectMode("settings")} />
        </div>
        <div className="min-w-0 overflow-hidden border-t border-line pt-3">
          <UserButton />
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/80 px-3 backdrop-blur sm:px-5">
          <button className="grid size-11 place-items-center rounded-lg border border-line lg:hidden" onClick={() => setNavOpen(true)} aria-label="Menü">
            <Menu size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-xs tracking-widest text-faint">MULTIMODAL WORKSPACE</div>
            <h1 className="truncate text-lg font-semibold">{TITLES[mode]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex h-11 max-w-[40vw] items-center gap-2 rounded-lg border border-line bg-bg px-2 text-sm text-muted sm:max-w-none sm:px-3"
              onClick={() => selectMode("links")}
            >
              <i className={`size-2 shrink-0 rounded-full ${linkOn ? "bg-accent" : "bg-faint"}`} />
              <span className="truncate">
                {ai === null && route.provider === "grok" ? "Prüfe KI…" : linkOn ? linkLabel : `${linkLabel} offline`}
              </span>
            </button>
            <button
              className="flex h-11 items-center gap-2 rounded-lg border border-line bg-bg px-3 text-muted hover:text-fg"
              onClick={() => {
                setPalette(true);
                setPaletteQuery("");
              }}
              aria-label="Befehlspalette"
            >
              <Search size={18} />
              <kbd className="hidden text-xs text-faint sm:inline">Strg+K</kbd>
            </button>
            <Link
              to="/dashboard"
              className="grid size-11 place-items-center rounded-lg border border-line bg-bg text-muted hover:text-fg"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={18} />
            </Link>
          </div>
        </header>

        {error && (
          <div className="flex items-start justify-between gap-3 border-b border-line bg-raised px-4 py-2 text-sm text-danger">
            <div>
              <div>{error}</div>
              {dahlHint && (
                <div className="mt-1 text-muted">
                  {dahlHint}{" "}
                  <a className="text-primary underline" href="https://inference.dahl.global/account" target="_blank" rel="noreferrer">
                    Neuen Schlüssel anlegen
                  </a>
                </div>
              )}
            </div>
            <button aria-label="Hinweis schließen" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {mode === "chat" && (
            <ChatPane
              messages={project.messages}
              busy={busy}
              copiedId={copiedId}
              onCopy={(id, text) => {
                navigator.clipboard?.writeText(text);
                setCopiedId(id);
                setTimeout(() => setCopiedId(""), 1200);
              }}
              onPrompt={(text) => runChat(text)}
              onMode={selectMode}
              endRef={endRef}
            />
          )}
          {mode === "agent" && (
            <AgentPane
              messages={project.messages}
              busy={busy}
              onPrompt={(text) => {
                setMode("agent");
                runChat(text);
              }}
              endRef={endRef}
            />
          )}
          {mode === "code" && (
            <CodePane
              files={project.files}
              active={activeFile}
              note={note}
              busy={busy}
              previewOn={previewOn}
              draftName={draftName}
              onDraft={setDraftName}
              onAdd={addNamedFile}
              onSelect={(path) => patch((item) => ({ ...item, activePath: path }))}
              onChange={(content) =>
                patch((item) => ({
                  ...item,
                  files: item.files.map((file) => (file.path === item.activePath ? { ...file, content } : file)),
                }))
              }
              onRemove={(path) =>
                patch((item) => {
                  const files = item.files.filter((file) => file.path !== path);
                  const next = files.length ? files : item.files;
                  return { ...item, files: next, activePath: next[0].path };
                })
              }
              onTool={(action) => runCode(action)}
              onPreview={() => setPreviewOn((v) => !v)}
              onExport={() => downloadText(activeFile.path.split("/").pop() || "datei.txt", activeFile.content)}
            />
          )}
          {mode === "image" && (
            <ImagePane
              images={project.images}
              style={style}
              aspect={aspect}
              busy={busy}
              canGenerate={Boolean(input.trim())}
              onStyle={setStyle}
              onAspect={setAspect}
              onGenerate={runImage}
              onDownload={downloadImage}
            />
          )}
          {mode === "video" && (
            <VideoPane
              board={project.storyboard}
              aspect={videoAspect}
              duration={duration}
              busy={busy}
              canGenerate={Boolean(input.trim())}
              onAspect={setVideoAspect}
              onDuration={setDuration}
              onGenerate={runVideo}
              onExport={() => project.storyboard && downloadText("storyboard.md", storyboardMarkdown(project.storyboard))}
            />
          )}
          {mode === "projects" && (
            <ProjectsPane
              projects={state.projects}
              activeId={project.id}
              confirmId={confirmId}
              rename={rename}
              hydrated={hydrated}
              onRenameStart={(item) => {
                setRename(item.name);
                setConfirmId(`rename:${item.id}`);
              }}
              onRename={setRename}
              onRenameSave={(id) => {
                const name = rename.trim();
                if (!name) return;
                setState((current) => ({
                  ...current,
                  projects: current.projects.map((item) => (item.id === id ? { ...item, name, updatedAt: Date.now() } : item)),
                }));
                setConfirmId("");
              }}
              onOpen={selectProject}
              onAskDelete={setConfirmId}
              onDelete={(id) => {
                void deleteStudioProject({ data: { id } }).catch(() => undefined);
                pushedRef.current.delete(id);
                setState((current) => {
                  const projects = current.projects.filter((item) => item.id !== id);
                  const next = projects.length ? projects : [makeProject("SusiAI Lab")];
                  const activeId = next.some((item) => item.id === current.activeId) ? current.activeId : next[0].id;
                  return { ...current, projects: next, activeId };
                });
                setConfirmId("");
              }}
            />
          )}
          {mode === "memory" && (
            <PrefsPane
              prefs={state.prefs}
              onChange={(prefs) => setState((current) => ({ ...current, prefs }))}
            />
          )}
          {mode === "history" && (
            <HistoryPane
              messages={project.messages}
              onClear={() => patch((item) => ({ ...item, messages: [] }))}
            />
          )}
          {mode === "settings" && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <PrefsPane
                prefs={state.prefs}
                onChange={(prefs) => setState((current) => ({ ...current, prefs }))}
              />
              <div className="mx-auto w-full max-w-xl px-4 pb-8">
                <div className="rounded-2xl border border-line bg-surface p-4">
                  <h2 className="font-semibold">Lokale Daten</h2>
                  <p className="mt-1 text-sm text-muted">
                    Projekte liegen am Konto. Schlüssel und Bilder bleiben in diesem Browser.
                  </p>
                  {confirmWipe ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        className="h-11 rounded-xl bg-danger px-4 font-semibold text-bg"
                        onClick={() => {
                          const ids = state.projects.map((item) => item.id);
                          const next = freshState();
                          setState(next);
                          saveState(next);
                          pushedRef.current = new Map();
                          void Promise.all(ids.map((id) => deleteStudioProject({ data: { id } }))).catch(() => undefined);
                          setConfirmWipe(false);
                          selectMode("chat");
                        }}
                      >
                        Wirklich löschen
                      </button>
                      <button className="h-11 rounded-xl border border-line px-4" onClick={() => setConfirmWipe(false)}>
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button className="mt-3 h-11 rounded-xl border border-line px-4 text-danger" onClick={() => setConfirmWipe(true)}>
                      Projekte vom Konto und aus diesem Browser löschen
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {mode === "help" && <HelpPane />}
          {mode === "links" && (
            <LinksPane
              links={state.links}
              prefs={state.prefs}
              grokReady={ai}
              onChange={(links) => setState((current) => ({ ...current, links }))}
            />
          )}
        </div>

        {composerOn && (
          <div className="shrink-0 border-t border-line bg-surface px-3 py-3 sm:px-5">
            <div className="flex items-end gap-2 rounded-2xl border border-line bg-bg p-2">
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.tsx,.ts,.jsx,.js,.css,.json,.html"
                className="hidden"
                onChange={(e) => {
                  onAttach(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button className="grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-raised hover:text-fg" aria-label="Datei anhängen" onClick={() => fileRef.current?.click()}>
                <Paperclip size={18} />
              </button>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  inputRef.current = e.target.value;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder={placeholder}
                className="max-h-36 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base outline-none placeholder:text-faint"
              />
              <button className="grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-raised hover:text-fg" aria-label="Spracheingabe" onClick={startMic}>
                <Mic size={18} />
              </button>
              <button
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg disabled:opacity-40"
                onClick={busy ? stopWork : submit}
                disabled={!busy && !input.trim()}
                aria-label={busy ? "Abbrechen" : "Senden"}
              >
                {busy ? <Square size={16} fill="currentColor" /> : <Send size={18} />}
              </button>
            </div>
            <div className="mt-2 flex justify-between px-1 text-xs text-faint">
              <span>Enter senden · Shift+Enter neue Zeile{busy ? " · Stop beendet die Antwort" : ""}</span>
              <span className="truncate">
                {project.name} · {linkLabel}
                {route.model ? ` · ${route.model}` : ""}
                {accountOn === true ? " · Am Konto" : accountOn === false ? " · Nur dieser Browser" : ""}
              </span>
            </div>
          </div>
        )}
      </section>

      {palette && (
        <div className="fixed inset-0 z-50 grid place-items-start bg-scrim px-4 pt-[12vh]" onClick={() => setPalette(false)}>
          <div
            role="dialog"
            aria-label="Befehlspalette"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search size={16} className="text-faint" />
              <input
                ref={paletteRef}
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Modus oder Projekt…"
                className="h-12 flex-1 bg-transparent outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {commands.length === 0 && <div className="px-3 py-6 text-sm text-muted">Nichts gefunden.</div>}
              {commands.slice(0, 12).map((item) => (
                <button
                  key={item.id}
                  className="flex h-11 w-full items-center justify-between rounded-lg px-3 text-left hover:bg-raised"
                  onClick={item.run}
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-faint">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <span className="sr-only" role="status">
        {busy ? "SusiAI arbeitet" : ""}
      </span>
    </main>
  );
}

function SideLink({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof FolderOpen;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm ${active ? "bg-raised text-fg" : "text-muted hover:bg-raised hover:text-fg"}`}
      onClick={onClick}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function ChatPane({
  messages,
  busy,
  copiedId,
  onCopy,
  onPrompt,
  onMode,
  endRef,
}: {
  messages: Project["messages"];
  busy: boolean;
  copiedId: string;
  onCopy: (id: string, text: string) => void;
  onPrompt: (text: string) => void;
  onMode: (mode: Mode) => void;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
      {messages.length === 0 && (
        <div className="mx-auto flex max-w-3xl flex-col items-center pt-8 text-center sm:pt-16">
          <span className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-fg">
            <Sparkles size={28} />
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">Was möchtest du erschaffen?</h2>
          <p className="mt-2 max-w-md text-muted">Chat, Code, Bilder und Video-Storyboards in einem Workspace.</p>
          <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
            <Quick
              icon={Code2}
              title="Seite entwerfen"
              detail="Struktur und Text"
              onClick={() => onPrompt("Entwirf eine klare Landingpage für ein KI-Studio: Abschnitte, Überschriften und den ersten React-Komponentenentwurf.")}
            />
            <Quick icon={ImageIcon} title="Bild generieren" detail="Text zu Bild" onClick={() => onMode("image")} />
            <Quick icon={Film} title="Video planen" detail="Prompt zu Storyboard" onClick={() => onMode("video")} />
            <Quick
              icon={Bot}
              title="Agent verstehen"
              detail="Werkzeuge und Ablauf"
              onClick={() => onPrompt("Erkläre in klaren Schritten, wie ein KI-Agent ein Ziel in Werkzeugaufrufe zerlegt.")}
            />
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {messages.map((message) => (
          <article key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${message.role === "user" ? "bg-raised" : "bg-primary text-primary-fg"}`}>
              {message.role === "user" ? "Du" : "✦"}
            </div>
            <div className={`min-w-0 max-w-[85%] rounded-2xl border border-line px-4 py-3 ${message.role === "user" ? "bg-raised" : "bg-surface"}`}>
              <div className="mb-1 text-xs text-faint">{message.role === "user" ? "Du" : "SusiAI"}</div>
              <RichText text={message.content} />
              {message.role === "assistant" && (
                <button className="mt-2 text-muted hover:text-fg" aria-label="Kopieren" onClick={() => onCopy(message.id, message.content)}>
                  {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </article>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="susi-dot size-1.5 rounded-full bg-primary" />
            <span className="susi-dot size-1.5 rounded-full bg-primary" />
            <span className="susi-dot size-1.5 rounded-full bg-primary" />
            SusiAI arbeitet…
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function Quick({
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  icon: typeof Code2;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left hover:border-primary" onClick={onClick}>
      <Icon size={18} className="text-primary" />
      <span>
        <b className="block font-semibold">{title}</b>
        <small className="text-muted">{detail}</small>
      </span>
    </button>
  );
}

function AgentPane({
  messages,
  busy,
  onPrompt,
  endRef,
}: {
  messages: Project["messages"];
  busy: boolean;
  onPrompt: (text: string) => void;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  const goals = [
    "Plane einen kleinen Landingpage-Launch: Seiten, Texte, offene Punkte.",
    "Zerlege die Aufgabe, eine Bildergalerie zu bauen, in konkrete Schritte.",
  ];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="text-xs tracking-widest text-faint">AGENT · BETA</div>
          <h2 className="mt-1 text-2xl font-semibold">Ein Ziel, ein Plan.</h2>
          <p className="mt-2 text-muted">
            SusiAI liefert einen knappen Ablauf und den ersten brauchbaren Entwurf. Es wird nichts automatisch im Hintergrund ausgeführt.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {goals.map((goal) => (
              <button key={goal} className="rounded-xl border border-line px-3 py-3 text-left text-sm hover:border-primary" onClick={() => onPrompt(goal)}>
                {goal}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {messages.slice(-6).map((message) => (
            <article key={message.id} className="rounded-2xl border border-line bg-bg px-4 py-3">
              <div className="mb-1 text-xs text-faint">{message.role === "user" ? "Ziel" : "Plan"}</div>
              <RichText text={message.content} />
            </article>
          ))}
          {busy && <div className="text-sm text-muted">Agent plant…</div>}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}

function CodePane({
  files,
  active,
  note,
  busy,
  previewOn,
  draftName,
  onDraft,
  onAdd,
  onSelect,
  onChange,
  onRemove,
  onTool,
  onPreview,
  onExport,
}: {
  files: StudioFile[];
  active: StudioFile;
  note: string;
  busy: boolean;
  previewOn: boolean;
  draftName: string | null;
  onDraft: (value: string | null) => void;
  onAdd: () => void;
  onSelect: (path: string) => void;
  onChange: (content: string) => void;
  onRemove: (path: string) => void;
  onTool: (action: CodeAction) => void;
  onPreview: () => void;
  onExport: () => void;
}) {
  const html = previewHtml(active);
  return (
    <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[13rem_minmax(0,1fr)_14rem] lg:overflow-hidden">
      <div className="border-b border-line p-3 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs tracking-widest text-faint">DATEIEN</span>
          <button aria-label="Datei anlegen" className="grid size-8 place-items-center rounded-lg hover:bg-raised" onClick={() => onDraft(draftName === null ? "src/neu.ts" : null)}>
            <Plus size={16} />
          </button>
        </div>
        {draftName !== null && (
          <div className="mb-2 flex gap-1">
            <input
              value={draftName}
              onChange={(e) => onDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAdd()}
              className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-bg px-2 text-sm outline-none"
            />
            <button className="h-9 rounded-lg bg-primary px-2 text-sm text-primary-fg" onClick={onAdd}>
              OK
            </button>
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto lg:flex-col">
          {files.map((file) => (
            <div key={file.path} className="flex shrink-0 items-center lg:w-full">
              <button
                className={`h-9 truncate rounded-lg px-2 text-left text-sm lg:flex-1 ${file.path === active.path ? "bg-raised text-fg" : "text-muted hover:bg-raised"}`}
                onClick={() => onSelect(file.path)}
              >
                {file.path}
              </button>
              {files.length > 1 && (
                <button aria-label={`${file.path} entfernen`} className="grid size-8 place-items-center text-faint hover:text-danger" onClick={() => onRemove(file.path)}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex min-h-[50vh] flex-col lg:min-h-0">
        <div className="flex h-11 items-center justify-between border-b border-line px-3 text-sm">
          <span className="truncate font-mono text-muted">{active.path}</span>
          <button className="flex h-8 items-center gap-1 rounded-lg px-2 text-muted hover:bg-raised hover:text-fg" onClick={() => onTool("fix")} disabled={busy}>
            <WandSparkles size={14} /> Fix
          </button>
        </div>
        <textarea
          value={active.content}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="min-h-64 flex-1 resize-none bg-bg p-4 font-mono text-sm leading-6 outline-none"
        />
        <div className="border-t border-line bg-surface px-3 py-2 text-sm text-muted">
          <span className="mr-2 inline-block size-2 rounded-full bg-accent align-middle" />
          {busy ? "SusiAI liest den Code…" : note}
        </div>
        {previewOn && (
          <iframe title="Vorschau" sandbox="" srcDoc={html} className="h-56 w-full border-t border-line bg-bg" />
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line p-3 lg:flex-col lg:border-t-0 lg:border-l">
        <div className="w-full text-xs tracking-widest text-faint">WERKZEUGE</div>
        <Tool icon={Bot} label="Erklären" onClick={() => onTool("explain")} disabled={busy} />
        <Tool icon={WandSparkles} label="Optimieren" onClick={() => onTool("optimize")} disabled={busy} />
        <Tool icon={TestTube2} label="Tests" onClick={() => onTool("tests")} disabled={busy} />
        <Tool icon={Bug} label="Debug" onClick={() => onTool("debug")} disabled={busy} />
        <Tool icon={Play} label="Vorschau" onClick={onPreview} disabled={false} />
        <Tool icon={Download} label="Export" onClick={onExport} disabled={false} />
      </div>
    </div>
  );
}

function Tool({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Bot;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button className="flex h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm hover:border-primary disabled:opacity-40 lg:w-full" onClick={onClick} disabled={disabled}>
      <Icon size={16} /> {label}
    </button>
  );
}

function ImagePane({
  images,
  style,
  aspect,
  busy,
  canGenerate,
  onStyle,
  onAspect,
  onGenerate,
  onDownload,
}: {
  images: Project["images"];
  style: string;
  aspect: string;
  busy: boolean;
  canGenerate: boolean;
  onStyle: (value: string) => void;
  onAspect: (value: string) => void;
  onGenerate: () => void;
  onDownload: (url: string) => void;
}) {
  const current = images[0];
  return (
    <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[20rem_minmax(0,1fr)] lg:overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-4 lg:border-b-0 lg:border-r">
        <div className="text-xs tracking-widest text-faint">BILD</div>
        <Field label="Stil">
          <Chips
            value={style}
            options={[
              ["cinematic", "Cinematic"],
              ["3d", "3D"],
              ["photo", "Foto"],
              ["cyber", "Cyber"],
            ]}
            onChange={onStyle}
          />
        </Field>
        <Field label="Format">
          <Chips value={aspect} options={[["1:1", "1:1"], ["16:9", "16:9"], ["9:16", "9:16"]]} onChange={onAspect} />
        </Field>
        <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-fg disabled:opacity-40" disabled={busy || !canGenerate} onClick={onGenerate}>
          <Sparkles size={16} /> {busy ? "Erzeuge…" : "Bild erzeugen"}
        </button>
        <p className="text-sm text-muted">Der Prompt steht unten im Eingabefeld. Jedes Bild ist ein einzelner Aufruf.</p>
      </div>
      <div className="flex min-h-0 flex-col p-4">
        <div className="grid min-h-64 flex-1 place-items-center overflow-hidden rounded-2xl border border-line bg-bg">
          {current ? (
            <img src={current.url} alt={current.prompt} className="max-h-[55vh] w-full object-contain" />
          ) : (
            <Empty icon={ImageIcon} title="Deine Kreation erscheint hier" text="Beschreibe unten, was SusiAI erzeugen soll." />
          )}
        </div>
        {current && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="truncate text-sm text-muted">{current.prompt}</p>
            <button className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line px-3 text-sm" onClick={() => onDownload(current.url)}>
              <Download size={14} /> Sichern
            </button>
          </div>
        )}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((image) => (
              <img key={image.id} src={image.url} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideoPane({
  board,
  aspect,
  duration,
  busy,
  canGenerate,
  onAspect,
  onDuration,
  onGenerate,
  onExport,
}: {
  board: Storyboard | null;
  aspect: string;
  duration: 6 | 10 | 15;
  busy: boolean;
  canGenerate: boolean;
  onAspect: (value: string) => void;
  onDuration: (value: 6 | 10 | 15) => void;
  onGenerate: () => void;
  onExport: () => void;
}) {
  return (
    <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[20rem_minmax(0,1fr)] lg:overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-4 lg:border-b-0 lg:border-r">
        <div className="text-xs tracking-widest text-faint">VIDEO</div>
        <Field label="Format">
          <Chips value={aspect} options={[["16:9", "16:9"], ["9:16", "9:16"], ["1:1", "1:1"]]} onChange={onAspect} />
        </Field>
        <Field label="Dauer">
          <Chips
            value={String(duration)}
            options={[
              ["6", "6 Sek"],
              ["10", "10 Sek"],
              ["15", "15 Sek"],
            ]}
            onChange={(value) => onDuration(Number(value) as 6 | 10 | 15)}
          />
        </Field>
        <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-fg disabled:opacity-40" disabled={busy || !canGenerate} onClick={onGenerate}>
          <Film size={16} /> {busy ? "Plane…" : "Storyboard erstellen"}
        </button>
        <p className="text-sm text-muted">SusiAI schreibt vier Szenen, Kamera, Voiceover und Musik. Es wird kein Videoclip gerendert.</p>
      </div>
      <div className="min-h-0 overflow-y-auto p-4">
        {!board && <Empty icon={Film} title="Video-Arbeitsfläche" text="Beschreibe unten die Szene. Du bekommst ein Storyboard, das du exportieren kannst." />}
        {board && (
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">{board.title}</h2>
                <p className="text-sm text-muted">
                  {board.aspect} · {board.duration}s
                </p>
              </div>
              <button className="flex h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm" onClick={onExport}>
                <Download size={14} /> Export
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {board.scenes.map((scene, index) => (
                <article key={`${scene.title}-${index}`} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="text-xs text-faint">Szene {index + 1}</div>
                  <h3 className="font-semibold">{scene.title}</h3>
                  {scene.camera && <p className="mt-2 text-sm text-muted">Kamera: {scene.camera}</p>}
                  {scene.action && <p className="mt-1 text-sm">{scene.action}</p>}
                  {scene.visual && <p className="mt-1 text-sm text-muted">{scene.visual}</p>}
                </article>
              ))}
            </div>
            {(board.voiceover || board.music) && (
              <div className="rounded-2xl border border-line bg-bg p-4 text-sm">
                {board.voiceover && <p>Stimme: {board.voiceover}</p>}
                {board.music && <p className="mt-1 text-muted">Musik: {board.music}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectsPane({
  projects,
  activeId,
  confirmId,
  rename,
  hydrated,
  onRenameStart,
  onRename,
  onRenameSave,
  onOpen,
  onAskDelete,
  onDelete,
}: {
  projects: Project[];
  activeId: string;
  confirmId: string;
  rename: string;
  hydrated: boolean;
  onRenameStart: (project: Project) => void;
  onRename: (value: string) => void;
  onRenameSave: (id: string) => void;
  onOpen: (id: string) => void;
  onAskDelete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto grid max-w-3xl gap-3">
        {projects.map((item) => (
          <article key={item.id} className="rounded-2xl border border-line bg-surface p-4">
            {confirmId === `rename:${item.id}` ? (
              <div className="flex gap-2">
                <input value={rename} onChange={(e) => onRename(e.target.value)} className="h-11 flex-1 rounded-xl border border-line bg-bg px-3 outline-none" />
                <button className="h-11 rounded-xl bg-primary px-4 text-primary-fg" onClick={() => onRenameSave(item.id)}>
                  Speichern
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-muted">
                    {item.messages.length} Nachrichten · {item.files.length} Dateien
                    {hydrated ? ` · ${new Date(item.updatedAt).toLocaleString("de-DE")}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconBtn label="Umbenennen" onClick={() => onRenameStart(item)}>
                    <Pencil size={16} />
                  </IconBtn>
                  <IconBtn label="Löschen" onClick={() => (confirmId === item.id ? onDelete(item.id) : onAskDelete(item.id))}>
                    <Trash2 size={16} />
                  </IconBtn>
                </div>
              </div>
            )}
            {confirmId === item.id && <p className="mt-2 text-sm text-danger">Nochmal tippen, um dieses Projekt zu löschen.</p>}
            {item.id !== activeId && confirmId !== `rename:${item.id}` && (
              <button className="mt-3 h-10 rounded-xl border border-line px-3 text-sm" onClick={() => onOpen(item.id)}>
                Öffnen
              </button>
            )}
            {item.id === activeId && <div className="mt-3 text-xs text-accent">Aktiv</div>}
          </article>
        ))}
      </div>
    </div>
  );
}

function PrefsPane({
  prefs,
  onChange,
}: {
  prefs: Persisted["prefs"];
  onChange: (prefs: Persisted["prefs"]) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-xl p-4 sm:p-8">
      <h2 className="text-2xl font-semibold">Was SusiAI über dich wissen soll</h2>
      <p className="mt-1 text-sm text-muted">Bleibt in diesem Browser und wird jeder Antwort mitgegeben.</p>
      <div className="mt-5 flex flex-col gap-4">
        <Field label="Sprache">
          <Chips value={prefs.language} options={LANGUAGES.map((lang) => [lang, lang])} onChange={(language) => onChange({ ...prefs, language })} />
        </Field>
        <Field label="Ton">
          <Chips value={prefs.tone} options={TONES.map((tone) => [tone, tone])} onChange={(tone) => onChange({ ...prefs, tone })} />
        </Field>
        <label className="flex flex-col gap-2 text-sm text-muted">
          Notizen
          <textarea
            value={prefs.notes}
            onChange={(e) => onChange({ ...prefs, notes: e.target.value.slice(0, 500) })}
            rows={5}
            placeholder="Zum Beispiel: kurze Sätze, TypeScript, kein Fachjargon."
            className="rounded-xl border border-line bg-surface p-3 text-fg outline-none"
          />
        </label>
      </div>
    </div>
  );
}

function HistoryPane({ messages, onClear }: { messages: Project["messages"]; onClear: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Verlauf dieses Projekts</h2>
          {messages.length > 0 &&
            (confirm ? (
              <button className="h-10 rounded-xl bg-danger px-3 text-sm font-semibold text-bg" onClick={onClear}>
                Leeren
              </button>
            ) : (
              <button className="h-10 rounded-xl border border-line px-3 text-sm" onClick={() => setConfirm(true)}>
                Chat leeren
              </button>
            ))}
        </div>
        {messages.length === 0 && <p className="text-muted">Noch keine Nachrichten.</p>}
        <div className="flex flex-col gap-2">
          {messages.map((message) => (
            <article key={message.id} className="rounded-xl border border-line bg-surface px-4 py-3">
              <div className="text-xs text-faint">{message.role === "user" ? "Du" : "SusiAI"}</div>
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap break-words text-sm">{message.content}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function HelpPane() {
  const items = [
    ["Chat", "Fragen, Entwürfe und Erklärungen. Enter sendet."],
    ["Code", "Dateien bearbeiten, anhängen und von SusiAI erklären, verbessern oder testen lassen. Vorschau zeigt HTML."],
    ["Image", "Ein Prompt, ein Bild. Stil und Format sitzen links."],
    ["Video", "Du bekommst ein Storyboard mit vier Szenen, keine gerenderte Videodatei."],
    ["Speicher", "Projekte liegen am Konto. Schlüssel, Tokens und Bilder bleiben in diesem Browser."],
    ["Anbindungen", "SusiAI, Dahl und GonkaRouter schalten den Chat um. MCP-Server und Grok-Connectors prüfst du dort."],
  ];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-semibold">Kurzbedienung</h2>
        <div className="mt-4 flex flex-col gap-3">
          {items.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-line bg-surface p-4">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs tracking-widest text-faint">{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

function Chips({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([id, label]) => (
        <button
          key={id}
          aria-pressed={value === id}
          className={`h-10 rounded-xl border px-3 text-sm ${value === id ? "border-primary bg-primary text-primary-fg" : "border-line text-muted hover:text-fg"}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Empty({ icon: Icon, title, text }: { icon: typeof Film; title: string; text: string }) {
  return (
    <div className="flex max-w-sm flex-col items-center px-6 py-16 text-center">
      <Icon size={36} className="text-faint" />
      <b className="mt-3">{title}</b>
      <span className="mt-1 text-sm text-muted">{text}</span>
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button aria-label={label} className="grid size-10 place-items-center rounded-lg text-muted hover:bg-raised hover:text-fg" onClick={onClick}>
      {children}
    </button>
  );
}

function RichText({ text }: { text: string }) {
  const blocks: { code: boolean; body: string }[] = [];
  const re = /```[\w-]*\n?([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) blocks.push({ code: false, body: text.slice(last, match.index) });
    blocks.push({ code: true, body: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) blocks.push({ code: false, body: text.slice(last) });
  if (!blocks.length) blocks.push({ code: false, body: text });
  return (
    <div className="space-y-2 break-words">
      {blocks.map((block, index) =>
        block.code ? (
          <pre key={index} className="overflow-x-auto rounded-lg bg-bg p-3 font-mono text-sm leading-6">
            {block.body.replace(/\n$/, "")}
          </pre>
        ) : (
          block.body.trim() && (
            <p key={index} className="whitespace-pre-wrap leading-6">
              {block.body.trim()}
            </p>
          )
        ),
      )}
    </div>
  );
}

function upsertFile(files: StudioFile[], path: string, content: string): StudioFile[] {
  const next = files.some((file) => file.path === path)
    ? files.map((file) => (file.path === path ? { ...file, content } : file))
    : [...files, { path, content }];
  return next.slice(0, 24);
}

function previewHtml(file: StudioFile) {
  const content = file.content.trim();
  if (/<!doctype html|<html[\s>]/i.test(content)) return file.content;
  const escaped = file.content.replace(/&/g, "&").replace(/</g, "<");
  return `<!doctype html><html><body style="margin:0;background:#080a0f;color:#e9edf5;font:14px/1.5 ui-monospace,monospace;padding:16px;white-space:pre-wrap">${escaped}</body></html>`;
}

function storyboardMarkdown(board: Storyboard) {
  const scenes = board.scenes
    .map(
      (scene, index) =>
        `## Szene ${index + 1} — ${scene.title}\nKamera: ${scene.camera}\nAktion: ${scene.action}\nBild: ${scene.visual}`,
    )
    .join("\n\n");
  return `# ${board.title}\n\n${board.aspect} · ${board.duration}s\n\n${scenes}\n\nStimme: ${board.voiceover}\nMusik: ${board.music}\n`;
}
