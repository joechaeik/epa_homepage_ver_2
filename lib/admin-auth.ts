import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database, HttpError } from "./store";
import { equal, passwordDigest, randomSecret, sign } from "./admin-crypto";

type AdminUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const sessionName = "epa_admin_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

function readCookie(header: string | null, name: string) {
  return header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

type Credential = { password_salt: string; password_hash: string; session_secret: string; version: number };
async function credential() {
  return database().prepare("SELECT password_salt,password_hash,session_secret,version FROM admin_credentials WHERE id='main'").first<Credential>();
}
export function passwordLoginAvailable() {
  return (env.EPA_ADMIN_PASSWORD?.length ?? 0) >= 16;
}
async function matchesPassword(password: string, stored: Credential | null) {
  if (!passwordLoginAvailable() || !password || password.length > 256) return false;
  const secret = env.EPA_ADMIN_PASSWORD!;
  return stored
    ? equal(await passwordDigest(password, stored.password_salt, secret), stored.password_hash)
    : equal(await sign(password, secret), await sign(secret, secret));
}
async function sessionFor(stored: Credential | null) {
  if (!passwordLoginAvailable()) throw new HttpError(503, "관리자 로그인이 아직 설정되지 않았습니다.");
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = stored ? `v2.${stored.version}.${expiresAt}` : `v1.${expiresAt}`;
  return `${payload}.${await sign(payload, stored?.session_secret || env.EPA_ADMIN_PASSWORD!)}`;
}
export async function authenticateAdminPassword(password: string) {
  // Verify and sign against the same snapshot. A concurrent password change
  // will invalidate this session rather than grant access with an old password.
  const stored = await credential();
  return await matchesPassword(password, stored) ? sessionFor(stored) : null;
}
export async function changeAdminPassword(currentPassword: string, newPassword: string, actor: string) {
  if (newPassword.length < 16 || newPassword.length > 128) throw new HttpError(400, "새 비밀번호는 16~128자로 입력해 주세요.");
  const stored = await credential();
  if (!(await matchesPassword(currentPassword, stored))) throw new HttpError(400, "현재 비밀번호가 올바르지 않습니다.");
  if (equal(currentPassword, newPassword)) throw new HttpError(400, "현재 비밀번호와 다른 새 비밀번호를 입력해 주세요.");
  const salt = randomSecret();
  const hash = await passwordDigest(newPassword, salt, env.EPA_ADMIN_PASSWORD!);
  const sessionSecret = randomSecret();
  const now = new Date().toISOString();
  const write = stored
    ? database().prepare("UPDATE admin_credentials SET password_salt=?,password_hash=?,session_secret=?,version=version+1,updated_at=? WHERE id='main' AND version=?").bind(salt, hash, sessionSecret, now, stored.version)
    : database().prepare("INSERT OR IGNORE INTO admin_credentials(id,password_salt,password_hash,session_secret,version,updated_at) VALUES('main',?,?,?,1,?)").bind(salt, hash, sessionSecret, now);
  const [result] = await database().batch([
    write,
    database().prepare("INSERT INTO audit(id,actor,action,target,created_at) SELECT ?,?,'password-change','Administrator password',? WHERE changes()=1").bind(crypto.randomUUID(), actor, now),
  ]);
  if (result.meta.changes !== 1) throw new HttpError(409, "다른 곳에서 비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
}
async function passwordSession(header: string | null): Promise<AdminUser | null> {
  const value = readCookie(header, sessionName);
  if (!passwordLoginAvailable() || !value || !/^(v1\.\d{10}|v2\.\d+\.\d{10})\.[A-Za-z0-9_-]{43}$/.test(value)) return null;
  const stored = await credential();
  const parts = value.split(".");
  const signature = parts.pop()!;
  const expires = parts.at(-1)!;
  if (Number(expires) <= Date.now() / 1000) return null;
  if (stored ? parts[0] !== "v2" || Number(parts[1]) !== stored.version : parts[0] !== "v1") return null;
  if (!equal(signature, await sign(parts.join("."), stored?.session_secret || env.EPA_ADMIN_PASSWORD!))) return null;
  return { userId: "password-admin", displayName: "EPA Administrator", email: "", fullName: null };
}

export function sessionCookie(value: string, clear = false) {
  return `${sessionName}=${clear ? "" : value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${clear ? 0 : sessionLifetimeSeconds}`;
}

export async function adminIdentity() {
  // Only local Vite middleware authenticates these headers; they are untrusted
  // client input on a standalone Cloudflare Worker.
  const chatGPTUser = import.meta.env.DEV ? await getChatGPTUser() : null;
  const local = import.meta.env.DEV && chatGPTUser?.userId === "local_seedy";
  const user = local ? chatGPTUser : await passwordSession((await headers()).get("cookie"));
  const allowed = !!user;
  return { user, allowed, local: !!local, passwordLoginAvailable: passwordLoginAvailable() };
}
export async function requireAdmin(request?: Request) {
  const identity = await adminIdentity();
  if (!identity.user) throw new HttpError(401, "관리자 로그인이 필요합니다.");
  if (!identity.allowed)
    throw new HttpError(403, "등록된 관리자만 접근할 수 있습니다.");
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin)
      throw new HttpError(403, "허용되지 않은 요청입니다.");
  }
  return identity.user;
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error && typeof error === "object" && "issues" in error)
    return Response.json(
      { error: "입력한 내용과 주소 형식을 확인해 주세요." },
      { status: 400 },
    );
  console.error("EPA content operation failed", error);
  return Response.json(
    {
      error:
        "저장소에 연결하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.",
    },
    { status: 503 },
  );
}
