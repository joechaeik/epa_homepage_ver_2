import type { Settings } from "@/lib/content-model";
import { mapSource } from "@/lib/heroes";
export default function LocationMap({ settings }: { settings: Settings }) {
  return <div className="location-map">
    <iframe title={`Google Map — ${settings.institution}`} src={mapSource(settings)} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.institution + ", " + settings.address)}`} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
  </div>;
}
