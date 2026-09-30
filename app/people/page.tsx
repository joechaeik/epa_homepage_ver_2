import ProfessorAchievements from "@/components/professor-achievements";
import LinkedBiography from "@/components/linked-biography";
import Hero from "@/components/hero";
import PeopleAlumni from "@/components/people-alumni";
import { publicContent } from "@/lib/store";
import { SiteFrame, JoinBanner } from "@/components/site-frame";
import PeopleBrowser from "@/components/people-browser";
import { compareDisplayOrder, comparePeople } from "@/lib/people-order";
import { Gallery } from "@/components/site-chrome";
import { Mail, ArrowUpRight, Download } from "lucide-react";
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
            <div className="pi-links">
              <a className="button outline" href={"mailto:" + pi.email}>
                <Mail size={16} />
                Contact Professor Choi
              </a>
              {settings.professorScholarUrl ? <a className="text-link" href={settings.professorScholarUrl} target="_blank" rel="noreferrer">Google Scholar <ArrowUpRight size={16} /></a> : null}
              {settings.professorCvUrl ? <a className="text-link" href={settings.professorCvUrl} target="_blank" rel="noreferrer" download={settings.professorCvUrl.startsWith("/") ? "Wonyong_Choi_CV.pdf" : undefined}>Download CV <Download size={16} /></a> : null}
              {pi.link ? (
                <a
                  className="text-link"
                  href={pi.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  ORCID profile <ArrowUpRight size={16} />
                </a>
              ) : null}
            </div>
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
