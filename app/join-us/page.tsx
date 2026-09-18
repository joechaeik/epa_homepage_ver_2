import { publicContent } from "@/lib/store";
import { SiteFrame, PageIntro } from "@/components/site-frame";
import InquiryForm from "@/components/inquiry-form";
import { ArrowUpRight, MapPin, Mail, Phone } from "lucide-react";
export const metadata = { title: "Join Us" };
export const dynamic = "force-dynamic";
export default async function JoinUs() {
  const { settings, records } = await publicContent();
  const positions = records.filter((r) => r.kind === "positions");
  return (
    <SiteFrame settings={settings}>
      <PageIntro
        eyebrow="YOUR NEXT CHAPTER"
        title="Bring your curiosity.\nBuild what comes next."
        description="Interested in photoenergy, catalysis, or environmental chemistry? Start a conversation about research at EPA Lab."
      />
      {positions.length ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">OPPORTUNITIES</p>
              <h2>Open positions</h2>
            </div>
          </div>
          <div className="position-grid">
            {positions.map((p) => (
              <article className="position-card" key={p.id}>
                <span className="tag">{p.category}</span>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                <p className="preserve-lines">{p.body}</p>
                <a className="text-link" href={p.link || "#inquiry"}>
                  Discuss this opportunity <ArrowUpRight size={17} />
                </a>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="section contact-grid" id="inquiry">
        <aside className="contact-info">
          <p className="eyebrow">LET’S CONNECT</p>
          <h2>
            Good research starts
            <br />
            with a conversation.
          </h2>
          <p>
            Contact Professor Wonyong Choi to discuss graduate study,
            postdoctoral research, visiting opportunities, or collaboration.
          </p>
          <div className="contact-line">
            <Mail size={19} />
            <a href={"mailto:" + settings.email}>{settings.email}</a>
          </div>
          <div className="contact-line">
            <Phone size={19} />
            <a href={"tel:" + settings.phone.replace(/[^+\d]/g, "")}>
              {settings.phone}
            </a>
          </div>
          <div className="contact-line">
            <MapPin size={21} />
            <p>
              {settings.institution}
              <br />
              {settings.address}
            </p>
          </div>
          <div className="contact-note">
            <h3>Before you get in touch</h3>
            <p>
              Prepare a brief introduction, a summary of your research
              interests, and your CV. Availability, admissions, and funding are
              discussed directly with the laboratory.
            </p>
          </div>
        </aside>
        <InquiryForm email={settings.email} />
      </section>
      <section className="section faq-section">
        <p className="eyebrow">A FEW THINGS TO KNOW</p>
        <h2>Frequently asked questions</h2>
        <details>
          <summary>How do I inquire about joining the laboratory?</summary>
          <p>
            Contact Professor Choi with your academic background, research
            interests, and CV. Use the form above to prepare a message in your
            own email app.
          </p>
        </details>
        <details>
          <summary>Where can I find formal admissions requirements?</summary>
          <p>
            Visit the official{" "}
            <a
              href="https://www.kentech.ac.kr/"
              target="_blank"
              rel="noreferrer"
            >
              KENTECH website
            </a>{" "}
            for current graduate admissions information. Laboratory inquiries
            are separate from the university’s application process.
          </p>
        </details>
        <details>
          <summary>Can I discuss a research collaboration?</summary>
          <p>
            Yes. Introduce your group and the research question you would like
            to explore together. Please include relevant publications or a short
            project summary.
          </p>
        </details>
      </section>
    </SiteFrame>
  );
}
