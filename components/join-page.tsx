import LocationMap from "@/components/location-map";
import Hero from "@/components/hero";
import { SiteFrame } from "@/components/site-frame";
import InquiryForm from "@/components/inquiry-form";
import type { Settings, PublicEntry } from "@/lib/content-model";
import { ArrowUpRight, MapPin, Mail, Phone, Check, Microscope, GraduationCap, BookOpen } from "lucide-react";

function Text({ value }: { value: string }) {
  return <>{value.split(/\r?\n\s*\r?\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</>;
}

export default function JoinPage({ settings, records }: { settings: Settings; records: PublicEntry[] }) {
  const content = settings.joinContent;
  const positions = records.filter(r => r.kind === "positions");
  const photo = content.photo || settings.pageHeroes.research.image;
  const icons = [BookOpen, Microscope, GraduationCap];
  return <SiteFrame settings={settings}>
    <Hero settings={settings} page="join" />
    <section className="section join-introduction">
      <div className="join-intro-copy"><p className="eyebrow">{content.eyebrow}</p><h2 className="preserve-lines">{content.title}</h2><Text value={content.intro} /></div>
      {photo ? <img className="join-real-photo" src={photo} alt={content.photo ? content.photoAlt : settings.pageHeroes.research.imageAlt} loading="lazy" /> : null}
    </section>
    {content.benefits.length ? <section className="section join-benefits">
      <h2>{content.benefitsTitle}</h2>
      <div className="join-benefit-grid">{content.benefits.map((card, i) => {
        const Icon = icons[i % icons.length];
        return <article key={i}><Icon size={25} strokeWidth={1.4} /><h3>{card.title}</h3><Text value={card.summary} />{card.link ? <a className="text-link" href={card.link}>{card.linkText || card.title}<ArrowUpRight size={16} /></a> : null}</article>;
      })}</div>
    </section> : null}
    <section className="section join-paths" id="graduate-guidance">
      <div className="section-heading"><div><p className="eyebrow">OPPORTUNITIES</p><h2>{content.pathsTitle}</h2><Text value={content.pathsIntro} /></div></div>
      <div className="join-path-grid">{content.paths.map((card, i) => <article className="join-path-card" key={i}>
        <span className="join-path-number">{String(i + 1).padStart(2, "0")}</span><h3>{card.title}</h3><Text value={card.summary} />
        {card.checklist ? <><h4>{content.checklistTitle}</h4><ul>{card.checklist.split(/\r?\n/).filter(line => line.trim()).map((line, j) => <li key={j}><Check size={16} /><span>{line}</span></li>)}</ul></> : null}
        {card.body ? <details><summary>{content.detailsLabel}</summary><div className="join-guidance"><Text value={card.body} /></div></details> : null}
        {card.link ? <a className="text-link" href={card.link}>{card.linkText || card.title}<ArrowUpRight size={16} /></a> : null}
      </article>)}</div>
      <p className="join-availability-note">{content.pathsNote}</p>
    </section>
    {content.englishScores.length ? <section className="section join-english" id="english-requirements">
      <div><h2>{content.englishTitle}</h2><Text value={content.englishIntro} /><p className="join-availability-note">{content.englishNote}</p>{content.englishLink ? <a className="text-link" href={content.englishLink}>{content.englishLinkText || content.englishTitle}<ArrowUpRight size={16} /></a> : null}</div>
      <table><caption className="sr-only">{content.englishTitle}</caption><thead><tr><th scope="col">{content.englishTestLabel}</th><th scope="col">{content.englishScoreLabel}</th></tr></thead><tbody>{content.englishScores.map((score, i) => <tr key={i}><th scope="row">{score.title}</th><td>{score.summary}</td></tr>)}</tbody></table>
    </section> : null}
    {content.environment.length ? <section className="section join-environment">
      <h2>{content.environmentTitle}</h2><Text value={content.environmentIntro} /><div className="join-environment-grid">{content.environment.map((card, i) => <article key={i}><Microscope size={24} strokeWidth={1.4} aria-hidden="true" /><h3>{card.title}</h3><Text value={card.summary} />{card.link ? <a className="text-link" href={card.link}>{card.linkText || card.title}<ArrowUpRight size={16} /></a> : null}</article>)}</div><p className="join-availability-note">{content.environmentNote}</p>
    </section> : null}
    {content.alumni.length ? <section className="section join-careers">
      <h2>{content.alumniTitle}</h2><Text value={content.alumniIntro} /><div className="join-career-grid">{content.alumni.map((card, i) => <article key={i}><span className="join-path-number">{String(i + 1).padStart(2, "0")}</span><h3>{card.title}</h3><Text value={card.summary} />{card.link ? <a className="text-link" href={card.link}>{card.linkText || card.title}<ArrowUpRight size={16} /></a> : null}</article>)}</div><p className="join-availability-note">{content.alumniNote}</p>
    </section> : null}
    {positions.length ? <section className="section"><h2>{content.positionsTitle}</h2><div className="position-grid">{positions.map(p => <article className="position-card" key={p.id}><span className="tag">{p.category}</span><h3>{p.title}</h3><p>{p.summary}</p><p className="preserve-lines">{p.body}</p><a className="text-link" href={p.link || "#inquiry"}>Discuss this opportunity<ArrowUpRight size={17} /></a></article>)}</div></section> : null}
    {content.steps.length ? <section className="section join-process"><h2>{content.stepsTitle}</h2><Text value={content.stepsIntro} /><ol>{content.steps.map((step, i) => <li key={i}><span className="join-step-number">{String(i + 1).padStart(2, "0")}</span><h3>{step.title}</h3><Text value={step.summary} />{step.link ? <a className="text-link" href={step.link}>{step.linkText || step.title}<ArrowUpRight size={16} /></a> : null}</li>)}</ol></section> : null}
    <section className="section contact-grid" id="inquiry">
      <aside className="contact-info"><p className="eyebrow">LET’S CONNECT</p><h2 className="preserve-lines">{content.inquiryTitle}</h2><Text value={content.inquiryIntro} />
        <div className="contact-line"><Mail size={19} /><a href={"mailto:" + settings.email}>{settings.email}</a></div>
        <div className="contact-line"><Phone size={19} /><a href={"tel:" + settings.phone.replace(/[^+\d]/g, "")}>{settings.phone}</a></div>
        <h3 className="location-label">Location</h3><div className="contact-line"><MapPin size={21} /><p>{settings.institution}<br />{settings.address}</p></div>
        <LocationMap settings={settings} />
        <div className="contact-note"><h3>{content.checklistTitle}</h3><Text value={content.inquiryNote} /></div>
      </aside><InquiryForm email={settings.email} />
    </section>
    {content.faqs.length ? <section className="section faq-section"><h2>{content.faqTitle}</h2>{content.faqs.map((faq, i) => <details key={i}><summary>{faq.title}</summary><Text value={faq.body} />{faq.link ? <a className="text-link" href={faq.link}>{faq.linkText || faq.title}<ArrowUpRight size={16} /></a> : null}</details>)}</section> : null}
  </SiteFrame>;
}
