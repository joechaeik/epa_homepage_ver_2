import AlumniStrip from "./alumni-strip";
import Link from "./site-link";
import type { Settings } from "@/lib/content-model";

export default function PeopleAlumni({ settings, preview = false }: { settings: Settings; preview?: boolean }) {
  if (!settings.alumniShowPeople || !settings.alumniDestinations.some(item => item.name.trim())) return null;
  return <div className="people-alumni">
    <AlumniStrip title={settings.alumniHeading} eyebrow={settings.alumniEyebrow} destinations={settings.alumniDestinations} autoplay={settings.alumniAutoplay} interval={settings.alumniInterval} direction={settings.alumniDirection} />
    {!preview ? <div className="people-alumni-link"><Link className="text-link light" href="/people?category=Alumni#team-members">Explore our alumni <span aria-hidden="true">→</span></Link></div> : null}
  </div>;
}
