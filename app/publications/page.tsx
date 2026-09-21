import Hero from "@/components/hero";
import { publicContent } from "@/lib/store";
import { SiteFrame } from "@/components/site-frame";
import PublicationBrowser from "@/components/publication-browser";
export const metadata = { title: "Publications" };
export const dynamic = "force-dynamic";
export default async function Publications() {
  const { settings, records } = await publicContent();
  return (
    <SiteFrame settings={settings}>
      <Hero settings={settings} page="publications" />
      <section className="section publication-section" id="publications">
        <PublicationBrowser
          entries={records.filter((r) => r.kind === "publications")}
        />
      </section>
    </SiteFrame>
  );
}
