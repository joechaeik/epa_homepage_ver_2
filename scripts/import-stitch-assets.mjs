import fs from "node:fs/promises";
import path from "node:path";
await fs.mkdir("public/images", { recursive: true });
const manifest = [];
const source = await fs.readFile(
  path.resolve("../stitch_epa/epa_lab_main_page_desktop/code.html"),
  "utf8",
);
const urls = [
  ...new Set(
    [
      ...source.matchAll(
        /https:\/\/lh3\.googleusercontent\.com\/[^\s"'<>;)]+/g,
      ),
    ].map((m) => m[0].split("&quot")[0]),
  ),
];
for (const [i, url] of urls.entries()) {
  const target = `/images/main-${String(i + 1).padStart(2, "0")}.jpg`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    await fs.writeFile("public" + target, Buffer.from(await res.arrayBuffer()));
    manifest.push({
      target,
      url,
      usage:
        "Supplied Stitch concept imagery, not actual laboratory photography.",
    });
    console.log(target);
  } catch (error) {
    console.error("Asset unavailable:", target, error.message);
  }
}
await fs.writeFile(
  "public/images/provenance.json",
  JSON.stringify(manifest, null, 2),
);
