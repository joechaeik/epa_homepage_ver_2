import { notFound } from "next/navigation";
import Link from "@/components/site-link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { publicContent } from "@/lib/store";
import { SiteFrame, PublicationRow, JoinBanner } from "@/components/site-frame";

export const dynamic = "force-dynamic";

export default async function ResearchTopic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { settings, records } = await publicContent();
  const topic = records.find(record => record.kind === "research" && record.id === id);
  if (!topic) notFound();
  const relatedIds = topic.relatedPublicationIds || [];
  const related = records.filter(record => record.kind === "publications" && relatedIds.includes(record.id));
  return <SiteFrame settings={settings}>
    <article className="research-topic-page">
      <header className="section research-topic-header">
        <Link className="text-link" href="/research"><ArrowLeft size={17} /> All research</Link>
        <p className="eyebrow">EPA RESEARCH · {topic.category}</p>
        <h1>{topic.title}</h1>
        <p className="research-lead">{topic.summary}</p>
      </header>
      <div className={`section research-topic-layout${topic.image ? "" : " no-image"}`}>
        <div className="research-topic-body">
          {topic.body.split("\n\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {topic.tags ? <div className="tag-list">{topic.tags.split(",").filter(Boolean).map(tag => <span className="tag" key={tag}>{tag.trim()}</span>)}</div> : null}
        </div>
        {topic.image ? <figure className="research-topic-image"><img src={topic.image} alt={topic.imageAlt || topic.title} />{topic.imageAlt ? <figcaption>{topic.imageAlt}</figcaption> : null}</figure> : null}
      </div>
      {related.length ? <section className="section research-topic-papers">
        <div className="section-heading"><div><p className="eyebrow">SELECTED PUBLICATIONS</p><h2>Related publications</h2></div><Link className="text-link" href="/publications">All publications <ArrowUpRight size={17} /></Link></div>
        <div className="publication-list">{related.map(paper => <PublicationRow key={paper.id} entry={paper} compact />)}</div>
      </section> : null}
    </article>
    <JoinBanner settings={settings} />
  </SiteFrame>;
}
