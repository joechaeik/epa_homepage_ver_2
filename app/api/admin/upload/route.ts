import { apiError, requireAdmin } from "@/lib/admin-auth";
import { bucket, database, HttpError } from "@/lib/store";
import { boundedBody } from "@/lib/request-body";
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const limit = 10 * 1024 * 1024;
    if (
      !request.headers.get("content-type")?.startsWith("multipart/form-data;")
    )
      throw new HttpError(415, "파일 업로드 형식을 확인해 주세요.");
    const bytes = await boundedBody(request, limit + 65536);
    let form: FormData;
    try {
      form = await new Request(request.url, {
        method: "POST",
        headers: { "content-type": request.headers.get("content-type") || "" },
        body: bytes,
      }).formData();
    } catch {
      throw new HttpError(400, "파일 업로드 요청을 읽을 수 없습니다.");
    }
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > limit)
      throw new HttpError(400, "유효한 파일을 선택해 주세요.");
    const data = new Uint8Array(await file.arrayBuffer());
    const head = Array.from(data.slice(0, 12));
    const mime =
      head[0] === 255 && head[1] === 216 && head[2] === 255
        ? "image/jpeg"
        : head.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
          ? "image/png"
          : new TextDecoder().decode(data.slice(0, 4)) === "RIFF" &&
              new TextDecoder().decode(data.slice(8, 12)) === "WEBP"
            ? "image/webp"
            : new TextDecoder().decode(data.slice(0, 5)) === "%PDF-"
              ? "application/pdf"
              : null;
    if (!mime || file.type !== mime)
      throw new HttpError(415, "JPG, PNG, WebP 이미지 또는 PDF만 지원합니다.");
    const id = crypto.randomUUID();
    const alt = String(form.get("alt") || "").slice(0, 500);
    const name = file.name.replace(/[\r\n\x00]/g, "").slice(0, 180);
    const now = new Date().toISOString();
    await bucket().put(id, data, { httpMetadata: { contentType: mime } });
    try {
      await database()
        .prepare(
          "INSERT INTO media (id,name,mime,size,alt,created_at) VALUES (?,?,?,?,?,?)",
        )
        .bind(id, name, mime, file.size, alt, now)
        .run();
    } catch (e) {
      await bucket().delete(id);
      throw e;
    }
    return Response.json(
      {
        id,
        name,
        mime,
        size: file.size,
        alt,
        url: "/api/media/" + id,
        createdAt: now,
      },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
