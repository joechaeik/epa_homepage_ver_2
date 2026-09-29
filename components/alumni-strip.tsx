import type { CSSProperties } from "react";
import type { AlumniDestination } from "@/lib/content-model";

function Destination({ item, duplicate = false }: { item: AlumniDestination; duplicate?: boolean }) {
  const content = <>
    {item.logo ? <img src={item.logo} alt={item.name} loading="lazy" /> : <strong>{item.name}</strong>}
    {item.alumnus ? <span>{item.alumnus}</span> : null}
  </>;
  return item.link && !duplicate ? <a className="alumni-destination" href={item.link} target="_blank" rel="noreferrer">{content}</a>
    : <div className="alumni-destination">{content}</div>;
}

export default function AlumniStrip({ title, destinations }: { title: string; destinations: AlumniDestination[] }) {
  const items = destinations.filter(item => item.name);
  if (!items.length) return null;
  const moving = items.length > 6;
  return <section className="alumni-section" aria-label={title}>
    <div className="alumni-heading">
      <p className="eyebrow">ALUMNI PATHWAYS</p>
      <h2>{title}</h2>
      <p>Selected destinations recorded by EPA Lab alumni.</p>
    </div>
    <div className={`alumni-window${moving ? " is-moving" : ""}`}>
      <div className="alumni-track" style={{ "--alumni-duration": `${Math.max(28, items.length * 4)}s`, "--alumni-count": Math.min(6, items.length) } as CSSProperties}>
        <div className="alumni-group">{items.map((item, index) => <Destination item={item} key={`${item.name}-${index}`} />)}</div>
        {moving ? <div className="alumni-group" aria-hidden="true">{items.map((item, index) => <Destination item={item} duplicate key={`${item.name}-${index}-repeat`} />)}</div> : null}
      </div>
    </div>
  </section>;
}
