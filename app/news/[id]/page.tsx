import Link from "next/link";
import { notFound } from "next/navigation";
import { publicContent } from "@/lib/store";
import { SiteFrame } from "@/components/site-frame";
import { dateLabel } from "@/lib/content-model";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { records } = await publicContent();
  const entry = records.find((r) => r.kind === "news" && r.id === id);
  return { title: entry?.title || "News", description: entry?.summary };
}
export default async function NewsDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { settings, records } = await publicContent();
  const entry = records.find((r) => r.kind === "news" && r.id === id);
  if (!entry) notFound();
  return (
    <SiteFrame settings={settings}>
      <article className="section article-page">
        <Link className="text-link" href="/news">
          <ArrowLeft size={16} />
          All updates
        </Link>
        <div className="article-meta">
          <span className="tag">{entry.category}</span>
          <time dateTime={entry.date}>{dateLabel(entry.date)}</time>
        </div>
        <h1>{entry.title}</h1>
        <p className="article-summary">{entry.summary}</p>
        {entry.image ? (
          <figure>
            <img src={entry.image} alt={entry.imageAlt || entry.title} />
            {entry.imageAlt ? <figcaption>{entry.imageAlt}</figcaption> : null}
          </figure>
        ) : null}
        <div className="prose">
          {entry.body.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {entry.link || entry.source ? (
          <a
            className="button outline"
            href={entry.link || entry.source}
            target="_blank"
            rel="noreferrer"
          >
            Read the original announcement <ArrowUpRight size={16} />
          </a>
        ) : null}
      </article>
    </SiteFrame>
  );
}
