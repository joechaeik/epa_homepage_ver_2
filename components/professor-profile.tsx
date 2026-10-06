import type { PublicEntry, Settings } from "@/lib/content-model";
import LinkedBiography from "./linked-biography";
import ProfessorLinks from "./professor-links";

export default function ProfessorProfile({ professor: pi, settings }: { professor: PublicEntry; settings: Settings }) {
  const links = { email: pi.email, scholarUrl: settings.professorScholarUrl, cvUrl: settings.professorCvUrl,
    cvKorUrl: settings.professorCvKorUrl, wosUrl: settings.professorWosUrl, orcidUrl: pi.link };
  return <section className="section pi-section">
    <div className="pi-profile">
      <div className="pi-image"><img src={pi.image} alt={pi.imageAlt || pi.title} /><span>PRINCIPAL INVESTIGATOR</span></div>
      <ProfessorLinks {...links} />
    </div>
    <div className="pi-copy">
      <p className="eyebrow">LABORATORY DIRECTOR</p>
      <h2>{pi.title}<span>, Ph.D.</span></h2>
      <p className="pi-role">{pi.role}</p>
      <LinkedBiography text={pi.body} />
      <p>{pi.summary}</p>
      <ProfessorLinks {...links} compact />
    </div>
  </section>;
}
