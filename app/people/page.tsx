import { publicContent } from "@/lib/store";
import { SiteFrame, PageIntro, JoinBanner } from "@/components/site-frame";
import PeopleBrowser from "@/components/people-browser";
import { Gallery } from "@/components/site-chrome";
import { Mail, ArrowUpRight } from "lucide-react";
export const metadata = { title: "People & Lab Life" };
export const dynamic = "force-dynamic";
export default async function People() {
  const { settings, records } = await publicContent();
  const people = records.filter((r) => r.kind === "people");
  const pi = people.find((r) => r.category === "Principal investigator");
  return (
    <SiteFrame settings={settings}>
      <PageIntro
        eyebrow="THE PEOPLE BEHIND THE SCIENCE"
        title="Different perspectives.\nA shared curiosity."
        description="Meet the researchers bringing new questions and ideas to photoenergy and environmental chemistry."
      />
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
        <Gallery photos={records.filter((r) => r.kind === "photos")} />
      </section>
      <JoinBanner settings={settings} />
    </SiteFrame>
  );
}
