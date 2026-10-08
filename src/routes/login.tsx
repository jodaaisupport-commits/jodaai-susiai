import { useState, type FormEvent } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isPending) return <AuthSkeleton />;
  if (user) return <Navigate to="/dashboard" />;

  async function submit(event: FormEvent) {
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
      const result =
        mode === "up"
          ? await authClient.signUp.email({
              email: email.trim(),
              password,
              name: name.trim(),
              callbackURL: "/dashboard",
            })
          : await authClient.signIn.email({
              email: email.trim(),
              password,
              callbackURL: "/dashboard",
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

  return (
    <main className="grid min-h-dvh place-items-center bg-bg p-6 text-fg">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-fg">
            <Sparkles size={18} />
          </span>
          <div>
            <div className="text-lg font-semibold">SusiAI Studio</div>
            <div className="text-xs tracking-widest text-faint">KONTO</div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-bg p-1">
          <button
            type="button"
            className={`h-10 rounded-lg text-sm font-semibold ${mode === "in" ? "bg-raised text-fg" : "text-muted"}`}
            onClick={() => {
              setMode("in");
              setError("");
            }}
          >
            Anmelden
          </button>
          <button
            type="button"
            className={`h-10 rounded-lg text-sm font-semibold ${mode === "up" ? "bg-raised text-fg" : "text-muted"}`}
            onClick={() => {
              setMode("up");
              setError("");
            }}
          >
            Registrieren
          </button>
        </div>
        <form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
          {mode === "up" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoComplete="name"
              aria-label="Name"
              className="h-11 rounded-xl border border-line bg-bg px-3 outline-none"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="E-Mail"
            autoComplete="email"
            aria-label="E-Mail"
            className="h-11 rounded-xl border border-line bg-bg px-3 outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="Passwort"
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            aria-label="Passwort"
            className="h-11 rounded-xl border border-line bg-bg px-3 outline-none"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-xl bg-primary font-semibold text-primary-fg disabled:opacity-50"
          >
            {busy ? "Einen Moment…" : mode === "up" ? "Konto erstellen" : "Anmelden"}
          </button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs tracking-widest text-faint">
          <span className="h-px flex-1 bg-line" />
          ODER
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="flex flex-col gap-2">
          {GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              className="h-11 rounded-xl border border-line bg-bg font-semibold hover:border-primary"
              onClick={() => {
                setError("");
                signIn(provider.providerId, { callbackURL: "/dashboard" }).catch((err: unknown) => {
                  setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
                });
              }}
            >
              Weiter mit {provider.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

function friendly(message: string | undefined, mode: "in" | "up") {
  const text = (message ?? "").toLowerCase();
  if (text.includes("invalid email") || text.includes("invalid password") || text.includes("invalid")) {
    return mode === "in" ? "E-Mail oder Passwort stimmt nicht." : "Diese Angaben konnte das Konto nicht anlegen.";
  }
  if (text.includes("exist") || text.includes("already")) return "Zu dieser E-Mail gibt es schon ein Konto.";
  return message?.slice(0, 180) || "Das hat nicht geklappt.";
}

function AuthSkeleton() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg p-6">
      <div className="h-80 w-full max-w-md animate-pulse rounded-2xl bg-surface" />
    </main>
  );
}
