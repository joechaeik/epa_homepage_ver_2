import Hero from "@/components/hero";
import { publicContent } from "@/lib/store";
import { SiteFrame, JoinBanner } from "@/components/site-frame";
import PeopleBrowser from "@/components/people-browser";
import { compareDisplayOrder, comparePeople } from "@/lib/people-order";
import { Gallery } from "@/components/site-chrome";
import { Mail, ArrowUpRight, Download } from "lucide-react";
export const metadata = { title: "People & Lab Life" };
export const dynamic = "force-dynamic";
export default async function People() {
  const { settings, records } = await publicContent();
  const people = records
    .filter((r) => r.kind === "people")
    .sort((a, b) => comparePeople(a, b, settings.peopleSortDirection));
  const pi = people.find((r) => r.category === "Principal investigator");
  return (
    <SiteFrame settings={settings}>
      <Hero settings={settings} page="people" />
      {pi ? (
        <section className="section pi-section">
          <div className="pi-image">
            <img src={pi.image} alt={pi.imageAlt || pi.title} />
            <span>PRINCIPAL INVESTIGATOR</span>
          </div>
          <div className="pi-copy">
            <p className="eyebrow">LABORATORY DIRECTOR</p>
            <h2>
              {pi.title}
              <span>, Ph.D.</span>
            </h2>
            <p className="pi-role">{pi.role}</p>
            <p>{pi.body}</p>
            <p>{pi.summary}</p>
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
        </section>
      ) : null}
      {pi ? <section className="section professor-achievements" aria-labelledby="professor-achievements-title">
        <div className="section-heading"><div><p className="eyebrow">{settings.professorAchievementsEyebrow}</p><h2 id="professor-achievements-title">{settings.professorAchievementsTitle}</h2></div><p>{settings.professorAchievementsDescription}</p></div>
        <div className="professor-achievement-grid">
          <div className="professor-achievement-column">
            <h3>{settings.professorEducationHeading}</h3>
            <ol className="professor-timeline">{settings.professorEducation.map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></li>)}</ol>
            <h3>{settings.professorCareerHeading}</h3>
            <ol className="professor-timeline">{settings.professorCareer.map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></li>)}</ol>
          </div>
          <div className="professor-achievement-column">
            <h3>{settings.professorAwardsHeading}</h3>
            <ol className="professor-timeline">{settings.professorAwards.slice(0, 7).map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong>{item.detail ? <p>{item.detail}</p> : null}</div></li>)}</ol>
            {settings.professorAwards.length > 7 ? <details className="professor-more"><summary>View more honors</summary><ol className="professor-timeline">{settings.professorAwards.slice(7).map((item, index) => <li key={`${item.period}-${index}`}><span>{item.period}</span><div><strong>{item.title}</strong>{item.detail ? <p>{item.detail}</p> : null}</div></li>)}</ol></details> : null}
          </div>
        </div>
      </section> : null}
      <section className="team-section">
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
          <PeopleBrowser people={people.filter((p) => p.id !== pi?.id)} />
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
