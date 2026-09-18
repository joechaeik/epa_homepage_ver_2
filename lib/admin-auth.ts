import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { HttpError } from "./store";
export async function adminIdentity() {
  const user = await getChatGPTUser();
  const local = import.meta.env.DEV && user?.userId === "local_seedy";
  const allowed =
    !!user &&
    (local ||
      (!!env.EPA_ADMIN_USER_ID && user.userId === env.EPA_ADMIN_USER_ID));
  return { user, allowed, local: !!local };
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
