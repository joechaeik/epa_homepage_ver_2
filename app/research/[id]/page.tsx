import { notFound } from "next/navigation";
import ResearchTopic from "@/components/research-topic";
import { publicContent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Topic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { settings, records } = await publicContent();
  const topic = records.find(record => record.kind === "research" && record.id === id);
  if (!topic) notFound();
  return <ResearchTopic settings={settings} records={records} topic={topic} />;
}
