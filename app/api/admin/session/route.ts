import { env } from "cloudflare:workers";
import { apiError, createAdminSession, passwordLoginAvailable, sessionCookie, verifyAdminPassword } from "@/lib/admin-auth";
import { boundedBody, discardRequestBody } from "@/lib/request-body";
import { HttpError } from "@/lib/store";

function redirect(request: Request, path: string, cookie?: string) {
  // Response.redirect() has immutable headers in the Workers runtime.
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(path, request.url).href,
      "Cache-Control": "no-store",
      ...(cookie ? { "Set-Cookie": cookie } : {}),
    },
  });
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      throw new HttpError(403, "허용되지 않은 요청입니다.");
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))
      throw new HttpError(415, "로그인 입력 형식을 확인해 주세요.");
    const form = new URLSearchParams(new TextDecoder().decode(await boundedBody(request, 4096)));
    if (form.get("action") === "logout")
      return redirect(request, "/admin", sessionCookie("", true));
    if (!passwordLoginAvailable() || !env.LOGIN_RATE_LIMIT)
      throw new HttpError(503, "관리자 로그인이 아직 설정되지 않았습니다.");
    const { success } = await env.LOGIN_RATE_LIMIT.limit({
      key: `admin-login:${request.headers.get("CF-Connecting-IP") || "local"}`,
    });
    if (!success) return redirect(request, "/admin?login=limited");
    if (!(await verifyAdminPassword(form.get("password") || "")))
      return redirect(request, "/admin?login=failed");
    return redirect(request, "/admin", sessionCookie(await createAdminSession()));
  } catch (error) {
    await discardRequestBody(request);
    const response = apiError(error);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
