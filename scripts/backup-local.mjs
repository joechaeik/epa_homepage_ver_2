import { Miniflare } from "miniflare";
import { mkdir, writeFile, cp, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.join(root, "backups", stamp);
const d1Persist = path.join(root, ".wrangler", "state", "v3", "d1");
await access(d1Persist);
await mkdir(destination, { recursive: true });
const runtime = new Miniflare({
  modules: true,
  script: "export default {}",
  d1Persist,
  d1Databases: { DATABASE: "00000000-0000-4000-8000-000000000000" },
});
try {
  const database = await runtime.getD1Database("DATABASE");
  const count = await database
    .prepare("SELECT count(*) AS total FROM content_records")
    .first();
  const dump = await database
    .prepare("PRAGMA miniflare_d1_export(?,?,?);")
    .bind(false, false)
    .raw();
  await writeFile(path.join(destination, "content.sql"), dump[0].join("\n"));
  const mediaPath = path.join(root, ".wrangler", "state", "v3", "r2");
  try {
    await access(mediaPath);
    await cp(mediaPath, path.join(destination, "r2"), { recursive: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await writeFile(
    path.join(destination, "README.txt"),
    "Local EPA Lab backup. content.sql contains content, settings, media metadata and activity. r2 contains uploaded files. Keep the website/public/images folder with the project. Stop the local server before backing up important edits to avoid simultaneous uploads.\n",
  );
  console.log(
    `Backed up ${count.total} content records and local uploads to ${destination}`,
  );
} finally {
  await runtime.dispose();
}
