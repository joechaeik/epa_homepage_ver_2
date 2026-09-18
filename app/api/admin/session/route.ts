import { env } from "cloudflare:workers";
import { createAdminSession, sessionCookie } from "@/lib/admin-auth";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (!env.EPA_ADMIN_PASSWORD || password !== env.EPA_ADMIN_PASSWORD)
    return Response.redirect(new URL("/admin?login=failed", request.url), 303);
  const response = Response.redirect(new URL("/admin", request.url), 303);
  response.headers.set("Set-Cookie", sessionCookie(await createAdminSession()));
  return response;
}

export async function GET(request: Request) {
  const response = Response.redirect(new URL("/admin", request.url), 303);
  response.headers.set("Set-Cookie", sessionCookie("", true));
  return response;
}
