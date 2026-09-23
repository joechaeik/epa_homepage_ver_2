import type { MediaItem, RecordItem, SettingsItem } from "./content-model";

export const mediaCategories = [
  { id: "all", label: "전체" },
  { id: "hero", label: "Hero" },
  { id: "publications", label: "논문" },
  { id: "news", label: "뉴스" },
  { id: "people", label: "구성원" },
  { id: "research", label: "연구 분야" },
  { id: "photos", label: "연구실 사진" },
  { id: "other", label: "기타·미사용" },
] as const;
export type MediaCategory = (typeof mediaCategories)[number]["id"];

function containsUrl(value: unknown, url: string): boolean {
  if (typeof value === "string") return value === url;
  if (Array.isArray(value)) return value.some((item) => containsUrl(item, url));
  if (value && typeof value === "object")
    return Object.values(value).some((item) => containsUrl(item, url));
  return false;
}

export function mediaUsage(
  media: Pick<MediaItem, "url">,
  records: RecordItem[],
  settings: SettingsItem,
): MediaCategory[] {
  const used = new Set<MediaCategory>();
  for (const setting of [settings.draft, settings.published]) {
    if (
      setting.heroImage === media.url ||
      Object.values(setting.pageHeroes).some((hero) => hero.image === media.url)
    ) used.add("hero");
    if (setting.introImage === media.url) used.add("other");
    if (containsUrl(setting, media.url) && !used.has("hero") && !used.has("other"))
      used.add("other");
  }
  for (const record of records) {
    if (containsUrl(record.draft, media.url) || containsUrl(record.published, media.url)) {
      used.add(record.kind === "positions" ? "other" : record.kind);
    }
  }
  if (used.size === 0) used.add("other");
  return [...used];
}

export function mediaIsUsed(media: Pick<MediaItem, "url">, records: RecordItem[], settings: SettingsItem) {
  return [settings.draft, settings.published, ...records.flatMap((record) => [record.draft, record.published])]
    .some((value) => containsUrl(value, media.url));
}
