import { z } from "zod";
import { apiError, requireAdmin } from "@/lib/admin-auth";
import {
  adminContent,
  changeEntry,
  HttpError,
  saveEntry,
  saveSettings,
} from "@/lib/store";
import {
  entrySchema,
  entryProblem,
  kinds,
  settingsSchema,
} from "@/lib/content-model";
import { boundedBody } from "@/lib/request-body";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await adminContent(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request);
    if (!request.headers.get("content-type")?.includes("application/json"))
      throw new HttpError(415, "JSON 요청이 필요합니다.");
    const text = new TextDecoder().decode(await boundedBody(request, 150000));
    let input;
    try {
      input = JSON.parse(text);
    } catch {
      throw new HttpError(400, "요청 내용을 확인해 주세요.");
    }
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new HttpError(400, "요청 내용을 확인해 주세요.");
    if (input.operation === "settings") {
      const v = z
        .object({
          data: settingsSchema,
          version: z.number().int().positive(),
          intent: z.enum(["draft", "publish"]),
        })
        .parse(input);
      await saveSettings(v.data, v.version, v.intent, user.userId);
    } else if (input.operation === "save") {
      const v = z
        .object({
          id: z.string().min(1).max(80).optional(),
          kind: z.enum(kinds),
          data: entrySchema,
          version: z.number().int().positive().optional(),
          intent: z.enum(["draft", "publish"]),
        })
        .parse(input);
      const problem = entryProblem(v.kind, v.data);
      if (problem) throw new HttpError(400, problem);
      await saveEntry(v, user.userId);
    } else {
      const v = z
        .object({
          id: z.string().max(80),
          version: z.number().int().positive(),
          operation: z.enum(["archive", "restore", "unpublish"]),
        })
        .parse(input);
      await changeEntry(v.id, v.version, v.operation, user.userId);
    }
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
