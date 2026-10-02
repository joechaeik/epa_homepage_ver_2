import Link from "@/components/site-link";
import { redirect } from "next/navigation";
import { adminIdentity } from "@/lib/admin-auth";
import { adminContent } from "@/lib/store";
import HomePage from "@/components/home-page";
import Hero from "@/components/hero";
import ProfessorAchievements from "@/components/professor-achievements";
import PeopleAlumni from "@/components/people-alumni";
import JoinPage from "@/components/join-page";
import ResearchPage from "@/components/research-page";
import ResearchTopic from "@/components/research-topic";
import { SiteFrame } from "@/components/site-frame";
import { heroPages, type HeroPage } from "@/lib/content-model";
import PeopleBrowser from "@/components/people-browser";
import { comparePeople } from "@/lib/people-order";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "초안 미리보기",
  robots: { index: false, follow: false },
};
export default async function Preview({ searchParams }: { searchParams: Promise<{ page?: string; topic?: string }> }) {
  const { allowed } = await adminIdentity();
  if (!allowed)
    redirect("/admin");
  const data = await adminContent();
  const { page: requested, topic: topicId } = await searchParams;
  const page: HeroPage = heroPages.includes(requested as HeroPage) ? requested as HeroPage : "home";
  const records = data.records.filter(r => !r.archived).map(r => ({ ...r.draft, id: r.id, kind: r.kind }));
  const topic = page === "research" ? records.find(r => r.kind === "research" && r.id === topicId) : undefined;
  return (
    <>
      <div className="preview-banner" lang="ko">
        저장된 {page === "home" ? "홈" : page === "people" ? "People·교수 성과" : page === "join" ? "Join Our Lab·모집 안내" : page === "research" ? "Research·연구 설명" : "Hero"} 초안 미리보기 · 편집 내용은 공개 반영 버튼을 눌러야
        공개됩니다.
        <Link href="/admin">관리자로 돌아가기 →</Link>
      </div>
      {page === "home" ? <HomePage
        settings={data.settings.draft}
        records={data.records
          .filter((r) => !r.archived)
          .map((r) => ({ ...r.draft, id: r.id, kind: r.kind }))}
      /> : page === "research" ? topic
        ? <ResearchTopic settings={data.settings.draft} records={records} topic={topic} preview />
        : <ResearchPage settings={data.settings.draft} records={records} preview />
      : page === "join" ? <JoinPage settings={data.settings.draft} records={records} /> : <SiteFrame settings={data.settings.draft}>
        <Hero settings={data.settings.draft} page={page} />
        {page === "people" ? <><PeopleAlumni settings={data.settings.draft} preview /><ProfessorAchievements settings={data.settings.draft} /><section className="team-section" id="team-members"><div className="section"><div className="section-heading"><div><p className="eyebrow">RESEARCH COMMUNITY</p><h2>Meet our team</h2></div><p>A community connected by a commitment to scientific discovery.</p></div><PeopleBrowser alumniListUpdated={data.settings.draft.alumniListUpdated} people={records.filter(r => r.kind === "people" && r.category !== "Principal investigator").sort((a, b) => comparePeople(a, b, data.settings.draft.peopleSortDirection))} /></div></section></> : null}
        {page !== "people" ? <section className="section"><p>Hero preview · Content below this section remains unchanged.</p>
        </section> : null}
      </SiteFrame>}
    </>
  );
}
