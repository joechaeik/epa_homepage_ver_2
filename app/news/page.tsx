import { publicContent } from "@/lib/store";
import { SiteFrame, PageIntro } from "@/components/site-frame";
import NewsBrowser from "@/components/news-browser";
export const metadata = { title: "News" };
export const dynamic = "force-dynamic";
export default async function News() {
  const { settings, records } = await publicContent();
  return (
    <SiteFrame settings={settings}>
      <PageIntro
        eyebrow="THE LATEST FROM EPA LAB"
        title="Discoveries. Milestones.\nStories worth sharing."
        description="Research developments, recognition, and moments from our laboratory community."
      />
      <section className="section">
        <NewsBrowser entries={records.filter((r) => r.kind === "news")} />
      </section>
    </SiteFrame>
  );
}
