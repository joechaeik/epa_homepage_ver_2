import ProfessorAchievements from "@/components/professor-achievements";
import ProfessorProfile from "@/components/professor-profile";
import Hero from "@/components/hero";
import PeopleAlumni from "@/components/people-alumni";
import { publicContent } from "@/lib/store";
import { SiteFrame, JoinBanner } from "@/components/site-frame";
import PeopleBrowser from "@/components/people-browser";
import { comparePeople } from "@/lib/people-order";
import Link from "@/components/site-link";
export const metadata = { title: "People" };
export const dynamic = "force-dynamic";
export default async function People({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const requestedCategory = (await searchParams).category;
  const { settings, records } = await publicContent();
  const people = records
    .filter((r) => r.kind === "people")
    .sort((a, b) => comparePeople(a, b, settings.peopleSortDirection));
  const pi = people.find((r) => r.category === "Principal investigator");
  return (
    <SiteFrame settings={settings}>
      <Hero settings={settings} page="people" />
      <PeopleAlumni settings={settings} />
      {pi ? <ProfessorProfile professor={pi} settings={settings} /> : null}
      {pi ? <ProfessorAchievements settings={settings} /> : null}
      <section className="team-section" id="team-members">
        <div className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RESEARCH COMMUNITY</p>
              <h2>Meet our team</h2>
            </div>
            <p>
              A community connected by a commitment to scientific discovery.
            </p>
          </div>
          <PeopleBrowser key={requestedCategory || "All"} initialFilter={requestedCategory} alumniListUpdated={settings.alumniListUpdated} people={people.filter((p) => p.id !== pi?.id)} />
        </div>
      </section>
      <section className="section" id="lab-life">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BEYOND THE BENCH</p>
            <h2>Life at EPA Lab</h2>
          </div>
          <p>Shared moments from our laboratory archive.</p>
        </div>
        <Link className="text-link" href="/lab-life">View lab life photos →</Link>
      </section>
      <JoinBanner settings={settings} />
    </SiteFrame>
  );
}
