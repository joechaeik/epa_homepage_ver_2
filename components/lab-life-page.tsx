import type { PublicEntry, Settings } from "@/lib/content-model";
import { compareDisplayOrder } from "@/lib/people-order";
import { Gallery } from "@/components/site-chrome";
import { EmptyContent, JoinBanner, SiteFrame } from "@/components/site-frame";
import Hero from "@/components/hero";

export default function LabLifePage({ settings, records }: { settings: Settings; records: PublicEntry[] }) {
  const photos = records.filter(record => record.kind === "photos")
    .sort((a, b) => compareDisplayOrder(a, b, settings.photosSortDirection));
  return (
    <SiteFrame settings={settings}>
      <Hero settings={settings} page="lab-life" />
      <section className="section" id="lab-life" aria-label="Laboratory photo archive">
        {photos.length ? <Gallery photos={photos} /> : <EmptyContent title="Our photo archive" body="More moments from EPA Lab will be shared here." />}
      </section>
      <JoinBanner settings={settings} />
    </SiteFrame>
  );
}
