import type { ReactNode } from "react";
import type { HeroPage, Settings } from "@/lib/content-model";
import { getHero } from "@/lib/heroes";
export default function Hero({ settings, page, children, headingLevel = "h1" }: { settings: Settings; page: HeroPage; children?: ReactNode; headingLevel?: "h1" | "h2" }) {
  const hero = getHero(settings, page);
  const home = page === "home";
  const Title = headingLevel;
  return <section className={`hero ${home ? "hero-home" : "hero-page"}`} aria-label={`${page} introduction`}>
    {hero.image ? <img className="hero-photo" style={{ objectPosition: `${hero.position}% ${hero.positionY}%` }} src={hero.image} alt={hero.imageAlt} fetchPriority="high" /> : null}
    <div className="hero-shade" />
    <div className="hero-inner">
      <p className="eyebrow light">{home ? settings.heroEyebrow : "EPA LABORATORY · KENTECH"}</p>
      <Title><span className="preserve-lines">{hero.title}</span>{home && settings.heroAccent ? <><br /><em>{settings.heroAccent}</em></> : null}</Title>
      {hero.subtitle ? <p className="hero-description">{hero.subtitle}</p> : null}
      {children}
    </div>
  </section>;
}
