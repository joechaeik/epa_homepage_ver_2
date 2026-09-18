import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { HttpError } from "./store";

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

function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

function equal(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let result = left.length ^ right.length;
  for (let i = 0; i < length; i++) result |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  return result === 0;
}

export function passwordLoginAvailable() {
  return (env.EPA_ADMIN_PASSWORD?.length ?? 0) >= 16;
}

export async function verifyAdminPassword(password: string) {
  if (!passwordLoginAvailable()) return false;
  return equal(await sign(password, env.EPA_ADMIN_PASSWORD!), await sign(env.EPA_ADMIN_PASSWORD!, env.EPA_ADMIN_PASSWORD!));
}

export async function createAdminSession() {
  const secret = env.EPA_ADMIN_PASSWORD;
  if (!passwordLoginAvailable() || !secret) throw new HttpError(503, "관리자 로그인이 아직 설정되지 않았습니다.");
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = `v1.${expiresAt}`;
  return `${payload}.${await sign(payload, secret)}`;
}

async function passwordSession(header: string | null): Promise<AdminUser | null> {
  const secret = env.EPA_ADMIN_PASSWORD;
  const value = readCookie(header, sessionName);
  if (!passwordLoginAvailable() || !secret || !value || !/^v1\.\d{10}\.[A-Za-z0-9_-]{43}$/.test(value)) return null;
  const [version, expires, signature] = value.split(".");
  const payload = `${version}.${expires}`;
  if (version !== "v1" || !/^\d+$/.test(expires) || !signature || Number(expires) < Date.now() / 1000) return null;
  if (!equal(signature, await sign(payload, secret))) return null;
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
