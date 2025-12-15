import { ssePostJson, SsePayload } from "./sse";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export type UploadPdfResult = {
  doc_id: string;
  filename: string;
  pages: number;
  chunks_upserted: number;
};

export async function uploadPdf(file: File): Promise<UploadPdfResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BACKEND}/upload/pdf`, {
    method: "POST",
    body: form
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  return (await res.json()) as UploadPdfResult;
}

export async function streamChat(
  message: string,
  onMessage: (p: SsePayload) => void,
  signal?: AbortSignal
) {
  return ssePostJson(
    `${BACKEND}/chat`,
    { message },
    onMessage,
    undefined,
    signal
  );
}

export async function streamAskPdf(
  doc_id: string,
  question: string,
  use_images: boolean,
  onMessage: (p: SsePayload) => void,
  signal?: AbortSignal
) {
  return ssePostJson(
    `${BACKEND}/ask/pdf`,
    { doc_id, question, use_images },
    onMessage,
    undefined,
    signal
  );
}
