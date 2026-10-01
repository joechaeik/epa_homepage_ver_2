import Hero from "@/components/hero";
import ResearchToc from "@/components/research-toc";
import LinkedBiography from "@/components/linked-biography";
import Link from "@/components/site-link";
import type { PublicEntry, Settings } from "@/lib/content-model";
import { SiteFrame, JoinBanner } from "@/components/site-frame";
import { ArrowUpRight, ArrowDown, Sun } from "lucide-react";
const reactions: Record<string, [string, string]> = {
  Water: ["Sunlight + water", "Cleaner water + resources"],
  "Solar energy": ["Sunlight + H₂O + O₂", "H₂O₂ + solar chemicals"],
  Air: ["Light + photocatalyst", "VOC transformation"],
  Electrochemical: ["CO₂ + NO", "Selective chemical conversion"],
  "Redox chemistry": ["Water → ice", "New redox pathways"],
};
export default function ResearchPage({ settings, records, preview = false }: { settings: Settings; records: PublicEntry[]; preview?: boolean }) {
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
              <div className="research-detail-heading">
              <p className="eyebrow">{r.category}</p>
              <h2>{r.title}</h2>
              <p className="research-lead">{r.summary}</p>
              </div>
              <div className="research-detail-body">
              <LinkedBiography text={r.body} className="prose research-description" />
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
              <Link className="text-link" href={preview ? `/admin/preview?page=research&topic=${encodeURIComponent(r.id)}` : `/research/${r.id}`}>
                Explore this research <ArrowUpRight size={17} />
              </Link>
              </div>
            </div>
            <div className="research-diagram">
              {r.image ? (
                <img src={r.image} alt={r.imageAlt || r.title} />
              ) : (
                <>
                  <span className="eyebrow">RESEARCH PATHWAY</span>
                  <Sun size={32} strokeWidth={1} />
                  <strong>{(reactions[r.category] || reactions.Water)[0]}</strong>
                  <ArrowDown size={27} strokeWidth={1} />
                  <div>{(reactions[r.category] || reactions.Water)[1]}</div>
                  <small>A conceptual overview</small>
                </>
              )}
            </div>
            <ResearchToc topic={r} papers={records.filter(p => p.kind === "publications")} />
          </section>
        ))}
      </div>
      <JoinBanner settings={settings} />
    </SiteFrame>
  );
}
