import { env } from "cloudflare:workers";
import { cache } from "react";
import { defaultSettings, seedRecords } from "./seed";
import type {
  Kind,
  Entry,
  RecordItem,
  PublicEntry,
  SettingsItem,
  Settings,
  MediaItem,
} from "./content-model";
import { settingsSchema } from "./content-model";

export function database() {
  if (!env.DB) throw new Error("Content database is unavailable.");
  return env.DB;
}
export function bucket() {
  if (!env.BUCKET) throw new Error("Media storage is unavailable.");
  return env.BUCKET;
}
// Schema is migration-owned. Initial content is inserted once; existing edits are never overwritten.
export async function ensureContent() {
  const db = database();
  if (
    await db.prepare("SELECT id FROM site_settings WHERE id = 'main'").first()
  )
    return;
  const now = new Date().toISOString();
  await db.batch([
    ...seedRecords.map((r) =>
      db
        .prepare(
          "INSERT OR IGNORE INTO content_records (id,kind,draft,published,updated_at) VALUES (?,?,?,?,?)",
        )
        .bind(
          r.id,
          r.kind,
          JSON.stringify(r.data),
          JSON.stringify(r.data),
          now,
        ),
    ),
    db
      .prepare(
        "INSERT OR IGNORE INTO site_settings (id,draft,published,updated_at) VALUES ('main',?,?,?)",
      )
      .bind(
        JSON.stringify(defaultSettings),
        JSON.stringify(defaultSettings),
        now,
      ),
  ]);
}
type Row = {
  id: string;
  kind: Kind;
  draft: string;
  published: string | null;
  archived: number;
  version: number;
  updated_at: string;
};
export function parseRecord(r: Row): RecordItem {
  return {
    id: r.id,
    kind: r.kind,
    draft: JSON.parse(r.draft),
    published: r.published ? JSON.parse(r.published) : null,
    archived: !!r.archived,
    version: r.version,
    updatedAt: r.updated_at,
  };
}
export const publicContent = cache(async () => {
  await ensureContent();
  const [rows, settings] = await Promise.all([
    database()
      .prepare(
        "SELECT id,kind,published FROM content_records WHERE archived = 0 AND published IS NOT NULL",
      )
      .all<{ id: string; kind: Kind; published: string }>(),
    database()
      .prepare("SELECT published FROM site_settings WHERE id = 'main'")
      .first<{ published: string }>(),
  ]);
  if (!settings) throw new Error("Site settings unavailable.");
  const records: PublicEntry[] = rows.results.map((r) => ({
    ...JSON.parse(r.published),
    id: r.id,
    kind: r.kind,
  }));
  records.sort(
    (a, b) => a.sortOrder - b.sortOrder || b.date.localeCompare(a.date),
  );
  return {
    settings: settingsSchema.parse(JSON.parse(settings.published)),
    records,
  };
});
export async function adminContent() {
  await ensureContent();
  const [rows, s, files, activity] = await Promise.all([
    database()
      .prepare("SELECT * FROM content_records ORDER BY updated_at DESC")
      .all<Row>(),
    database()
      .prepare("SELECT * FROM site_settings WHERE id = 'main'")
      .first<{
        draft: string;
        published: string;
        version: number;
        updated_at: string;
      }>(),
    database()
      .prepare(
        "SELECT id,name,mime,size,alt,created_at AS createdAt FROM media ORDER BY created_at DESC",
      )
      .all<MediaItem>(),
    database()
      .prepare(
        "SELECT action,target,created_at AS createdAt FROM audit ORDER BY created_at DESC LIMIT 12",
      )
      .all<{ action: string; target: string; createdAt: string }>(),
  ]);
  if (!s) throw new Error("Site settings unavailable.");
  return {
    records: rows.results.map(parseRecord),
    settings: {
      draft: settingsSchema.parse(JSON.parse(s.draft)),
      published: settingsSchema.parse(JSON.parse(s.published)),
      version: s.version,
      updatedAt: s.updated_at,
    } as SettingsItem,
    media: files.results.map((m) => ({ ...m, url: "/api/media/" + m.id })),
    activity: activity.results,
  };
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function saveEntry(
  input: {
    id?: string;
    kind: Kind;
    data: Entry;
    intent: "draft" | "publish";
    version?: number;
  },
  actor: string,
) {
  await ensureContent();
  const db = database();
  const id = input.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const data = JSON.stringify(input.data);
  const statement = input.id
    ? db
        .prepare(
          "UPDATE content_records SET draft=?, published=CASE WHEN ? = 'publish' THEN ? ELSE published END, version=version+1, updated_at=? WHERE id=? AND kind=? AND version=? AND archived=0",
        )
        .bind(data, input.intent, data, now, id, input.kind, input.version ?? 0)
    : db
        .prepare(
          "INSERT INTO content_records (id,kind,draft,published,updated_at) VALUES (?,?,?,?,?)",
        )
        .bind(
          id,
          input.kind,
          data,
          input.intent === "publish" ? data : null,
          now,
        );
  const result = await db.batch([
    statement,
    db
      .prepare(
        "INSERT INTO audit (id,actor,action,target,created_at) SELECT ?,?,?,?,? WHERE changes() = 1",
      )
      .bind(crypto.randomUUID(), actor, input.intent, input.data.title, now),
  ]);
  if (result[0].meta.changes !== 1)
    throw new HttpError(
      409,
      "다른 화면에서 변경되었습니다. 목록을 새로고침한 뒤 다시 열어 주세요.",
    );
  return id;
}
export async function changeEntry(
  id: string,
  version: number,
  action: "archive" | "restore" | "unpublish",
  actor: string,
) {
  const db = database();
  const now = new Date().toISOString();
  const result = await db.batch([
    db
      .prepare(
        "UPDATE content_records SET archived=?, published=NULL, version=version+1, updated_at=? WHERE id=? AND version=?",
      )
      .bind(action === "archive" ? 1 : 0, now, id, version),
    db
      .prepare(
        "INSERT INTO audit (id,actor,action,target,created_at) SELECT ?,?,?,?,? WHERE changes()=1",
      )
      .bind(crypto.randomUUID(), actor, action, id, now),
  ]);
  if (result[0].meta.changes !== 1)
    throw new HttpError(409, "이미 변경된 항목입니다. 새로고침해 주세요.");
}
export async function saveSettings(
  data: Settings,
  version: number,
  intent: "draft" | "publish",
  actor: string,
) {
  const now = new Date().toISOString();
  const json = JSON.stringify(data);
  const db = database();
  const result = await db.batch([
    db
      .prepare(
        "UPDATE site_settings SET draft=?,published=CASE WHEN ?='publish' THEN ? ELSE published END,version=version+1,updated_at=? WHERE id='main' AND version=?",
      )
      .bind(json, intent, json, now, version),
    db
      .prepare(
        "INSERT INTO audit (id,actor,action,target,created_at) SELECT ?,?,?,?,? WHERE changes()=1",
      )
      .bind(crypto.randomUUID(), actor, intent, "홈·사이트 설정", now),
  ]);
  if (result[0].meta.changes !== 1)
    throw new HttpError(
      409,
      "설정이 다른 화면에서 변경되었습니다. 새로고침해 주세요.",
    );
}
