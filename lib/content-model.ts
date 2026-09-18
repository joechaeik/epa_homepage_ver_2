import { z } from "zod";

export const kinds = [
  "publications",
  "news",
  "people",
  "research",
  "photos",
  "positions",
] as const;
export type Kind = (typeof kinds)[number];
export const kindLabels: Record<Kind, string> = {
  publications: "논문",
  news: "뉴스",
  people: "구성원",
  research: "연구 분야",
  photos: "연구실 사진",
  positions: "모집 안내",
};
const short = z.string().trim().max(500).default("");
const url = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => {
    if (!v) return true;
    if (/^\/(?!\/)[a-zA-Z0-9/_?=.#%&-]*$/.test(v)) return true;
    try {
      const parsed = new URL(v);
      return (
        parsed.protocol === "https:" &&
        !!parsed.hostname &&
        !parsed.username &&
        !parsed.password &&
        !/[\s<>"\\]/.test(v)
      );
    } catch {
      return false;
    }
  }, "사이트 내부 경로나 https 주소를 입력해 주세요.")
  .default("");
function validDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export const entrySchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요.").max(500),
  summary: z.string().trim().max(3000).default(""),
  body: z.string().trim().max(30000).default(""),
  category: short,
  date: z.string().refine(validDate, "날짜를 확인해 주세요.").default(""),
  year: z.coerce.number().int().min(1900).max(2100).default(2026),
  authors: z.string().trim().max(2500).default(""),
  journal: short,
  citation: short,
  doi: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => !v || /^10\.\d{4,9}\/[^\s<>]+$/.test(v),
      "DOI 형식을 확인해 주세요.",
    )
    .default(""),
  image: url,
  imageAlt: short,
  pdf: url,
  link: url,
  source: url,
  email: z.union([z.literal(""), z.string().email()]).default(""),
  role: short,
  tags: z.string().max(500).default(""),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
});
export type Entry = z.infer<typeof entrySchema>;
export function entryProblem(kind: Kind, data: Entry): string | null {
  if (kind === "publications" && (!data.authors || !data.journal))
    return "저자와 학술지를 입력해 주세요.";
  if (kind === "photos" && (!data.image || !data.imageAlt))
    return "사진과 사진 설명을 입력해 주세요.";
  if (kind === "news" && !data.date) return "소식 날짜를 입력해 주세요.";
  return null;
}
export type RecordItem = {
  id: string;
  kind: Kind;
  draft: Entry;
  published: Entry | null;
  archived: boolean;
  version: number;
  updatedAt: string;
};
export type PublicEntry = Entry & { id: string; kind: Kind };
export const settingsSchema = z.object({
  labName: z.string().trim().min(1).max(200),
  labFullName: short,
  institution: short,
  heroEyebrow: short,
  heroTitle: z.string().trim().min(1).max(180),
  heroAccent: short,
  heroDescription: z.string().max(700),
  heroImage: url,
  heroImageAlt: short,
  heroCaption: short,
  heroButtonText: short,
  heroButtonLink: url,
  heroPosition: z.coerce.number().min(0).max(100),
  email: z.string().email(),
  phone: short,
  address: z.string().max(1000),
  introTitle: short,
  introBody: z.string().max(2000),
  videoUrl: url,
  introImage: url.default("/images/lab-6.jpg"),
  introImageAlt: short.default("EPA Lab group photograph, 2025"),
  recruitmentTitle: short,
  recruitmentBody: z.string().max(2000),
});
export type Settings = z.infer<typeof settingsSchema>;
export type SettingsItem = {
  draft: Settings;
  published: Settings;
  version: number;
  updatedAt: string;
};
export type MediaItem = {
  id: string;
  name: string;
  mime: string;
  size: number;
  alt: string;
  createdAt: string;
  url: string;
};
export function dateLabel(value: string) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value + "T00:00:00Z"))
    : "";
}
export function publicationBibtex(p: Entry) {
  const safe = (s: string) => s.replace(/[{}\\]/g, "");
  return `@article{epa${p.year}${p.title.replace(/[^a-zA-Z]/g, "").slice(0, 20)},\n  title = {${safe(p.title)}},\n  author = {${safe(p.authors).replace(/, /g, " and ")}},\n  journal = {${safe(p.journal)}},\n  year = {${p.year}},\n  doi = {${safe(p.doi)}}\n}`;
}
