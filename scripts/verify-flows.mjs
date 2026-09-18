import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.EPA_TEST_URL || "http://127.0.0.1:5173";
if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname))
  throw new Error("This verification is local-only.");
const passed = [];
let cookie = "";
let testId = "";
let originalSettings;
const mark = (name) => {
  passed.push(name);
  console.log("PASS " + name);
};
const headers = () => ({
  "Content-Type": "application/json",
  Origin: base,
  Cookie: cookie,
});
const get = async () => {
  const r = await fetch(base + "/api/admin/content", {
    headers: { Cookie: cookie },
  });
  assert.equal(r.status, 200);
  return r.json();
};
const post = (body, extra = {}) =>
  fetch(base + "/api/admin/content", {
    method: "POST",
    headers: { ...headers(), ...extra },
    body: JSON.stringify(body),
  });
const current = async () => (await get()).records.find((r) => r.id === testId);
const page = async (path) => {
  const r = await fetch(base + path);
  return { status: r.status, html: await r.text() };
};
const label = "QA API " + crypto.randomUUID();
let uploaded;
try {
  const unauth = await fetch(base + "/api/admin/content");
  assert.equal(unauth.status, 401);
  mark("Anonymous admin read denied");
  const blocked = await post({
    operation: "save",
    kind: "news",
    intent: "publish",
    data: { title: label, date: "2026-09-18" },
  });
  assert.equal(blocked.status, 401);
  mark("Anonymous write denied");
  const login = await fetch(base + "/signin-with-chatgpt?return_to=%2Fadmin", {
    redirect: "manual",
  });
  cookie = login.headers
    .getSetCookie()
    .map((v) => v.split(";")[0])
    .join("; ");
  assert.ok(cookie, "Local sign-in cookie is issued");
  const initial = await get();
  assert.ok(initial.records.length >= 34);
  originalSettings = structuredClone(initial.settings);
  mark("Local admin sign-in and persistent content read");
  const csrf = await post(
    { operation: "save" },
    { Origin: "https://untrusted.invalid" },
  );
  assert.equal(csrf.status, 403);
  mark("Cross-origin write denied");
  const bad = await post(null);
  assert.equal(bad.status, 400);
  mark("Malformed payload rejected");
  const badDate = await post({
    operation: "save",
    kind: "news",
    intent: "draft",
    data: { title: label, date: "2026-02-30" },
  });
  assert.equal(badDate.status, 400);
  mark("Impossible date rejected");
  const badLink = await post({
    operation: "save",
    kind: "news",
    intent: "draft",
    data: { title: label, date: "2026-09-18", link: "javascript:alert(1)" },
  });
  assert.equal(badLink.status, 400);
  mark("Unsafe link rejected");
  const noAuthor = await post({
    operation: "save",
    kind: "publications",
    intent: "publish",
    data: { title: label },
  });
  assert.equal(noAuthor.status, 400);
  mark("Incomplete publication rejected on server");
  const draft = {
    title: label,
    summary: "Draft isolation verification",
    body: "This is a temporary local QA record.",
    date: "2026-09-18",
    category: "Research",
  };
  const create = await post({
    operation: "save",
    kind: "news",
    intent: "draft",
    data: draft,
  });
  assert.equal(create.status, 200);
  let record = (await get()).records.find((r) => r.draft.title === label);
  assert.ok(record);
  testId = record.id;
  assert.equal(record.published, null);
  assert.equal((await page("/news/" + testId)).status, 404);
  assert.ok(!(await page("/news")).html.includes(label));
  mark("Saved draft hidden from public list and direct URL");
  let publish = await post({
    operation: "save",
    id: testId,
    kind: "news",
    version: record.version,
    intent: "publish",
    data: record.draft,
  });
  assert.equal(publish.status, 200);
  let live = await page("/news/" + testId);
  assert.equal(live.status, 200);
  assert.ok(live.html.includes(label));
  mark("Publish makes detail page publicly readable");
  record = await current();
  const changed = { ...record.draft, title: label + " revised" };
  const update = await post({
    operation: "save",
    id: testId,
    kind: "news",
    version: record.version,
    intent: "draft",
    data: changed,
  });
  assert.equal(update.status, 200);
  const stale = await post({
    operation: "save",
    id: testId,
    kind: "news",
    version: record.version,
    intent: "publish",
    data: record.draft,
  });
  assert.equal(stale.status, 409);
  mark("Stale concurrent update rejected");
  record = await current();
  assert.equal(record.published.title, label);
  assert.equal(record.draft.title, label + " revised");
  live = await page("/news/" + testId);
  assert.ok(!live.html.includes(label + " revised"));
  mark("Editing a published record preserves its live version");
  const unpublish = await post({
    operation: "unpublish",
    id: testId,
    version: record.version,
  });
  assert.equal(unpublish.status, 200);
  assert.equal((await page("/news/" + testId)).status, 404);
  mark("Unpublish hides public detail route");
  record = await current();
  assert.equal(
    (await post({ operation: "archive", id: testId, version: record.version }))
      .status,
    200,
  );
  assert.equal((await current()).archived, true);
  record = await current();
  assert.equal(
    (await post({ operation: "restore", id: testId, version: record.version }))
      .status,
    200,
  );
  record = await current();
  assert.equal(record.archived, false);
  assert.equal(record.published, null);
  mark("Archive and restore retain content as a draft");
  const currentSettings = (await get()).settings;
  const temporary = { ...currentSettings.draft, heroTitle: label };
  assert.equal(
    (
      await post({
        operation: "settings",
        data: temporary,
        version: currentSettings.version,
        intent: "draft",
      })
    ).status,
    200,
  );
  assert.equal(
    (await get()).settings.published.heroTitle,
    originalSettings.published.heroTitle,
  );
  assert.ok(!(await page("/")).html.includes(label));
  mark("Hero draft is isolated from the public home page");
  let settings = (await get()).settings;
  assert.equal(
    (
      await post({
        operation: "settings",
        data: temporary,
        version: settings.version,
        intent: "publish",
      })
    ).status,
    200,
  );
  assert.ok((await page("/")).html.includes(label));
  mark("Hero publish updates the public home page");
  const file = await fs.readFile("public/images/main-01.jpg");
  const upload = new FormData();
  upload.set(
    "file",
    new File([file], "qa-lab-concept.jpg", { type: "image/jpeg" }),
  );
  upload.set("alt", "Local QA concept asset");
  const uploadResult = await fetch(base + "/api/admin/upload", {
    method: "POST",
    headers: { Cookie: cookie, Origin: base },
    body: upload,
  });
  assert.equal(uploadResult.status, 201);
  uploaded = await uploadResult.json();
  const media = await fetch(base + uploaded.url);
  assert.equal(media.status, 200);
  assert.equal(media.headers.get("content-type"), "image/jpeg");
  assert.deepEqual(Buffer.from(await media.arrayBuffer()), file);
  mark("Image upload persists and serves original bytes");
  const spoof = new FormData();
  spoof.set(
    "file",
    new File(["<script>alert(1)</script>"], "unsafe.jpg", {
      type: "image/jpeg",
    }),
  );
  assert.equal(
    (
      await fetch(base + "/api/admin/upload", {
        method: "POST",
        headers: { Cookie: cookie, Origin: base },
        body: spoof,
      })
    ).status,
    415,
  );
  mark("Forged image content rejected");
  const svg = new FormData();
  svg.set(
    "file",
    new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], "unsafe.svg", {
      type: "image/svg+xml",
    }),
  );
  assert.equal(
    (
      await fetch(base + "/api/admin/upload", {
        method: "POST",
        headers: { Cookie: cookie, Origin: base },
        body: svg,
      })
    ).status,
    415,
  );
  mark("Active SVG upload rejected");
  for (const path of [
    "/",
    "/research",
    "/publications",
    "/people",
    "/news",
    "/join-us",
  ]) {
    const p = await page(path);
    assert.equal(p.status, 200, path);
    assert.ok(p.html.includes("<h1"), path);
    assert.ok(!p.html.includes("We couldn’t load this page."), path);
  }
  mark("All six public pages render successfully");
  assert.equal((await page("/news/missing-article")).status, 404);
  mark("Missing content returns 404");
} finally {
  if (cookie && originalSettings) {
    let s = (await get()).settings;
    assert.equal(
      (
        await post({
          operation: "settings",
          data: originalSettings.published,
          version: s.version,
          intent: "publish",
        })
      ).status,
      200,
    );
    s = (await get()).settings;
    assert.equal(
      (
        await post({
          operation: "settings",
          data: originalSettings.draft,
          version: s.version,
          intent: "draft",
        })
      ).status,
      200,
    );
  }
  if (testId) {
    const record = await current();
    if (record && !record.archived)
      await post({ operation: "archive", id: testId, version: record.version });
  }
  await fs.mkdir("outputs", { recursive: true });
  await fs.writeFile(
    "outputs/api-verification.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        passed,
        temporaryRecordId: testId,
        temporaryUploadId: uploaded?.id,
        heroRestored: !!originalSettings,
      },
      null,
      2,
    ),
  );
}
console.log(
  `${passed.length} checks passed; original hero restored; test record archived.`,
);
