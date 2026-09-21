// Exercise the production Worker with isolated local storage and a disposable secret.
import assert from 'node:assert/strict';
import { randomBytes, createHmac } from 'node:crypto';
import { readFile, writeFile, mkdir, mkdtemp, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const wrangler = path.join(root, 'node_modules/wrangler/bin/wrangler.js');
const run = promisify(execFile);
await mkdir(path.join(root, '.wrangler'), { recursive: true });
const temp = await mkdtemp(path.join(root, '.wrangler/review-qa-'));
const secret = randomBytes(32).toString('hex');
const config = JSON.parse(await readFile(path.join(root, 'wrangler.jsonc'), 'utf8'));
const withR2 = process.argv.includes('--with-r2');
if (withR2) config.r2_buckets = [{ binding: 'BUCKET', bucket_name: 'epa-review-qa' }];
else delete config.r2_buckets;
config.main = path.join(root, 'dist/server/index.js');
config.assets.directory = path.join(root, 'dist/client');
config.d1_databases[0].migrations_dir = path.join(root, 'drizzle');
const configPath = path.join(temp, 'wrangler.json');
await writeFile(configPath, JSON.stringify(config));
const secretPath = path.join(temp, '.dev.vars');
await writeFile(secretPath, `EPA_ADMIN_PASSWORD=${secret}\n`);
const env = { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_CF_FETCH_ENABLED: 'false' };
const common = ['--config', configPath, '--persist-to', path.join(temp, 'state')];
const base = 'http://127.0.0.1:8793';
let server;
let output = '';
let cookie = '';
const request = async (url, options = {}) => {
  const response = await fetch(base + url, { redirect: 'manual', signal: AbortSignal.timeout(15000), ...options });
  return new Response(await response.arrayBuffer(), { status: response.status, headers: response.headers });
};
const login = (password, extra = {}) => request('/api/admin/session', {
  method: 'POST', headers: { Origin: base, 'Content-Type': 'application/x-www-form-urlencoded', ...extra },
  body: new URLSearchParams({ password }),
});
const content = async () => {
  const r = await request('/api/admin/content', { headers: { Cookie: cookie } });
  assert.equal(r.status, 200); return r.json();
};
const save = body => request('/api/admin/content', {
  method: 'POST', headers: { Origin: base, Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const mark = label => console.log('PASS ' + label);
try {
  await run(process.execPath, [wrangler, 'd1', 'migrations', 'apply', 'DB', '--local', ...common], { cwd: root, env });
  const repeat = await run(process.execPath, [wrangler, 'd1', 'migrations', 'apply', 'DB', '--local', ...common], { cwd: root, env });
  assert.match(repeat.stdout, /No migrations/i);
  mark('Initial schema and repeat-safe migrations');
  server = spawn(process.execPath, [wrangler, 'dev', '--local', ...common, '--ip', '127.0.0.1', '--port', '8793', '--inspector-port', '0'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });
  server.on('error', error => { output += error.message; });
  let ready = false;
  for (let i = 0; i < 120; i++) {
    try { if ((await request('/admin')).status === 200) { ready = true; break; } } catch {}
    if (server.exitCode !== null) throw new Error('Worker stopped: ' + output);
    await delay(500);
  }
  assert.ok(ready, 'Production Worker starts');
  assert.equal((await request('/')).status, 200);
  assert.equal((await request('/images/main-01.jpg')).status, 200);
  assert.equal((await request('/api/admin/content')).status, 401);
  for (const id of ['password-admin', 'local_seedy']) {
    assert.equal((await request('/api/admin/content', { headers: { 'oai-authenticated-user-id': id, 'oai-authenticated-user-email': 'spoof@example.com' } })).status, 401);
  }
  assert.equal((await request('/admin/preview')).status, 307);
  mark('Public page/assets work; anonymous and spoofed administrator access rejected');
  assert.equal((await login(secret, { Origin: 'https://untrusted.invalid' })).status, 403);
  assert.equal((await login(secret, { Origin: '' })).status, 403);
  const tooLarge = await login('x'.repeat(5000));
  assert.equal(tooLarge.status, 413, await tooLarge.text());
  assert.match((await login('wrong')).headers.get('location'), /login=failed/);
  const loggedIn = await login(secret);
  assert.equal(loggedIn.status, 303, await loggedIn.text());
  const setCookie = loggedIn.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /Secure/); assert.match(setCookie, /SameSite=Strict/);
  cookie = setCookie.split(';')[0];
  const initial = await content();
  assert.equal(initial.uploadsEnabled, withR2);
  assert.ok(initial.records.length >= 34);
  mark('Password login and authenticated content read');
  const tampered = cookie.slice(0, -2) + (cookie.slice(-2, -1) === 'A' ? 'B' : 'A') + cookie.slice(-1);
  assert.equal((await request('/api/admin/content', { headers: { Cookie: tampered } })).status, 401);
  const expired = 'v1.' + (Math.floor(Date.now()/1000) - 10);
  const expiredSignature = createHmac('sha256', secret).update(expired).digest('base64url');
  assert.equal((await request('/api/admin/content', { headers: { Cookie: `epa_admin_session=${expired}.${expiredSignature}` } })).status, 401);
  assert.equal((await request('/api/admin/content', { headers: { Cookie: cookie + '.extra' } })).status, 401);
  assert.equal((await request('/api/admin/content', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://untrusted.invalid', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  mark('Tampered/expired sessions and cross-site writes rejected');
  const label = 'Review QA ' + randomBytes(8).toString('hex');
  assert.equal((await save({ operation: 'save', kind: 'news', intent: 'draft', data: { title: label, date: '2026-09-18', featured: true } })).status, 200);
  const draft = (await content()).records.find(r => r.draft.title === label);
  assert.ok(draft); assert.equal(draft.published, null);
  assert.ok(!(await (await request('/news')).text()).includes(label));
  const preview = await request('/admin/preview', { headers: { Cookie: cookie } });
  assert.equal(preview.status, 200); assert.ok((await preview.text()).includes(label));
  assert.equal((await save({ operation: 'save', id: draft.id, kind: 'news', version: draft.version, intent: 'publish', data: draft.draft })).status, 200);
  assert.ok((await (await request('/news')).text()).includes(label));
  assert.equal((await save({ operation: 'save', id: draft.id, kind: 'news', version: draft.version, intent: 'publish', data: draft.draft })).status, 409);
  mark('Draft isolation, authenticated preview, publish, and stale-edit protection');
  const settings = (await content()).settings;
  assert.equal((await save({ operation: 'settings', version: settings.version, intent: 'publish', data: { ...settings.draft, heroImage: '/images/main-02.jpg' } })).status, 200);
  assert.ok((await (await request('/')).text()).includes('/images/main-02.jpg'));
  const adminPage = await request('/admin', { headers: { Cookie: cookie } });
  assert.equal(adminPage.status, 200);
  const html = await adminPage.text();
  assert.ok(!html.includes(secret));
  assert.ok(html.includes('action="logout"') || html.includes('value="logout"'));
  if (withR2) {
    const bytes = await readFile(path.join(root, 'public/images/main-01.jpg'));
    const form = new FormData();
    form.set('file', new File([bytes], 'qa-hero.jpg', { type: 'image/jpeg' }));
    const upload = await request('/api/admin/upload', { method: 'POST', headers: { Cookie: cookie, Origin: base }, body: form });
    assert.equal(upload.status, 201, await upload.clone().text());
    const media = await upload.json();
    const asset = await request(media.url);
    assert.equal(asset.status, 200);
    assert.deepEqual(Buffer.from(await asset.arrayBuffer()), bytes);
    const forged = new FormData();
    forged.set('file', new File(['<script>invalid</script>'], 'fake.jpg', { type: 'image/jpeg' }));
    assert.equal((await request('/api/admin/upload', { method: 'POST', headers: { Cookie: cookie, Origin: base }, body: forged })).status, 415);
    mark('R2 image upload serves original bytes; forged image rejected');
  } else {
    const upload = await request('/api/admin/upload', { method: 'POST', headers: { Cookie: cookie, Origin: base }, body: 'unused' });
    assert.equal(upload.status, 503); assert.match((await upload.json()).error, /업로드는 준비 중/);
    mark('Missing R2 has an explicit unavailable state');
  }
  const editSettings = async (scope, intent, change) => {
    const s = (await content()).settings;
    const data = structuredClone(s.draft);
    change(data);
    const r = await save({ operation: 'settings', scope, intent, data, version: s.version });
    assert.equal(r.status, 200, await r.text());
  };
  const original = (await content()).settings;
  await editSettings('research', 'draft', s => { s.pageHeroes.research.title = 'Research hero QA'; s.pageHeroes.research.position = 22; s.pageHeroes.research.positionY = 73; });
  assert.ok(!(await (await request('/research')).text()).includes('Research hero QA'));
  assert.ok((await (await request('/admin/preview?page=research', { headers: { Cookie: cookie } })).text()).includes('Research hero QA'));
  await editSettings('people', 'draft', s => { s.pageHeroes.people.title = 'People draft QA'; });
  await editSettings('research', 'publish', () => {});
  let scoped = (await content()).settings;
  assert.equal(scoped.published.pageHeroes.research.title, 'Research hero QA');
  assert.equal(scoped.published.pageHeroes.research.positionY, 73);
  assert.deepEqual(scoped.published.pageHeroes.people, original.published.pageHeroes.people);
  assert.equal(scoped.draft.pageHeroes.people.title, 'People draft QA');
  await editSettings('site', 'publish', s => { s.address = 'QA address'; });
  scoped = (await content()).settings;
  assert.deepEqual(scoped.published.pageHeroes.people, original.published.pageHeroes.people);
  assert.equal(scoped.published.pageHeroes.research.title, 'Research hero QA');
  assert.ok((await (await request('/join')).text()).includes('output=embed'));
  await editSettings('research', 'publish', s => { s.pageHeroes.research.image = ''; });
  const research = await (await request('/research')).text();
  assert.ok(research.includes('Research hero QA'));
  assert.ok(!/<img[^>]*class="hero-photo"/.test(research));
  const currentSettings = (await content()).settings;
  assert.equal((await save({ operation: 'settings', scope: 'site', intent: 'draft', version: currentSettings.version, data: { ...currentSettings.draft, mapEmbedUrl: 'https://untrusted.invalid/maps/embed' } })).status, 400);
  assert.deepEqual((await content()).records.filter(r => r.id !== draft.id), initial.records);
  for (const route of ['/', '/research', '/people', '/publications', '/news', '/join', '/join-us']) {
    const response = await request(route);
    assert.equal(response.status, 200, route);
    assert.ok((await response.text()).includes('<h1'), route);
  }
  mark('Per-page hero drafts, preview, independent publish, image removal, maps, and existing records preserved');
  const logout = await request('/api/admin/session', { method: 'POST', headers: { Origin: base, Cookie: cookie, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'action=logout' });
  assert.equal(logout.status, 303); assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await request('/api/admin/content')).status, 401);
  for (let i = 0; i < 11; i++) {
    const attempt = await login('wrong');
    if (attempt.headers.get('location')?.includes('login=limited')) { mark('Repeated login attempts limited'); break; }
    assert.notEqual(i, 10, 'Limiter must reject repeated attempts');
  }
  mark('Logout clears the browser session');
} catch (error) {
  await delay(500);
  console.error(output.split(secret).join('[redacted]').split('\n').filter(line => /wrangler.*info|error|Error|exception|Uncaught/.test(line)).slice(-40).join('\n'));
  throw error;
} finally {
  if (server?.pid && server.exitCode === null) {
    if (process.platform === 'win32') await run('taskkill', ['/pid', String(server.pid), '/t', '/f']).catch(() => {});
    else server.kill('SIGTERM');
  }
  await unlink(secretPath).catch(() => {});
}
