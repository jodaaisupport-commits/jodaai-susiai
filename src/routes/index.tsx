import { createFileRoute, Navigate } from "@tanstack/react-router";
import { StudioApp } from "@/components/studio/studio-app";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg">
        <div className="h-16 w-64 animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return <StudioApp />;
}
