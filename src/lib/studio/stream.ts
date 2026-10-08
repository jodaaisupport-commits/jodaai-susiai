import { getBearerToken } from "@/lib/auth/client";

export async function consumeStudioStream(
  body: unknown,
  signal: AbortSignal,
  onDelta: (text: string) => void,
) {
  const token = getBearerToken();
  const res = await fetch("/api/studio/stream", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || type.includes("application/json")) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false as const, text: "", error: data?.error || `Status ${res.status}` };
  }
  const reader = res.body?.getReader();
  if (!reader) return { ok: false as const, text: "", error: "Die KI hat keine Antwort geliefert." };
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    if (text) onDelta(text);
  }
  if (!text.trim()) return { ok: false as const, text: "", error: "Die KI hat keine Antwort geliefert." };
  return { ok: true as const, text, error: "" };
}
