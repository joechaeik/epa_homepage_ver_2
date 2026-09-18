import { HttpError } from "./store";
// Finish small rejected request bodies before returning a response. This avoids
// leaving a live request stream behind in the Workers proxy/runtime.
export async function discardRequestBody(request: Request) {
  if (!request.body || request.bodyUsed || request.body.locked) return;
  const reader = request.body.getReader();
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 4096) { await reader.cancel(); break; }
    }
  } catch {
    // The peer may have disconnected while its rejected body was drained.
  } finally { reader.releaseLock(); }
}
export async function boundedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit)
    throw new HttpError(413, "요청 크기가 너무 큽니다.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "요청 내용이 없습니다.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > limit) {
      await reader.cancel();
      throw new HttpError(413, "요청 크기가 너무 큽니다.");
    }
    chunks.push(value);
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
