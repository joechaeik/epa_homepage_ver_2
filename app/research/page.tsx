import ResearchPage from "@/components/research-page";
import { publicContent } from "@/lib/store";

export const metadata = { title: "Research" };
export const dynamic = "force-dynamic";

export default async function Research() {
  const { settings, records } = await publicContent();
  return <ResearchPage settings={settings} records={records} />;
}
