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
  releaseDate: z.string().refine(validDate, "발행일을 확인해 주세요.").default(""),
  publicationSortBy: z.enum(["date", "releaseDate"]).default("date"),
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
  relatedPublicationIds: z.array(z.string().max(120)).max(30).default([]),
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
export const heroPages = ["home", "research", "people", "publications", "news", "join"] as const;
export type HeroPage = (typeof heroPages)[number];
export const heroLabels: Record<HeroPage, string> = { home: "Home", research: "Research", people: "People", publications: "Publications", news: "News", join: "Join Our Lab" };
export const heroSchema = z.object({
  title: z.string().trim().min(1, "히어로 제목을 입력해 주세요.").max(180),
  subtitle: z.string().max(700).default(""),
  image: url,
  imageAlt: short,
  position: z.coerce.number().min(0).max(100).default(50),
  positionY: z.coerce.number().min(0).max(100).default(50),
});
export type HeroSettings = z.infer<typeof heroSchema>;
const pageHero = (title: string, subtitle: string, image: string, imageAlt: string) =>
  heroSchema.default({ title, subtitle, image, imageAlt, position: 50, positionY: 50 });
const pageHeroesSchema = z.object({
  research: pageHero("Research", "From interfacial charge transfer to environmental transformation, we explore the chemistry that turns light into change.", "/images/main-02.jpg", "Concept illustration of photoenergy research"),
  people: pageHero("People", "Meet the researchers bringing new questions and ideas to photoenergy and environmental chemistry.", "/images/lab-6.jpg", "EPA Lab group photograph, 2025"),
  publications: pageHero("Publications", "Explore recent peer-reviewed work from EPA Lab, connecting photoenergy, catalytic materials, and environmental chemistry.", "/images/main-03.jpg", "Concept illustration of environmental chemistry"),
  news: pageHero("News", "Research developments, recognition, and moments from our laboratory community.", "/images/lab-1.jpg", "EPA Lab seminar, 2025"),
  join: pageHero("Join Our Lab", "Interested in photoenergy, catalysis, or environmental chemistry? Start a conversation about research at EPA Lab.", "/images/lab-2.jpg", "EPA Lab community, 2025"),
});
export const mapEmbedSchema = z.string().trim().max(5000).refine((value) => {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password && !u.port &&
      ["www.google.com", "maps.google.com", "www.google.co.kr"].includes(u.hostname) &&
      (u.pathname === "/maps/embed" || (u.pathname === "/maps" && u.searchParams.get("output") === "embed"));
  } catch { return false; }
}, "Google Maps의 지도 퍼가기 URL을 입력해 주세요. iframe 코드 전체가 아닌 src 주소만 사용합니다.").default("");
const careerItemSchema = z.object({
  period: z.string().trim().max(80),
  title: z.string().trim().max(300),
  detail: z.string().trim().max(600).default(""),
});
const alumniDestinationSchema = z.object({
  name: z.string().trim().max(160),
  alumnus: z.string().trim().max(160).default(""),
  logo: url,
  link: url,
});
export type CareerItem = z.infer<typeof careerItemSchema>;
export type AlumniDestination = z.infer<typeof alumniDestinationSchema>;
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
  heroPositionY: z.coerce.number().min(0).max(100).default(50),
  pageHeroes: pageHeroesSchema.default({}),
  peopleSortDirection: z.enum(["asc", "desc"]).default("asc"),
  newsSortDirection: z.enum(["asc", "desc"]).default("asc"),
  publicationsSortDirection: z.enum(["asc", "desc"]).default("asc"),
  photosSortDirection: z.enum(["asc", "desc"]).default("asc"),
  mapEmbedUrl: mapEmbedSchema,
  email: z.string().email(),
  phone: short,
  address: z.string().max(1000),
  introTitle: short,
  introBody: z.string().max(2000),
  videoUrl: url,
  introImage: url.default("/images/lab-6.jpg"),
  introImageAlt: short.default("EPA Lab group photograph, 2025"),
  homeHIndex: z.string().trim().max(20).default("132"),
  homeHIndexNote: z.string().trim().max(150).default("H-index"),
  homeHcrYears: z.string().trim().max(80).default("2019–2025"),
  homeFacilitiesUrl: url.default("https://ksrf.kentech.ac.kr/hm/equipReservation/list"),
  homeInfluenceLabel: short.default("Research influence"),
  homeHcrLabel: short.default("Wonyong Choi"),
  homeHcrNote: short.default("Highly Cited Researcher · Clarivate"),
  homePublicationsLabel: short.default("Our publications"),
  homeFacilitiesLabel: short.default("KENTECH facilities"),
  alumniEyebrow: short.default("Alumni pathways"),
  alumniShowHome: z.boolean().default(true),
  alumniShowPeople: z.boolean().default(true),
  alumniAutoplay: z.boolean().default(true),
  alumniInterval: z.coerce.number().int().min(2).max(15).default(5),
  alumniDirection: z.enum(["left", "right"]).default("right"),
  alumniHeading: short.default("Where our alumni go"),
  alumniDestinations: z.array(alumniDestinationSchema).max(30).default([
    { name: "Sookmyung Women's University", alumnus: "Wooyul Kim", logo: "", link: "https://epa.kentech.ac.kr/mboard_3_4/4211" },
    { name: "Samsung Electronics", alumnus: "Sujeong Kim", logo: "", link: "https://epa.kentech.ac.kr/mboard_3_4/4237" },
    { name: "KIST", alumnus: "Gunhee Moon", logo: "", link: "https://epa.kentech.ac.kr/mboard_3_4/4237" },
    { name: "SK Innovation", alumnus: "Taehong Seok", logo: "", link: "https://epa.kentech.ac.kr/mboard_3_4/4211" },
  ]),
  professorEducation: z.array(careerItemSchema).max(15).default([
    { period: "1996", title: "Ph.D. in Environmental Chemistry", detail: "California Institute of Technology (Caltech)" },
    { period: "1990", title: "M.S. in Physical Chemistry", detail: "Pohang University of Science and Technology (POSTECH)" },
    { period: "1988", title: "B.S. in Chemical Technology", detail: "Seoul National University" },
  ]),
  professorScholarUrl: url.default("https://scholar.google.com/citations?user=BvtyVgIAAAAJ"),
  professorCvUrl: url.default("/files/wonyong-choi-cv-2025.pdf"),
  professorAchievementsEyebrow: short.default("Wonyong Choi"),
  professorAchievementsTitle: short.default("Academic career & recognition"),
  professorAchievementsDescription: short.default("Education, research leadership, and selected honors."),
  professorEducationHeading: short.default("Education"),
  professorCareerHeading: short.default("Professional career"),
  professorAwardsHeading: short.default("Awards & honors"),
  professorCareer: z.array(careerItemSchema).max(30).default([
    { period: "2022–present", title: "Distinguished Professor & Director", detail: "Center for Environmental & Climate Technology, KENTECH" },
    { period: "1998–2022", title: "Professor", detail: "Division of Environmental Science and Engineering, POSTECH" },
    { period: "2020–present", title: "Editor-in-Chief", detail: "ACS ES&T Engineering" },
    { period: "2020–present", title: "Director, Leading Researcher Project", detail: "National Research Foundation of Korea" },
    { period: "2017–2019", title: "Associate Editor", detail: "Environmental Science & Technology" },
    { period: "2008–2017", title: "Editor", detail: "Journal of Hazardous Materials" },
    { period: "1996–1998", title: "Postdoctoral Scholar", detail: "NASA/Caltech Jet Propulsion Laboratory" },
    { period: "2020–present", title: "Editorial Advisory Panel", detail: "Nature Sustainability" },
    { period: "2008–present", title: "Editorial Advisory Board", detail: "Energy & Environmental Science" },
    { period: "2017–present", title: "Editorial Advisory Board", detail: "ACS Earth and Space Chemistry" },
    { period: "2015–2017", title: "Editorial Advisory Board", detail: "Environmental Science & Technology" },
    { period: "2009–2011", title: "Editorial Advisory Board", detail: "Journal of Physical Chemistry" },
  ]),
  professorAwards: z.array(careerItemSchema).max(60).default([
    { period: "2019–2025", title: "Highly Cited Researcher", detail: "Clarivate Analytics" },
    { period: "2024", title: "Korea Toray Science and Technology Prize", detail: "" },
    { period: "2024", title: "KENTECH Award for Research Excellence", detail: "" },
    { period: "2024", title: "International member, U.S. National Academy of Engineering", detail: "" },
    { period: "2024–2026", title: "Guest Professor", detail: "Zhejiang University, China" },
    { period: "2023", title: "Hyundai E&C Technology Contest Award", detail: "" },
    { period: "2023–2026", title: "Chair Professor", detail: "Xi’an Jiaotong University, China" },
    { period: "2023", title: "Member, National Academy of Engineering of Korea", detail: "" },
    { period: "2020", title: "Proud Postechian Award (Research)", detail: "" },
    { period: "2020", title: "Doosan Yonkang Environment Award", detail: "" },
    { period: "2019", title: "Academic Award", detail: "Korean Society of Environmental Engineers" },
    { period: "2018", title: "Korea Engineering Award", detail: "" },
    { period: "2017", title: "Environment & Energy Award", detail: "Korean Chemical Society" },
    { period: "2017–2024", title: "Invited Visiting Professor", detail: "Guangdong University of Technology, China" },
    { period: "2015", title: "KAST Science and Technology Award", detail: "" },
    { period: "2014", title: "KIST Excellent Researcher Award", detail: "" },
    { period: "2014", title: "Fellow of the Royal Society of Chemistry", detail: "" },
    { period: "2014", title: "Member, Korean Academy of Science and Technology", detail: "" },
    { period: "2012", title: "Namgo Chair Professor", detail: "POSTECH" },
    { period: "2012", title: "Pohang MBC-Samil Munhwa Special Award", detail: "" },
    { period: "2011", title: "Invited Visiting Professor", detail: "University Lille 1, France" },
    { period: "2011", title: "Rising Star Faculty Special Support Program", detail: "POSTECH" },
    { period: "2011", title: "Erudite Visiting Professor", detail: "Kerala State Higher Education Council / Mahatma Gandhi University, India" },
    { period: "2008", title: "Lectureship Award for Asian and Oceanian Photochemist", detail: "Japanese Photochemistry Association" },
    { period: "2006", title: "LG Yonam Research Fellow", detail: "" },
    { period: "2005", title: "Young Scientist Award", detail: "KAST" },
    { period: "2003", title: "Associate member, Korean Academy of Science and Technology", detail: "" },
    { period: "2001", title: "Best Paper Award", detail: "Korean Society of Industrial and Engineering Chemistry" },
    { period: "1988", title: "President of SNU Alumni Association Award for Outstanding Engineering Students", detail: "" },
  ]),
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
