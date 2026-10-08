import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plug, Sparkles } from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { mergeAccountProjects, projectForAccount } from "@/lib/studio/account-sync";
import { listStudioProjects, saveStudioProject } from "@/lib/studio/projects.functions";
import { freshState, loadState, makeProject, providerLabel, saveState } from "@/lib/studio/storage";
import type { Project } from "@/lib/studio/types";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [projects, setProjects] = useState<Project[]>(() =>
    typeof window === "undefined" ? [] : (loadState()?.projects ?? []),
  );
  const [accountOn, setAccountOn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    listStudioProjects()
      .then(async (remote) => {
        if (cancel) return;
        const local = loadState();
        const merged = mergeAccountProjects(local?.projects ?? [], remote.projects);
        const base = local ?? freshState();
        const nextProjects = merged.projects.length ? merged.projects : base.projects;
        const activeId = nextProjects.some((item) => item.id === base.activeId) ? base.activeId : nextProjects[0].id;
        saveState({ ...base, projects: nextProjects, activeId });
        setProjects(nextProjects);
        setAccountOn(true);
        const pending = merged.projects.length ? merged.push : [];
        await Promise.all(pending.map((project) => saveStudioProject({ data: projectForAccount(project) }))).catch(() => undefined);
      })
      .catch(() => {
        if (!cancel) setAccountOn(false);
      });
    return () => {
      cancel = true;
    };
  }, [user]);

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg">
        <div className="h-40 w-full max-w-3xl animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }
  if (!user) return <Navigate to="/login" />;

  const saved = typeof window === "undefined" ? null : loadState();
  const messages = projects.reduce((sum, project) => sum + project.messages.length, 0);
  const images = projects.reduce((sum, project) => sum + project.images.length, 0);
  const links = saved?.links;
  const provider = links ? providerLabel(links.provider) : "SusiAI";

  function openProject(id: string) {
    const state = loadState() ?? freshState();
    saveState({ ...state, activeId: id, projects: state.projects.some((item) => item.id === id) ? state.projects : projects });
    navigate({ to: "/" });
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="flex h-16 items-center justify-between gap-3 border-b border-line px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-fg">
            <Sparkles size={18} />
          </span>
          <div>
            <div className="font-semibold">SusiAI</div>
            <div className="text-xs tracking-widest text-faint">DASHBOARD</div>
          </div>
        </div>
        <UserButton />
      </header>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-8">
        <div>
          <h1 className="text-3xl font-semibold">Hallo, {user.displayName ?? "Studio"}</h1>
          <p className="mt-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted">
            {accountOn === false
              ? "Das Konto ist gerade nicht erreichbar. Es gilt die Fassung in diesem Browser. Schlüssel bleiben hier."
              : `Projekte liegen an diesem Konto${user.primaryEmail ? ` (${user.primaryEmail})` : ""} und in diesem Browser. Schlüssel bleiben nur hier.`}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Projekte" value={String(projects.length)} />
          <Stat label="Nachrichten" value={String(messages)} />
          <Stat label="Bilder" value={String(images)} />
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Projekte</h2>
              <Link to="/" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold leading-10 text-primary-fg">
                Workspace öffnen
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {projects.length === 0 && (
                <div className="rounded-xl border border-dashed border-line px-3 py-4">
                  <p className="text-sm text-muted">Noch kein Projekt an diesem Konto.</p>
                  <button
                    className="mt-3 h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg"
                    onClick={() => {
                      const existing = loadState();
                      const created = makeProject("Neues Projekt");
                      const base = existing ?? freshState();
                      const next = {
                        ...base,
                        activeId: created.id,
                        projects: [created, ...(existing?.projects ?? [])].slice(0, 20),
                      };
                      saveState(next);
                      void saveStudioProject({ data: projectForAccount(created) }).catch(() => undefined);
                      navigate({ to: "/" });
                    }}
                  >
                    Projekt anlegen
                  </button>
                </div>
              )}
              {projects.slice(0, 6).map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => openProject(project.id)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg px-3 py-3 text-left hover:border-primary"
                >
                  <span className="truncate font-medium">{project.name}</span>
                  <span className="shrink-0 text-xs text-faint">
                    {new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(project.updatedAt)}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-2">
              <Plug size={16} className="text-primary" />
              <h2 className="font-semibold">Aktive Verbindung</h2>
            </div>
            <p className="mt-3 text-2xl font-semibold">{provider}</p>
            <p className="mt-1 text-sm text-muted">
              {links?.mcp.length ? `${links.mcp.length} MCP-Server` : "Kein MCP-Server"} · Schlüssel bleiben lokal.
            </p>
            <Link to="/" className="mt-4 inline-flex h-10 items-center text-sm text-primary underline">
              Im Workspace ändern
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="text-xs tracking-widest text-faint">{label.toUpperCase()}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </article>
  );
}