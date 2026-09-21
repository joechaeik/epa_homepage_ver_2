import type { HeroPage, HeroSettings, Settings } from "./content-model";
export type SettingsScope = HeroPage | "site";
export const homeHeroKeys = ["heroTitle", "heroDescription", "heroImage", "heroImageAlt", "heroPosition", "heroPositionY", "heroEyebrow", "heroAccent", "heroCaption", "heroButtonText", "heroButtonLink"] as const;
export function getHero(settings: Settings, page: HeroPage): HeroSettings {
  return page === "home" ? {
    title: settings.heroTitle, subtitle: settings.heroDescription,
    image: settings.heroImage, imageAlt: settings.heroImageAlt,
    position: settings.heroPosition, positionY: settings.heroPositionY,
  } : settings.pageHeroes[page];
}
export function setHero(settings: Settings, page: HeroPage, hero: HeroSettings): Settings {
  return page === "home" ? { ...settings, heroTitle: hero.title, heroDescription: hero.subtitle,
    heroImage: hero.image, heroImageAlt: hero.imageAlt, heroPosition: hero.position, heroPositionY: hero.positionY,
  } : { ...settings, pageHeroes: { ...settings.pageHeroes, [page]: hero } };
}
// Scope saves so publishing one page never releases another page's draft.
export function mergeSettingsScope(current: Settings, incoming: Settings, scope?: SettingsScope): Settings {
  if (!scope) return incoming;
  if (scope === "site") return { ...incoming, ...Object.fromEntries(homeHeroKeys.map(key => [key, current[key]])), pageHeroes: current.pageHeroes };
  if (scope === "home") return { ...current, ...Object.fromEntries(homeHeroKeys.map(key => [key, incoming[key]])) };
  return { ...current, pageHeroes: { ...current.pageHeroes, [scope]: incoming.pageHeroes[scope] } };
}
export function mapSource(settings: Settings) {
  return settings.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(settings.institution + ", " + settings.address)}&output=embed&hl=en`;
}
