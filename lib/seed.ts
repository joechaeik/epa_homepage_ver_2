import imported from "@/source-data/imported-records.json";
import { entrySchema, settingsSchema, type Kind } from "./content-model";

export const defaultSettings = settingsSchema.parse({
  labName: "EPA Lab",
  labFullName: "Eco-friendly Photoenergy Application Laboratory",
  institution: "Korea Institute of Energy Technology",
  heroEyebrow: "EPA LABORATORY · KENTECH",
  heroTitle: "Engineering light.\nReimagining",
  heroAccent: "our tomorrow.",
  heroDescription:
    "Exploring the chemistry of light to advance clean energy and a healthier environment.",
  heroImage: "/images/main-01.jpg",
  heroImageAlt:
    "Concept illustration of a photochemistry laboratory from the supplied design",
  heroCaption: "PHOTOENERGY RESEARCH · CONCEPT IMAGE",
  heroButtonText: "Explore our research",
  heroButtonLink: "/research",
  heroPosition: 50,
  email: "wchoi@kentech.ac.kr",
  phone: "+82-61-320-9237",
  address: "21 Kentech-gil, Naju, Jeonnam 58330, Republic of Korea",
  introTitle: "Where light meets\na sustainable question.",
  introBody:
    "At EPA Lab, we investigate the reactions that connect sunlight, materials, and the environment. Our work spans photoelectrochemical water treatment, solar chemicals, air purification, and redox chemistry in ice.",
  videoUrl: "https://www.youtube.com/watch?v=ml-G6XyS9Yo",
  recruitmentTitle: "Your next question\ncould change what’s next.",
  recruitmentBody:
    "Interested in photoenergy and environmental chemistry? Tell us about your background and the questions you want to explore.",
});
const extra: { id: string; kind: Kind; data: unknown }[] = [
  {
    id: "research-water",
    kind: "research",
    data: {
      title: "Water treatment & resource recovery",
      category: "Water",
      summary: "Connecting cleaner water with energy and resource recovery.",
      body: "Photoelectrochemical reactions can couple the removal of water pollutants with the recovery of useful resources. We investigate semiconductor interfaces and redox pathways to understand how these processes can work together.\n\nOur research examines light-driven oxidation and reduction for environmental remediation, hydrogen production, hydrogen peroxide generation, and metal recovery.",
      tags: "Photoelectrochemistry,Water treatment,Resource recovery",
      sortOrder: 1,
      source: "https://epa.kentech.ac.kr/home",
    },
  },
  {
    id: "research-solar",
    kind: "research",
    data: {
      title: "Solar fuels & hydrogen peroxide",
      category: "Solar energy",
      summary: "Using sunlight to produce clean fuels and useful chemicals.",
      body: "Hydrogen peroxide is an environmentally compatible oxidant and a carbon-free energy carrier. Our laboratory studies photocatalytic and photoelectrochemical pathways that use sunlight, water, and oxygen.\n\nWe investigate charge transfer and surface chemistry to connect fundamental reaction mechanisms with sustainable chemical production.",
      tags: "Artificial photosynthesis,H₂O₂,Solar chemistry",
      sortOrder: 2,
      source: "https://epa.kentech.ac.kr/home",
    },
  },
  {
    id: "research-air",
    kind: "research",
    data: {
      title: "Photocatalytic air purification",
      category: "Air",
      summary: "Understanding catalytic pathways for a healthier atmosphere.",
      body: "Photocatalysis offers a route to remove volatile organic compounds at ambient temperature and pressure. Our work explores how light-activated materials break down low-concentration pollutants.\n\nWe study surface reactions and mobile reactive species to understand pollutant conversion and improve environmental applications.",
      tags: "Photocatalysis,VOCs,Reactive oxygen species",
      sortOrder: 3,
      source: "https://epa.kentech.ac.kr/home",
    },
  },
  {
    id: "research-ice",
    kind: "research",
    data: {
      title: "Advanced redox & ice chemistry",
      category: "Redox chemistry",
      summary: "Exploring environmental reactions in water and frozen systems.",
      body: "Advanced redox processes produce reactive species that help transform persistent pollutants. We investigate photochemical, catalytic, and electrochemical routes for these reactions.\n\nFreezing can change reaction environments in unexpected ways. Our research explores chemical transformations in ice and their implications for environmental processes in the atmosphere, surface waters, and polar regions.",
      tags: "Advanced oxidation,Environmental redox,Ice chemistry",
      sortOrder: 4,
      source: "https://epa.kentech.ac.kr/home",
    },
  },
  {
    id: "news-co2",
    kind: "news",
    data: {
      title: "Connecting dilute CO₂ capture with electrochemical conversion",
      date: "2026-02-03",
      category: "Research",
      summary:
        "An electrode approach brings carbon capture and conversion into a single process.",
      body: "EPA Lab’s research news highlights an electrode technology that integrates capture and conversion of dilute carbon dioxide. Read the original announcement for the research context and collaborators.",
      source: "https://epa.kentech.ac.kr/board_2_1/5333",
      link: "https://epa.kentech.ac.kr/board_2_1/5333",
      featured: true,
    },
  },
  {
    id: "news-hcr",
    kind: "news",
    data: {
      title: "Wonyong Choi named a Highly Cited Researcher 2025",
      date: "2025-11-18",
      category: "Awards",
      summary:
        "Clarivate recognizes Professor Choi’s contributions to photoenergy applications and photocatalysis.",
      body: "Professor Wonyong Choi has been included in Clarivate’s 2025 Highly Cited Researchers list. The laboratory shared the recognition in its November announcement.\n\nThe distinction recognizes researchers whose work has had significant citation influence within their fields.",
      image: "/images/wonyong-choi.jpg",
      imageAlt: "Professor Wonyong Choi",
      source: "https://epa.kentech.ac.kr/board_2_1/5238",
      featured: true,
    },
  },
  {
    id: "news-toray",
    kind: "news",
    data: {
      title: "Korea Toray Science & Technology Award recognizes Professor Choi",
      date: "2024-09-04",
      category: "Awards",
      summary:
        "Recognition for contributions to environmentally functional photocatalytic materials.",
      body: "Professor Wonyong Choi was named a recipient of the seventh Korea Toray Science & Technology Award. The announcement recognizes his contributions to environmental photocatalytic materials.",
      source: "https://epa.kentech.ac.kr/board_2_1/5097",
      featured: true,
    },
  },
  {
    id: "news-nae",
    kind: "news",
    data: {
      title: "Professor Choi elected to the US National Academy of Engineering",
      date: "2024-02-07",
      category: "Awards",
      summary:
        "An international distinction in engineering research and practice.",
      body: "The laboratory announced Professor Choi’s election as an international member of the US National Academy of Engineering. The original notice includes the academy’s announcement and class of 2024 information.",
      source: "https://epa.kentech.ac.kr/board_2_1/5054",
    },
  },
];
export const seedRecords = [...imported, ...extra].map((r) => ({
  id: r.id,
  kind: r.kind as Kind,
  data: entrySchema.parse(r.data),
}));
