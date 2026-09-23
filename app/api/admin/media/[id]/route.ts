import { apiError, requireAdmin } from "@/lib/admin-auth";
import { bucket, database, HttpError } from "@/lib/store";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin(request);
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/.test(id))
      throw new HttpError(400, "파일 주소를 확인해 주세요.");
    const db = database();
    const storage = bucket();
    const media = await db.prepare("SELECT * FROM media WHERE id=?").bind(id).first<{
      id: string; name: string; mime: string; size: number; alt: string; created_at: string;
    }>();
    if (!media) throw new HttpError(404, "이미 삭제된 파일입니다. 목록을 새로고침해 주세요.");
    const url = `/api/media/${id}`;
    // The conditional DELETE checks drafts, published content, and archived records
    // in the same database statement, so a stale admin tab cannot remove a linked file.
    const deleted = await db.prepare(`DELETE FROM media WHERE id=?
      AND NOT EXISTS (SELECT 1 FROM content_records AS c, json_tree(c.draft) AS j WHERE j.value=?)
      AND NOT EXISTS (SELECT 1 FROM content_records AS c, json_tree(c.published) AS j WHERE j.value=?)
      AND NOT EXISTS (SELECT 1 FROM site_settings AS s, json_tree(s.draft) AS j WHERE j.value=?)
      AND NOT EXISTS (SELECT 1 FROM site_settings AS s, json_tree(s.published) AS j WHERE j.value=?)`)
      .bind(id, url, url, url, url).run();
    if (deleted.meta.changes !== 1)
      throw new HttpError(409, "사용 중인 파일입니다. 연결된 콘텐츠의 초안과 공개본에서 파일을 교체한 뒤 다시 삭제해 주세요.");
    try {
      await storage.delete(id);
    } catch (error) {
      await db.prepare("INSERT OR IGNORE INTO media (id,name,mime,size,alt,created_at) VALUES (?,?,?,?,?,?)")
        .bind(media.id, media.name, media.mime, media.size, media.alt, media.created_at).run();
      throw error;
    }
    try {
      await db.prepare("INSERT INTO audit (id,actor,action,target,created_at) VALUES (?,?,?,?,?)")
        .bind(crypto.randomUUID(), user.userId, "delete-media", media.name, new Date().toISOString()).run();
    } catch (error) {
      console.error("Media deletion audit failed", error);
    }
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
