import { env } from "cloudflare:workers";
import { apiError, changeAdminPassword, requireAdmin, sessionCookie } from "@/lib/admin-auth";
import { boundedBody, discardRequestBody } from "@/lib/request-body";
import { HttpError } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request);
    if (user.userId !== "password-admin") throw new HttpError(403, "공개 사이트에 비밀번호로 로그인한 뒤 변경해 주세요.");
    if (!env.LOGIN_RATE_LIMIT) throw new HttpError(503, "로그인 보안 설정을 확인해 주세요.");
    const { success } = await env.LOGIN_RATE_LIMIT.limit({ key: `admin-login:${request.headers.get("CF-Connecting-IP") || "local"}` });
    if (!success) throw new HttpError(429, "시도가 많습니다. 1분 후 다시 시도해 주세요.");
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) throw new HttpError(415, "비밀번호 입력 형식을 확인해 주세요.");
    const form = new URLSearchParams(new TextDecoder().decode(await boundedBody(request, 4096)));
    const current = form.get("currentPassword") || "";
    const next = form.get("newPassword") || "";
    if (next !== form.get("confirmPassword")) throw new HttpError(400, "새 비밀번호와 확인 입력이 일치하지 않습니다.");
    await changeAdminPassword(current, next, user.userId);
    return Response.json({ success: true }, { headers: { "Cache-Control": "no-store", "Set-Cookie": sessionCookie("", true) } });
  } catch (error) {
    await discardRequestBody(request);
    const response = apiError(error);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
