import Hero from "@/components/hero";
import { publicContent } from "@/lib/store";
import { SiteFrame } from "@/components/site-frame";
import NewsBrowser from "@/components/news-browser";
export const metadata = { title: "News" };
export const dynamic = "force-dynamic";
export default async function News() {
  const { settings, records } = await publicContent();
  return (
    <SiteFrame settings={settings}>
      <Hero settings={settings} page="news" />
      <section className="section">
        <NewsBrowser entries={records.filter((r) => r.kind === "news")} />
      </section>
    </SiteFrame>
  );
}
