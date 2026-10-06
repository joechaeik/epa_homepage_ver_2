import type { ReactNode } from "react";
import type { HeroPage, Settings } from "@/lib/content-model";
import { getHero } from "@/lib/heroes";
import HeroAchievements from "./hero-achievements";
export default function Hero({ settings, page, children, aside, footer, utility, headingLevel = "h1" }: { settings: Settings; page: HeroPage; children?: ReactNode; aside?: ReactNode; footer?: ReactNode; utility?: ReactNode; headingLevel?: "h1" | "h2" }) {
  const hero = getHero(settings, page);
  const home = page === "home";
  const evidence = aside ?? (page === "publications" ? <HeroAchievements settings={settings} /> : null);
  const Title = headingLevel;
  return <section className={`hero ${home ? "hero-home" : "hero-page"}${evidence ? " hero-with-evidence" : ""}`} aria-label={`${page} introduction`}>
    {hero.image ? <img className="hero-photo" style={{ objectPosition: `${hero.position}% ${hero.positionY}%` }} src={hero.image} alt={hero.imageAlt} fetchPriority="high" /> : null}
    <div className="hero-shade" />
    {utility}
    <div className="hero-inner">
      <div className="hero-copy">
      <p className="eyebrow light">{home ? settings.heroEyebrow : page === "lab-life" ? "BEYOND THE BENCH" : "EPA LABORATORY · KENTECH"}</p>
      <Title><span className="preserve-lines">{hero.title}</span>{home && settings.heroAccent ? <><br /><em>{settings.heroAccent}</em></> : null}</Title>
      {hero.subtitle ? <p className="hero-description">{hero.subtitle}</p> : null}
      {children}
      </div>
      {evidence}
    </div>
    {footer}
  </section>;
}
