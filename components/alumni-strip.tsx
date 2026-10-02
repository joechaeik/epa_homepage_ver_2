"use client";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, GraduationCap, Pause, Play } from "lucide-react";
import type { AlumniDestination } from "@/lib/content-model";
import { alumniLogoPresentations } from "@/lib/alumni-logo-presentation";

function AlumniLogo({ src }: { src: string }) {
  const presentation = alumniLogoPresentations[src];
  if (!src) return <span className="alumni-mark"><GraduationCap size={23} /></span>;
  if (!presentation) return <span className={`alumni-mark has-logo${src === "/images/kentech-emblem.svg" ? " is-circular-logo" : ""}`}><img src={src} alt="" /></span>;
  const crop = presentation.crop;
  let windowStyle: CSSProperties | undefined;
  let imageStyle: CSSProperties | undefined;
  if (crop) {
    const [sourceWidth, sourceHeight, x, y, width, height] = crop;
    const side = Math.max(width, height);
    windowStyle = { width: `${90 * width / side}%`, height: `${90 * height / side}%`, clipPath: presentation.clip };
    imageStyle = { width: `${100 * sourceWidth / width}%`, height: `${100 * sourceHeight / height}%`, left: `${-100 * x / width}%`, top: `${-100 * y / height}%` };
  }
  return <span className={`alumni-mark has-logo is-prepared-logo${presentation.white ? " is-white-logo" : ""}${presentation.dark ? " is-dark-logo" : ""}`}>
    {crop ? <span className="alumni-logo-window" style={windowStyle}><img src={src} alt="" style={imageStyle} /></span> : <img src={src} alt="" />}
  </span>;
}

type Props = { title: string; eyebrow: string; destinations: AlumniDestination[]; autoplay: boolean; interval: number; direction: "left" | "right" };

export default function AlumniStrip(props: Props) {
  const items = props.destinations.filter(item => item.name.trim());
  if (!items.length) return null;
  return <AlumniCarousel key={JSON.stringify([items, props.autoplay, props.interval, props.direction])} {...props} destinations={items} />;
}

function AlumniCarousel({ title, eyebrow, destinations: items, autoplay, interval, direction }: Props) {
  const id = useId();
  const count = items.length;
  const [capacity, setCapacity] = useState(6);
  const visible = capacity === 6 && count > 1 ? 6 : Math.min(capacity, count);
  const [position, setPosition] = useState({ index: count, animate: false });
  const displayIndex = position.index - (capacity === 6 && count > 1 ? 1 : 0);
  const copies = Math.max(3, Math.ceil(visible / count) + 2);
  const [paused, setPaused] = useState(!autoplay);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const locked = useRef(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const narrow = matchMedia("(max-width: 600px)");
    const tablet = matchMedia("(max-width: 1050px)");
    const fold = matchMedia("(max-width: 360px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setCapacity(fold.matches ? 1 : narrow.matches ? 2 : tablet.matches ? 3 : 6);
      setReduced(motion.matches);
      locked.current = false;
      setPosition(p => ({ index: count + ((p.index % count) + count) % count, animate: false }));
    };
    const visibility = () => setHidden(document.hidden);
    update(); visibility();
    for (const q of [narrow, tablet, fold, motion]) q.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      for (const q of [narrow, tablet, fold, motion]) q.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [count]);

  function move(direction: number) {
    if (count < 2 || locked.current) return;
    locked.current = !reduced;
    setPosition(p => ({ index: reduced ? count + ((p.index + direction) % count + count) % count : p.index + direction, animate: !reduced }));
  }

  useEffect(() => {
    if (paused || hovered || focused || hidden || reduced || count < 2) return;
    const timer = setInterval(() => {
      if (locked.current) return;
      locked.current = true;
      setPosition(p => ({ index: p.index + (direction === "right" ? -1 : 1), animate: true }));
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [paused, hovered, focused, hidden, reduced, count, interval, direction]);

  function finish() {
    locked.current = false;
    setPosition(p => p.index >= count * 2 || p.index < count
      ? { index: count + ((p.index % count) + count) % count, animate: false } : p);
  }

  return <section className="alumni-section" aria-label={eyebrow || title} aria-roledescription="carousel"
    style={{ "--alumni-visible": visible } as CSSProperties}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
    <div className="alumni-heading">
      <div><p className="eyebrow">{eyebrow}</p><p className="alumni-title">{title}</p></div>
      <div className="alumni-controls">
        <button type="button" aria-label="Previous alumni destination" aria-controls={id} onClick={() => move(-1)} disabled={count < 2}><ChevronLeft size={17} /></button>
        <button type="button" aria-label={paused || reduced ? "Play alumni carousel" : "Pause alumni carousel"} aria-pressed={paused || reduced} onClick={() => setPaused(p => !p)} disabled={count < 2 || reduced}>{paused || reduced ? <Play size={13} /> : <Pause size={13} />}</button>
        <button type="button" aria-label="Next alumni destination" aria-controls={id} onClick={() => move(1)} disabled={count < 2}><ChevronRight size={17} /></button>
      </div>
    </div>
    <div className="alumni-window" id={id} aria-live="off"
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (touchX.current !== null) { const delta = e.changedTouches[0].clientX - touchX.current; if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1); } touchX.current = null; }}>
      <div className={`alumni-track${position.animate ? " is-animating" : ""}`}
        style={{ "--alumni-visible": visible, transform: `translateX(${-displayIndex * 100 / visible}%)` } as CSSProperties}
        onTransitionEnd={e => { if (e.target === e.currentTarget && e.propertyName === "transform") finish(); }}>
        {Array.from({ length: copies }, (_, copy) => copy).flatMap(copy => items.map((item, index) => {
          const slot = copy * count + index;
          const active = slot >= displayIndex && slot < displayIndex + visible;
          const content = <>
            <AlumniLogo src={item.logo} />
            <span className={`alumni-name${item.name.length > 24 ? " is-long-name" : ""}`}><strong title={item.name}>{alumniLogoPresentations[item.logo]?.label || (item.name === "University of Chinese Academy of Sciences" ? "UCAS" : item.name === "Research Center for Eco-Environmental Sciences, CAS" ? "RCEES, CAS" : item.name === "Hefei Institutes of Physical Science, CAS" ? "Hefei Institutes, CAS" : item.name.length > 24 ? item.name.replace(/University/g, "Univ.") : item.name)}</strong>{item.alumnus ? <small>{item.alumnus}</small> : null}</span>
            {item.link ? <ArrowUpRight className="alumni-arrow" size={14} /> : null}
          </>;
          return <div className="alumni-slide" key={`${copy}-${index}`} aria-hidden={!active} inert={!active} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`}>
            {item.link ? <a className="alumni-destination" href={item.link} target="_blank" rel="noreferrer">{content}</a> : <div className="alumni-destination">{content}</div>}
          </div>;
        }))}
      </div>
    </div>
  </section>;
}
