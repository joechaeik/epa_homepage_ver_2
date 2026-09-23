import Hero from "./hero";
import { comparePublications } from "@/lib/publication-order";
import Link from "@/components/site-link";
import {
  ArrowRight,
  ArrowUpRight,
  Droplets,
  Sun,
  Wind,
  Snowflake,
  Play,
} from "lucide-react";
import { SiteFrame, JoinBanner, PublicationRow } from "./site-frame";
import { Gallery } from "./site-chrome";
import {
  dateLabel,
  type Settings,
  type PublicEntry,
} from "@/lib/content-model";
const icons = [Droplets, Sun, Wind, Snowflake];
export default function HomePage({
  settings,
  records,
}: {
  settings: Settings;
  records: PublicEntry[];
}) {
  const research = records.filter((r) => r.kind === "research");
  const papers = records
    .filter((r) => r.kind === "publications")
    .sort(comparePublications)
    .slice(0, 3);
  const news = records
    .filter((r) => r.kind === "news")
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date),
    )
    .slice(0, 3);
  const photos = records
    .filter((r) => r.kind === "photos" && r.featured)
    .slice(0, 3);
  return (
    <SiteFrame settings={settings}>
      <Hero settings={settings} page="home">
          <div className="hero-actions">
            <a
              className="button mint"
              href={settings.heroButtonLink || "/research"}
            >
              {settings.heroButtonText} <ArrowUpRight size={18} />
            </a>
            <Link className="text-link light" href="/publications">
              Our publications <ArrowRight size={18} />
            </Link>
          </div>
      </Hero>
      <div className="research-ribbon">
        <span>LIGHT-DRIVEN DISCOVERY</span>
        <span>Water & resources</span>
        <i />
        <span>Solar chemistry</span>
        <i />
        <span>Cleaner air</span>
        <i />
        <span>Environmental redox</span>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR RESEARCH</p>
            <h2>
              One source of energy.
              <br />A world of possibilities.
            </h2>
          </div>
          <p>
            We study how light and catalysts work together—connecting
            fundamental chemistry with environmental solutions.
          </p>
        </div>
        <div className="research-grid">
          {research.map((track, i) => {
            const Icon = icons[i % 4];
            return (
              <a
                href={`/research#${track.id}`}
                className="research-card"
                key={track.id}
              >
                <div className="card-top">
                  <Icon size={25} />
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3>{track.title}</h3>
                <p>{track.summary}</p>
                <div className="card-link">
                  Discover this research <ArrowUpRight size={18} />
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <section className="lab-story">
        <div className="section story-grid">
          <div className="story-image">
            {settings.introImage ? (
              <img
                src={settings.introImage}
                alt={settings.introImageAlt}
                loading="lazy"
              />
            ) : null}
            <span>{settings.introImageAlt || "OUR PEOPLE. OUR PURPOSE."}</span>
          </div>
          <div className="story-copy">
            <p className="eyebrow">A CLOSER LOOK</p>
            <h2 className="preserve-lines">{settings.introTitle}</h2>
            <p>{settings.introBody}</p>
            <div className="story-actions">
              <Link className="text-link" href="/people">
                Meet our people <ArrowUpRight size={18} />
              </Link>
              {settings.videoUrl ? (
                <a
                  className="video-link"
                  href={settings.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    <Play size={15} fill="currentColor" />
                  </span>
                  Watch the lab story
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">KNOWLEDGE IN THE MAKING</p>
            <h2>Recent publications</h2>
          </div>
          <Link className="text-link" href="/publications">
            Explore publications <ArrowRight size={18} />
          </Link>
        </div>
        <div className="publication-list">
          {papers.map((p) => (
            <PublicationRow key={p.id} entry={p} compact />
          ))}
        </div>
      </section>
      <section className="news-section">
        <div className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FROM THE LAB</p>
              <h2>News</h2>
            </div>
            <Link className="text-link" href="/news">
              All updates <ArrowRight size={18} />
            </Link>
          </div>
          <div className="news-grid">
            {news.map((n) => (
              <a className="news-card" key={n.id} href={"/news/" + n.id}>
                <div className="news-meta">
                  <span>{n.category}</span>
                  <time dateTime={n.date}>{dateLabel(n.date)}</time>
                </div>
                <h3>{n.title}</h3>
                <p>{n.summary}</p>
                <span className="card-link">
                  Read story <ArrowUpRight size={18} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BEYOND THE BENCH</p>
            <h2>Lab Life</h2>
          </div>
          <p>
            The conversations, shared experiences, and people behind our
            science.
          </p>
        </div>
        <Gallery photos={photos} />
      </section>
      <JoinBanner settings={settings} />
    </SiteFrame>
  );
}
