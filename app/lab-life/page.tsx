import LabLifePage from "@/components/lab-life-page";
import { publicContent } from "@/lib/store";

export const metadata = { title: "Lab life", description: "Explore photos of shared moments, seminars, and experiences at EPA Lab." };
export const dynamic = "force-dynamic";

export default async function LabLife() {
  return <LabLifePage {...await publicContent()} />;
}
