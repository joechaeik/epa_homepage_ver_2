import Hero from "@/components/hero";
import Link from "@/components/site-link";
import { publicContent } from "@/lib/store";
import { SiteFrame, JoinBanner } from "@/components/site-frame";
import { ArrowUpRight, ArrowDown, Sun } from "lucide-react";
export const metadata = { title: "Research" };
export const dynamic = "force-dynamic";
const reactions = [
  ["Sunlight + water", "Cleaner water + resources"],
  ["Sunlight + H₂O + O₂", "H₂O₂ + solar chemicals"],
  ["Light + photocatalyst", "VOC transformation"],
  ["Water → ice", "New redox pathways"],
];
export default async function Research() {
  const { settings, records } = await publicContent();
  const entries = records.filter((r) => r.kind === "research");
  return (
    <SiteFrame settings={settings}>
      <Hero settings={settings} page="research">
        <div className="anchor-nav">
          {entries.map((r, i) => (
            <a href={"#" + r.id} key={r.id}>
              {String(i + 1).padStart(2, "0")} {r.category}
              <ArrowDown size={13} />
            </a>
          ))}
        </div>
      </Hero>
      <div className="section research-details">
        {entries.map((r, i) => (
          <section key={r.id} id={r.id} className="research-detail">
            <div className="research-number">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="research-detail-content">
              <p className="eyebrow">{r.category}</p>
              <h2>{r.title}</h2>
              <p className="research-lead">{r.summary}</p>
              <div className="prose">
                {r.body.split("\n\n").map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
              <div className="tag-list">
                {r.tags
                  .split(",")
                  .filter(Boolean)
                  .map((t) => (
                    <span className="tag" key={t}>
                      {t.trim()}
                    </span>
                  ))}
              </div>
              <Link className="text-link" href="/publications">
                Related publications <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="research-diagram">
              {r.image ? (
                <img src={r.image} alt={r.imageAlt || r.title} />
              ) : (
                <>
                  <span className="eyebrow">RESEARCH PATHWAY</span>
                  <Sun size={32} strokeWidth={1} />
                  <strong>{reactions[i % 4][0]}</strong>
                  <ArrowDown size={27} strokeWidth={1} />
                  <div>{reactions[i % 4][1]}</div>
                  <small>A conceptual overview</small>
                </>
              )}
            </div>
          </section>
        ))}
      </div>
      <JoinBanner settings={settings} />
    </SiteFrame>
  );
}
