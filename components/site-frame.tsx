import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Header, BackToTop, Citation } from "./site-chrome";
import type { Settings, PublicEntry } from "@/lib/content-model";
export function SiteFrame({
  settings,
  children,
}: {
  settings: Settings;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <footer className="footer-wrap">
        <div className="footer-grid">
          <div>
            <Link className="wordmark" href="/">
              EPA<span>LAB</span>
            </Link>
            <p>
              {settings.labFullName}
              <br />
              {settings.institution}
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/research">Research</Link>
            <Link href="/publications">Publications</Link>
            <Link href="/people">People & lab life</Link>
            <Link href="/news">News</Link>
          </div>
          <div>
            <h3>Get in touch</h3>
            <a href={"mailto:" + settings.email}>{settings.email}</a>
            <a href={"tel:" + settings.phone.replace(/[^+\d]/g, "")}>
              {settings.phone}
            </a>
            <p>{settings.address}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {settings.labName}. All rights
            reserved.
          </span>
          <div>
            <a
              href="https://epa.kentech.ac.kr/home"
              target="_blank"
              rel="noreferrer"
            >
              Previous website <ArrowUpRight size={13} />
            </a>
            <Link href="/admin">Lab administration</Link>
          </div>
        </div>
      </footer>
      <BackToTop />
    </>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="section">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title.replace(/\\n/g, "\n")}</h1>
        <p className="page-description">{description}</p>
        {children}
      </div>
    </section>
  );
}
export function JoinBanner({ settings }: { settings: Settings }) {
  return (
    <section className="join-banner section">
      <p className="eyebrow light">CURIOUS MINDS. SHARED PURPOSE.</p>
      <h2 className="preserve-lines">{settings.recruitmentTitle}</h2>
      <p>{settings.recruitmentBody}</p>
      <Link className="button mint" href="/join-us">
        Find your place at EPA Lab <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
export function PublicationRow({
  entry,
  compact = false,
}: {
  entry: PublicEntry;
  compact?: boolean;
}) {
  return (
    <article className={"publication-row " + (compact ? "compact" : "")}>
      <div className="paper-year">
        {entry.year}
        <span>RESEARCH ARTICLE</span>
      </div>
      <div className="paper-content">
        <p className="paper-journal">
          {entry.journal}
          {entry.category && entry.category !== "Journal article" ? (
            <span className="tag">{entry.category}</span>
          ) : null}
        </p>
        <h3>
          <a
            href={
              entry.doi
                ? "https://doi.org/" + entry.doi
                : entry.link || `/publications#${entry.id}`
            }
            target={entry.doi || entry.link ? "_blank" : undefined}
            rel="noreferrer"
          >
            {entry.title}
          </a>
        </h3>
        <p className="paper-authors">{entry.authors}</p>
        {!compact && entry.citation ? (
          <p className="paper-citation">{entry.citation}</p>
        ) : null}
        {!compact && entry.summary ? (
          <p className="paper-summary">{entry.summary}</p>
        ) : null}
        <div className="paper-links">
          {entry.doi ? (
            <a
              href={"https://doi.org/" + entry.doi}
              target="_blank"
              rel="noreferrer"
            >
              DOI: {entry.doi} <ArrowUpRight size={13} />
            </a>
          ) : null}
          {entry.pdf ? (
            <a href={entry.pdf} target="_blank" rel="noreferrer">
              PDF <ArrowUpRight size={13} />
            </a>
          ) : null}
          <Citation entry={entry} />
        </div>
      </div>
      <a
        aria-label={"Read " + entry.title}
        className="paper-arrow"
        href={
          entry.doi
            ? "https://doi.org/" + entry.doi
            : entry.link || "/publications"
        }
        target="_blank"
        rel="noreferrer"
      >
        <ArrowUpRight size={24} />
      </a>
    </article>
  );
}
export function EmptyContent({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-content">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
