import { z } from "zod";

const line = z.string().trim().max(600);
const text = z.string().trim().max(12000);
const link = z.string().trim().max(2000).refine(value => !value || value.startsWith("/") && !value.startsWith("//") || /^#[\w-]+$/.test(value) || /^https?:\/\//i.test(value), "사이트 경로, #영역 또는 http·https 주소를 입력하세요.");
const card = z.object({ title: line, summary: text, body: text, checklist: text, link, linkText: line });
const item = (title: string, summary = "", body = "", checklist = "", href = "", linkText = "") => ({ title, summary, body, checklist, link: href, linkText });

export const defaultJoinContent = {
  eyebrow: "JOIN EPA LAB",
  title: "Understand the chemistry.\nDevelop solutions for a sustainable environment.",
  intro: "EPA Lab at KENTECH welcomes inquiries from prospective graduate students and postdoctoral researchers interested in environmental chemistry, photocatalysis, and energy conversion. We value curiosity, careful experimentation, critical thinking, and collaborative research.",
  photo: "", photoAlt: "Experimental research in the EPA laboratory",
  benefitsTitle: "Why EPA Lab?",
  benefits: [
    item("Research-led learning", "Connect fundamental reaction chemistry with environmental and energy questions under Professor Wonyong Choi’s research leadership.", "", "", "/people", "Meet Professor Choi"),
    item("KENTECH research environment", "Explore experimental research in photoenergy and environmental chemistry at KENTECH. Discuss the facilities relevant to your proposed work with the laboratory.", "", "", "/research", "Explore our research"),
    item("Alumni pathways", "Discover the research and career paths of EPA alumni in universities, research institutes, and industry.", "", "", "/people?category=Alumni#team-members", "Explore our alumni"),
  ],
  pathsTitle: "Find your path",
  pathsIntro: "Choose the research stage that fits your background and explore how to prepare an inquiry.",
  pathsNote: "These are inquiry guidelines, not announcements of funded vacancies. Availability, research fit, and funding are discussed individually. Formal admission follows KENTECH’s applicable admissions procedures.",
  detailsLabel: "Read the guidance",
  paths: [
    item("Graduate students", "For prospective students interested in developing a strong foundation in environmental and energy chemistry.", "Relevant backgrounds include chemistry, chemical engineering, materials science, environmental science and engineering, and related disciplines. Experience in photocatalysis, electrochemistry, spectroscopy, materials characterization, or analytical chemistry would be valuable. Applicants do not need expertise in every area; a sound scientific foundation and willingness to learn are important.\n\nExplain your research interests, why you would like to join EPA Lab, and how your background relates to our work. Explore our research themes and publications before contacting us.", "CV\nAcademic transcript\nResearch interests and motivation\nIntended degree program and start date", "#inquiry", "Discuss graduate research"),
    item("Postdoctoral researchers", "For researchers ready to develop scientific questions independently and contribute to collaborative projects.", "Prospective postdoctoral researchers should demonstrate relevant research experience, the ability to develop and pursue scientific questions independently, and an interest in contributing to collaborative projects. Describe your previous research, the topics you would like to pursue, and how these connect with EPA Lab’s work. Any external fellowship plans may also be included.", "CV and publication list\nPrevious research and proposed interests\nExpected availability\nExternal fellowship plans, if applicable", "#inquiry", "Discuss postdoctoral research"),
  ],
  checklistTitle: "Prepare for your inquiry",
  stepsTitle: "How to inquire",
  stepsIntro: "A simple preparation guide to help you start a focused conversation with the laboratory.",
  steps: [
    item("Explore our research", "Find a research theme or publication that connects with your interests.", "", "", "/research", "View research themes"),
    item("Prepare your materials", "Bring together your CV, research interests, and the documents relevant to your research stage."),
    item("Start a conversation", "Introduce your background, a specific research question, and your intended start date.", "", "", "#inquiry", "Prepare an inquiry"),
  ],
  inquiryTitle: "Good research starts\nwith a conversation.",
  inquiryIntro: "Contact Professor Wonyong Choi to discuss graduate study, postdoctoral research, visiting opportunities, or collaboration.",
  inquiryNote: "Describe a specific research question or topic that interests you, rather than sending only a general expression of interest. Recruitment availability, research fit, and funding arrangements should be discussed individually.",
  faqTitle: "A few things to know",
  faqs: [
    item("Is an inquiry a formal application?", "", "No. A laboratory inquiry starts a discussion about research fit and possible opportunities. Formal graduate admission follows the university’s admissions procedures."),
    item("Are positions or financial support guaranteed?", "", "No. Availability and support depend on the opportunity and should be discussed directly with the laboratory."),
    item("Where can I find formal admissions requirements?", "", "Check KENTECH’s official website for current admissions information.", "", "https://www.kentech.ac.kr/", "Visit KENTECH"),
  ],
  positionsTitle: "Open positions",
};

export const joinContentSchema = z.object({
  eyebrow: line, title: line, intro: text, photo: link, photoAlt: line,
  benefitsTitle: line, benefits: z.array(card).max(6),
  pathsTitle: line, pathsIntro: text, pathsNote: text, detailsLabel: line,
  checklistTitle: line, paths: z.array(card).max(6),
  stepsTitle: line, stepsIntro: text, steps: z.array(card).max(6),
  inquiryTitle: line, inquiryIntro: text, inquiryNote: text,
  faqTitle: line, faqs: z.array(card).max(12), positionsTitle: line,
}).default(defaultJoinContent);
export type JoinContent = z.infer<typeof joinContentSchema>;
