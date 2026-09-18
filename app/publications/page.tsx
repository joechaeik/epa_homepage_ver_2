import { publicContent } from "@/lib/store";
import { SiteFrame, PageIntro } from "@/components/site-frame";
import PublicationBrowser from "@/components/publication-browser";
export const metadata = { title: "Publications" };
export const dynamic = "force-dynamic";
export default async function Publications() {
  const { settings, records } = await publicContent();
  return (
    <SiteFrame settings={settings}>
      <PageIntro
        eyebrow="OUR SCIENTIFIC CONTRIBUTIONS"
        title="Ideas, tested.\nKnowledge, shared."
        description="Explore recent peer-reviewed work from EPA Lab, connecting photoenergy, catalytic materials, and environmental chemistry."
      />
      <section className="section publication-section" id="publications">
        <PublicationBrowser
          entries={records.filter((r) => r.kind === "publications")}
        />
      </section>
    </SiteFrame>
  );
}
