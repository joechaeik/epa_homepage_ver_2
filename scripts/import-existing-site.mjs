import fs from "node:fs/promises";
const base = "https://epa.kentech.ac.kr";
const clean = (s) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ndash;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
const records = [];
const provenance = [];
async function asset(url, name) {
  const target = "/images/" + name;
  try {
    const r = await fetch(new URL(url, base));
    if (!r.ok) throw new Error("HTTP " + r.status);
    if (!r.headers.get("content-type")?.startsWith("image/"))
      throw new Error("Not an image");
    await fs.writeFile("public" + target, Buffer.from(await r.arrayBuffer()));
    provenance.push({ path: target, source: new URL(url, base).href });
    return target;
  } catch (e) {
    console.error(name, e.message);
    return "";
  }
}
const html = await fs.readFile("source-data/home.html", "utf8");
for (const m of html.matchAll(
  /<a href="https:\/\/doi.org\/([^"]+)" class="title"[^>]*>([\s\S]*?)<\/a>/g,
)) {
  if (records.some((r) => r.data.doi === m[1])) continue;
  const match = (c) =>
    clean(
      m[2].match(
        new RegExp('<span class="' + c + '">([\\s\\S]*?)<\\/span>'),
      )?.[1] || "",
    );
  const title = match("Title_only").replace(
    "FunctionalMaterials",
    "Functional Materials",
  );
  const journal = clean(m[2].match(/<i>(.*?)<\/i>/)?.[1] || "");
  records.push({
    id: "pub-" + String(records.length + 1).padStart(3, "0"),
    kind: "publications",
    data: {
      title,
      journal,
      authors: match("Author_only"),
      // The original markup repeats its journal/year label before the citation.
      citation: match("Journal_only").replace(`${journal} 2026, `, ""),
      doi: m[1],
      year: 2026,
      source: base + "/home",
      featured: records.length < 3,
      sortOrder: records.length,
      category: "Journal article",
    },
  });
}
const photos = await fs.readFile("source-data/photos.html", "utf8");
let i = 0;
for (const m of photos.matchAll(
  /<a href="([^"]+)" rel="lightbox" data-lightbox="gallery" data-title="([^"]+)"/g,
)) {
  if (i >= 6) break;
  i++;
  const title = clean(m[2]);
  const image = await asset(m[1], "lab-" + i + ".jpg");
  if (image)
    records.push({
      id: "photo-" + i,
      kind: "photos",
      data: {
        title,
        image,
        imageAlt: title,
        category: title.includes("seminar") ? "Seminars" : "Lab life",
        year: 2025,
        sortOrder: i,
        source: base + "/board_4_2",
        featured: [1, 4, 6].includes(i),
      },
    });
}
const portrait = await asset(
  "/layouts/board_3_1/images/professor/Choi2018.jpg",
  "wonyong-choi.jpg",
);
records.push({
  id: "person-choi",
  kind: "people",
  data: {
    title: "Wonyong Choi",
    role: "Director & Distinguished Professor",
    category: "Principal investigator",
    image: portrait,
    imageAlt: "Professor Wonyong Choi",
    email: "wchoi@kentech.ac.kr",
    summary:
      "Environmental & Climate Technology, Korea Institute of Energy Technology (KENTECH).",
    body: "Professor Wonyong Choi leads the Eco-friendly Photoenergy Application Laboratory. His research explores photoenergy applications, photocatalysis, and environmental chemistry.",
    link: "https://orcid.org/0000-0003-1801-9386",
    source: base + "/mboard_3_1",
    sortOrder: 0,
    featured: true,
  },
});
for (const [filename, kind, route] of [
  ["students", "Graduate students", "mboard_3_2"],
  ["researchers", "Researchers", "mboard_3_3"],
]) {
  const html = await fs.readFile("source-data/" + filename + ".html", "utf8");
  for (const m of html.matchAll(
    /<!--BeforeDocument\((\d+),4\)-->([\s\S]*?)<!--AfterDocument/g,
  )) {
    const field = (c) =>
      clean(
        m[2].match(
          new RegExp('<td class="' + c + '"[^>]*>([\\s\\S]*?)<\\/td>'),
        )?.[1] || "",
      );
    const values = [
      ...m[2].matchAll(
        /<td class="sub_title"[^>]*>([\s\S]*?)<\/td>\s*<td class="sub_content"[^>]*>([\s\S]*?)<\/td>/g,
      ),
    ];
    const get = (k) => clean(values.find((v) => clean(v[1]) === k)?.[2] || "");
    const title = field("main_content") || field("main_title");
    const src = m[2].match(/<img[^>]*src="([^"]+)"/)?.[1];
    const image = src ? await asset(src, "member-" + m[1] + ".jpg") : "";
    records.push({
      id: "person-" + m[1],
      kind: "people",
      data: {
        title,
        role: kind === "Graduate students" ? field("main_title") : "Researcher",
        category: kind,
        summary: get("Research Area") || get("Carrier"),
        email: get("E-mail"),
        image,
        imageAlt: title,
        source: base + "/" + route,
        sortOrder: records.filter((r) => r.kind === "people").length,
      },
    });
  }
}
await fs.writeFile(
  "source-data/imported-records.json",
  JSON.stringify(records, null, 2),
);
await fs.writeFile(
  "source-data/asset-provenance.json",
  JSON.stringify(provenance, null, 2),
);
console.log(
  JSON.stringify(
    records.reduce((a, r) => ((a[r.kind] = (a[r.kind] || 0) + 1), a), {}),
  ),
);
