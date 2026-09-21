import Link from "next/link";
import { redirect } from "next/navigation";
import { adminIdentity } from "@/lib/admin-auth";
import { adminContent } from "@/lib/store";
import HomePage from "@/components/home-page";
import Hero from "@/components/hero";
import LocationMap from "@/components/location-map";
import { SiteFrame } from "@/components/site-frame";
import { heroPages, type HeroPage } from "@/lib/content-model";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "초안 미리보기",
  robots: { index: false, follow: false },
};
export default async function Preview({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { allowed } = await adminIdentity();
  if (!allowed)
    redirect("/admin");
  const data = await adminContent();
  const requested = (await searchParams).page;
  const page: HeroPage = heroPages.includes(requested as HeroPage) ? requested as HeroPage : "home";
  return (
    <>
      <div className="preview-banner" lang="ko">
        저장된 {page === "home" ? "홈" : "Hero"} 초안 미리보기 · 편집 내용은 공개 반영 버튼을 눌러야
        공개됩니다.
        <Link href="/admin">관리자로 돌아가기 →</Link>
      </div>
      {page === "home" ? <HomePage
        settings={data.settings.draft}
        records={data.records
          .filter((r) => !r.archived)
          .map((r) => ({ ...r.draft, id: r.id, kind: r.kind }))}
      /> : <SiteFrame settings={data.settings.draft}>
        <Hero settings={data.settings.draft} page={page} />
        <section className="section"><p>Hero preview · Content below this section remains unchanged.</p>
          {page === "join" ? <><h2>Location</h2><p>{data.settings.draft.address}</p><LocationMap settings={data.settings.draft} /></> : null}
        </section>
      </SiteFrame>}
    </>
  );
}
