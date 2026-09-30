import ProfessorAchievements from "@/components/professor-achievements";
import LinkedBiography from "@/components/linked-biography";
import Hero from "@/components/hero";
import PeopleAlumni from "@/components/people-alumni";
import { publicContent } from "@/lib/store";
import { SiteFrame, JoinBanner } from "@/components/site-frame";
import PeopleBrowser from "@/components/people-browser";
import { compareDisplayOrder, comparePeople } from "@/lib/people-order";
import { Gallery } from "@/components/site-chrome";
import ProfessorLinks from "@/components/professor-links";
export const metadata = { title: "People & Lab Life" };
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
      {pi ? (
        <section className="section pi-section">
          <div className="pi-profile">
            <div className="pi-image">
              <img src={pi.image} alt={pi.imageAlt || pi.title} />
              <span>PRINCIPAL INVESTIGATOR</span>
            </div>
            <ProfessorLinks email={pi.email} scholarUrl={settings.professorScholarUrl} cvUrl={settings.professorCvUrl} orcidUrl={pi.link} />
          </div>
          <div className="pi-copy">
            <p className="eyebrow">LABORATORY DIRECTOR</p>
            <h2>
              {pi.title}
              <span>, Ph.D.</span>
            </h2>
            <p className="pi-role">{pi.role}</p>
            <LinkedBiography text={pi.body} />
            <p>{pi.summary}</p>
            <ProfessorLinks email={pi.email} scholarUrl={settings.professorScholarUrl} cvUrl={settings.professorCvUrl} orcidUrl={pi.link} compact />
          </div>
        </section>
      ) : null}
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
          <PeopleBrowser key={requestedCategory || "All"} initialFilter={requestedCategory} people={people.filter((p) => p.id !== pi?.id)} />
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
        <Gallery photos={records.filter((r) => r.kind === "photos").sort((a, b) => compareDisplayOrder(a, b, settings.photosSortDirection))} />
      </section>
      <JoinBanner settings={settings} />
    </SiteFrame>
  );
}
