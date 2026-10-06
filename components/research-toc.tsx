import type { PublicEntry } from "@/lib/content-model";

export default function ResearchToc({ topic, papers }: { topic: PublicEntry; papers: PublicEntry[] }) {
  const selected = (topic.tocPublicationIds ?? []).filter(id => (topic.relatedPublicationIds ?? []).includes(id))
    .map(id => papers.find(paper => paper.id === id && paper.image && paper.doi)).filter((paper): paper is PublicEntry => !!paper).slice(0, 5);
  return <div className="research-toc-grid" aria-label={`${topic.title} · Selected publication figures`}>
    {Array.from({ length: 5 }, (_, index) => {
      const paper = selected[index];
      return paper ? <a className="research-toc-card" key={paper.id} href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" title={paper.title} aria-label={`${paper.title} · View publication (opens in a new tab)`}>
        <span className="research-toc-image"><img loading="lazy" src={paper.image} alt={paper.imageAlt || `TOC graphic for ${paper.title}`} /></span>
        <span className="research-toc-caption">{paper.title}</span>
      </a> : <span className="research-toc-empty" key={`empty-${index}`} aria-hidden="true" />;
    })}
  </div>;
}
