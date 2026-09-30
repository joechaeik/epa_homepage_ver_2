import JoinPage from "@/components/join-page";
import { publicContent } from "@/lib/store";
export const metadata = { title: "Join Our Lab" };
export const dynamic = "force-dynamic";
export default async function JoinUs() {
  const { settings, records } = await publicContent();
  return <JoinPage settings={settings} records={records} />;
}
