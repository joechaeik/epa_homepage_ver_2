import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { adminIdentity } from "@/lib/admin-auth";
import { adminContent } from "@/lib/store";
import HomePage from "@/components/home-page";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "초안 미리보기",
  robots: { index: false, follow: false },
};
export default async function Preview() {
  await requireChatGPTUser("/admin/preview");
  const { allowed } = await adminIdentity();
  if (!allowed)
    return <main className="section">관리자 권한이 필요합니다.</main>;
  const data = await adminContent();
  return (
    <>
      <div className="preview-banner" lang="ko">
        저장된 홈 초안 미리보기 · 편집 내용은 공개 반영 버튼을 눌러야
        공개됩니다.
        <Link href="/admin">관리자로 돌아가기 →</Link>
      </div>
      <HomePage
        settings={data.settings.draft}
        records={data.records
          .filter((r) => !r.archived)
          .map((r) => ({ ...r.draft, id: r.id, kind: r.kind }))}
      />
    </>
  );
}
