import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { requireUserId } from "@/lib/auth/verify.server";
import { openStudioStream } from "@/lib/studio/ai.functions";

export const Route = createFileRoute("/api/studio/stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          assertSameSiteRequest();
          const header = request.headers.get("authorization") ?? "";
          const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : undefined;
          await requireUserId(bearer);
        } catch {
          return Response.json({ error: "Bitte zuerst anmelden." }, { status: 401 });
        }
        const input = await request.json().catch(() => null);
        return openStudioStream(input, request.signal);
      },
    },
  },
});
