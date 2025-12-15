export type SseDelta = { type: "delta"; text: string };
export type SseDone = { type: "done" };
export type SsePayload = SseDelta | SseDone;

type OnMessage = (payload: SsePayload) => void;
type OnError = (err: unknown) => void;

/**
 * Minimal SSE-over-fetch parser for FastAPI StreamingResponse.
 * Expects lines like:
 *   event: message
 *   data: {"type":"delta","text":"..."}
 *
 * And done:
 *   event: done
 *   data: {"type":"done"}
 */
export async function ssePostJson(
  url: string,
  body: unknown,
  onMessage: OnMessage,
  onError?: OnError,
  signal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok || !res.body) {
      throw new Error(`SSE request failed: ${res.status} ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let currentEvent: string | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split on double newline which terminates an SSE event
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const lines = part.split("\n").map((l) => l.trim());
        let dataLine = "";

        for (const line of lines) {
          if (line.startsWith("event:")) currentEvent = line.slice(6).trim();
          if (line.startsWith("data:")) dataLine += line.slice(5).trim();
        }

        if (!dataLine) continue;

        try {
          const payload = JSON.parse(dataLine) as SsePayload;
          onMessage(payload);

          if (currentEvent === "done" || payload.type === "done") {
            return;
          }
        } catch {
          // ignore malformed JSON events (prototype)
        } finally {
          currentEvent = null;
        }
      }
    }
  } catch (err) {
    if (onError) onError(err);
    else throw err;
  }
}
