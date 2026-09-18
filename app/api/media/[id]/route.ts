import { bucket, database } from "@/lib/store";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/.test(id))
      return new Response("Not found", { status: 404 });
    const meta = await database()
      .prepare("SELECT name,mime FROM media WHERE id=?")
      .bind(id)
      .first<{ name: string; mime: string }>();
    if (!meta) return new Response("Not found", { status: 404 });
    const file = await bucket().get(id);
    if (!file) return new Response("Not found", { status: 404 });
    return new Response(file.body, {
      headers: {
        "Content-Type": meta.mime,
        "Content-Length": String(file.size),
        ETag: file.httpEtag,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Content-Disposition": `${meta.mime === "application/pdf" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(meta.name)}`,
      },
    });
  } catch (e) {
    console.error("EPA media unavailable", e);
    return new Response("Media temporarily unavailable", { status: 503 });
  }
}
