import { publicContent } from "@/lib/store";
import HomePage from "@/components/home-page";
export const dynamic = "force-dynamic";
export default async function Home() {
  return <HomePage {...await publicContent()} />;
}
