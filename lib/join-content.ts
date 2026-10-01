import { z } from "zod";

const line = z.string().trim().max(600);
const text = z.string().trim().max(12000);
const link = z.string().trim().max(2000).refine(value => !value || value.startsWith("/") && !value.startsWith("//") || /^#[\w-]+$/.test(value) || /^https?:\/\//i.test(value), "사이트 경로, #영역 또는 http·https 주소를 입력하세요.");
const card = z.object({ title: line, summary: text, body: text, checklist: text, link, linkText: line });
const item = (title: string, summary = "", body = "", checklist = "", href = "", linkText = "") => ({ title, summary, body, checklist, link: href, linkText });

export const defaultJoinContent = {
  eyebrow: "JOIN EPA LAB",
  title: "Graduate research in photocatalysis,\nenergy, and environmental chemistry.",
  intro: "Interested in how light and catalysts can address environmental and energy challenges? Explore graduate research with Professor Wonyong Choi at KENTECH. EPA Lab welcomes inquiries from prospective graduate students, postdoctoral researchers, and undergraduate students interested in experimental research.",
  photo: "", photoAlt: "Experimental research in the EPA laboratory",
  benefitsTitle: "Graduate study at a glance",
  benefits: [
    item("Degree programs", "Master’s, integrated master’s–doctoral, and doctoral study. Your previous degree determines the program you can apply for.", "", "", "#graduate-guidance", "Find your program"),
    item("Research interests", "Photocatalysis, photoelectrochemistry, water and air treatment, solar chemicals, environmental redox reactions, and electrochemical conversion.", "", "", "/research", "View research themes"),
    item("English eligibility", "Meet one of KENTECH’s accepted English test thresholds, or qualify for an exemption under the applicable admissions rules.", "", "", "#english-requirements", "Check the requirements"),
  ],
  pathsTitle: "Find your path",
  pathsIntro: "Check the degree requirements below, or contact us about postdoctoral research and undergraduate research opportunities.",
  pathsNote: "These are inquiry guidelines, not announcements of funded vacancies. Availability, research fit, and funding are discussed individually. Formal admission follows KENTECH’s applicable admissions procedures.",
  detailsLabel: "Read the guidance",
  paths: [
    item("Graduate students", "For master’s or integrated master’s–doctoral study, applicants must hold or expect to obtain a bachelor’s degree (or an officially recognized equivalent). Doctoral applicants must hold or expect to obtain a master’s degree (or an officially recognized equivalent).", "Expected degrees must be completed by the date specified in the applicable KENTECH admissions guide. Relevant backgrounds include chemistry, chemical engineering, materials science, environmental science and engineering, and related disciplines.\n\nExplain which research theme interests you and how your background connects with our work. The following materials can help introduce your background; they are suggestions for a laboratory inquiry, not a substitute for the university’s official application requirements.", "CV\nAcademic transcript, if available\nResearch interests and motivation\nIntended degree program and start date", "https://gs.kentech.ac.kr/eng/admission/", "KENTECH graduate admissions"),
    item("Postdoctoral researchers", "Contact Professor Choi to discuss research fit, availability, and possible projects.", "Introduce your previous research, relevant experimental experience, and the questions you would like to pursue with EPA Lab. Include your CV and publication list, expected availability, and any external fellowship plans. Available positions and funding arrangements should be confirmed directly with the laboratory. The graduate English score table below is an admissions requirement for degree applicants; it is not presented as a laboratory requirement for postdoctoral researchers.", "CV and publication list\nPrevious research and proposed interests\nExpected availability\nExternal fellowship plans, if applicable", "#inquiry", "Discuss postdoctoral research"),
    item("Undergraduate research", "Interested in gaining experience in experimental photoenergy or environmental chemistry? Contact us about possible research participation.", "Introduce your current university and degree program, relevant coursework or research experience, the topic that interests you, and the period during which you would be available. Opportunities, supervision, and participation arrangements depend on the laboratory’s capacity and should be discussed individually.", "Current university and degree program\nRelevant coursework or experience\nResearch interests\nAvailable period", "#inquiry", "Discuss undergraduate research"),
  ],
  englishTitle: "English requirements for graduate admission",
  englishIntro: "Submit an accepted test result meeting at least one of the following thresholds, unless you qualify for an exemption under KENTECH’s official admissions rules.",
  englishTestLabel: "Accepted test", englishScoreLabel: "Minimum score",
  englishScores: [item("TOEFL PBT / ITP", "550"), item("TOEFL iBT", "79"), item("TOEIC", "750"), item("NEW TEPS", "285"), item("IELTS", "6.0"), item("Duolingo English Test", "115")],
  englishNote: "Test validity, accepted formats, exemptions, and deadlines follow the admissions guide for your application cycle. Confirm these details before applying. These thresholds apply to graduate degree admission.",
  englishLink: "https://gs.kentech.ac.kr/eng/admission/", englishLinkText: "Check the current KENTECH admissions guide",
  environmentTitle: "Research environment",
  environmentIntro: "EPA Lab combines laboratory experiments in chemistry, catalysis, and photochemistry with access to KENTECH’s shared research infrastructure.",
  environment: [
    item("Laboratory equipment", "GC · HPLC · ICP · FT-IR · TOC-L · Fluorescence photometer · UV spectrophotometer · Potentiostat"),
    item("KENTECH shared facilities", "XRD · Raman spectroscopy · Optical microscopy · FE-SEM · TEM · XPS"),
  ],
  environmentNote: "Equipment examples are drawn from the laboratory’s recruitment announcement. Access and training depend on the instrument and project. The announcement also describes support for conference participation and scientific publication; discuss the arrangements relevant to your research with the laboratory.",
  alumniTitle: "Where research can lead",
  alumniIntro: "Graduates of Professor Choi’s research group have pursued careers in universities, research institutes, and industry. Examples reported in the laboratory’s recruitment announcement include:",
  alumni: [
    item("Academia", "At least ten graduates have become professors in energy, environmental, and chemistry-related fields."),
    item("Research institutes", "KIST · KOPRI · KRICT · DGIST"),
    item("Overseas research", "Postdoctoral research or employment at Cambridge and Berkeley."),
    item("Industry", "Hanwha · Samsung Electronics"),
  ],
  alumniNote: "These examples cover Professor Choi’s research group across his career, including the period before KENTECH. They are past career outcomes, rather than a prediction of an individual graduate’s employment. Source: laboratory recruitment announcement, last updated 2 January 2025.",
  checklistTitle: "Prepare for your inquiry",
  stepsTitle: "How to inquire",
  stepsIntro: "A simple preparation guide to help you start a focused conversation with the laboratory.",
  steps: [
    item("Explore our research", "Find a research theme or publication that connects with your interests.", "", "", "/research", "View research themes"),
    item("Contact Professor Choi", "Introduce your background, intended program, research interests, and preferred start date. A CV and transcript can help explain your preparation.", "", "", "#inquiry", "Prepare an inquiry"),
    item("Submit a formal application", "Graduate applicants should follow KENTECH’s official admissions procedure and prepare the documents required for their application cycle.", "", "", "https://gs.kentech.ac.kr/eng/admission/", "View the admissions procedure"),
  ],
  inquiryTitle: "Good research starts\nwith a conversation.",
  inquiryIntro: "Contact Professor Wonyong Choi to discuss graduate study, postdoctoral research, or undergraduate research participation.",
  inquiryNote: "Describe a specific research question or topic that interests you, rather than sending only a general expression of interest. Recruitment availability, research fit, and funding arrangements should be discussed individually.",
  faqTitle: "A few things to know",
  faqs: [
    item("Is an inquiry a formal application?", "", "No. A laboratory inquiry starts a discussion about research fit and possible opportunities. Formal graduate admission follows the university’s admissions procedures."),
    item("Are positions or financial support guaranteed?", "", "No. Availability and support depend on the opportunity and should be discussed directly with the laboratory."),
    item("Where can I find formal admissions requirements?", "", "Check the official KENTECH graduate admissions guide for your application cycle, including required documents, accepted English tests, exemptions, and deadlines.", "", "https://gs.kentech.ac.kr/eng/admission/", "KENTECH graduate admissions"),
  ],
  positionsTitle: "Open positions",
};

export const joinContentSchema = z.object({
  eyebrow: line, title: line, intro: text, photo: link, photoAlt: line,
  benefitsTitle: line, benefits: z.array(card).max(6),
  pathsTitle: line, pathsIntro: text, pathsNote: text, detailsLabel: line,
  checklistTitle: line, paths: z.array(card).max(6),
  englishTitle: line.default(""), englishIntro: text.default(""),
  englishTestLabel: line.default("Accepted test"), englishScoreLabel: line.default("Minimum score"),
  englishScores: z.array(card).max(10).default([]), englishNote: text.default(""), englishLink: link.default(""), englishLinkText: line.default(""),
  environmentTitle: line.default(""), environmentIntro: text.default(""), environment: z.array(card).max(6).default([]), environmentNote: text.default(""),
  alumniTitle: line.default(""), alumniIntro: text.default(""), alumni: z.array(card).max(6).default([]), alumniNote: text.default(""),
  stepsTitle: line, stepsIntro: text, steps: z.array(card).max(6),
  inquiryTitle: line, inquiryIntro: text, inquiryNote: text,
  faqTitle: line, faqs: z.array(card).max(12), positionsTitle: line,
}).default(defaultJoinContent);
export type JoinContent = z.infer<typeof joinContentSchema>;
