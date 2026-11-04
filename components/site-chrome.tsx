"use client";
import Link from "@/components/site-link";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, ArrowUp, Quote, Copy, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  publicationBibtex,
  type Entry,
  type PublicEntry,
} from "@/lib/content-model";
const nav = [
  ["Home", "/"],
  ["Research", "/research"],
  ["Publications", "/publications"],
  ["People", "/people"],
  ["Lab life", "/lab-life"],
  ["News", "/news"],
];
const peopleNav = [
  ["Professor", "/people#professor-profile"],
  ["Student", "/people?category=Current%20Member#team-members"],
];
export function Header({ labFullName }: { labFullName: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [peopleExpanded, setPeopleExpanded] = useState(false);
  const mobilePeopleId = useId();
  const peopleActive = path === "/people";
  function setNavigationOpen(next: boolean) {
    setOpen(next);
    if (!next) setPeopleExpanded(false);
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link aria-label="EPA Lab home" className="wordmark" href="/">
          EPA<span>LAB</span>
          <small>{labFullName}</small>
        </Link>
        <nav aria-label="Main navigation">
          {nav.map(([label, url]) => url === "/people" ? (
            <DropdownMenu key={url} modal={false}>
              <DropdownMenuTrigger asChild>
                <button type="button" className={`people-nav-trigger${peopleActive ? " active" : ""}`} aria-current={peopleActive ? "page" : undefined}>
                  {label}<ChevronDown size={15} aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="people-nav-dropdown" align="start" sideOffset={8}>
                {peopleNav.map(([name, href]) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link href={href}>{name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              key={url}
              href={url}
              aria-current={path === url ? "page" : undefined}
              className={path === url ? "active" : ""}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="button small" href="/join-us">
            Join our lab <ArrowUpRight size={16} />
          </Link>
          <Sheet open={open} onOpenChange={setNavigationOpen}>
            <SheetTrigger asChild>
              <button
                className="mobile-menu icon-button"
                aria-label="Open navigation"
              >
                <Menu size={23} />
              </button>
            </SheetTrigger>
            <SheetContent className="mobile-sheet">
              <SheetTitle>EPA Lab</SheetTitle>
              <SheetDescription>Explore our laboratory</SheetDescription>
              <nav aria-label="Mobile navigation">
                {[...nav, ["Join us", "/join-us"]].map(([label, url]) => url === "/people" ? (
                  <div className="mobile-people-nav" key={url}>
                    <button type="button" className="mobile-people-toggle" aria-expanded={peopleExpanded} aria-controls={mobilePeopleId} aria-current={peopleActive ? "page" : undefined} onClick={() => setPeopleExpanded(value => !value)}>
                      {label}<ChevronDown size={18} aria-hidden="true" />
                    </button>
                    <div id={mobilePeopleId} className="mobile-people-links" hidden={!peopleExpanded}>
                      {peopleNav.map(([name, href]) => <Link key={href} href={href} onClick={() => setNavigationOpen(false)}>{name}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={url}
                    href={url}
                    onClick={() => setNavigationOpen(false)}
                    aria-current={path === url ? "page" : undefined}
                  >
                    {label}
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
export function BackToTop() {
  return (
    <button
      className="back-top"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp size={19} />
    </button>
  );
}
export function Citation({ entry }: { entry: Entry }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const value = publicationBibtex(entry);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-link citation-button">
          <Quote size={15} /> Cite
        </button>
      </DialogTrigger>
      <DialogContent className="citation-dialog">
        <DialogHeader>
          <DialogTitle>Cite this publication</DialogTitle>
          <DialogDescription>
            BibTeX · {entry.journal}, {entry.year}
          </DialogDescription>
        </DialogHeader>
        <textarea
          aria-label="BibTeX citation"
          readOnly
          value={value}
          rows={9}
        />
        <button
          className="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setError("");
            } catch {
              setError("Select and copy the citation above.");
            }
          }}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
          {copied ? "Copied" : "Copy citation"}
        </button>
        {error ? <p role="status">{error}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
export function Gallery({ photos }: { photos: PublicEntry[] }) {
  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <Dialog key={photo.id}>
          <DialogTrigger asChild>
            <button className="photo-card">
              <img
                loading="lazy"
                src={photo.image}
                alt={photo.imageAlt || photo.title}
              />
              <span className="photo-caption">
                <span>
                  <small>
                    {photo.category} · {photo.year}
                  </small>
                  <strong>{photo.title}</strong>
                </span>
                <ArrowUpRight size={21} />
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="gallery-dialog">
            <DialogHeader>
              <DialogTitle>{photo.title}</DialogTitle>
              <DialogDescription>
                {photo.category} · {photo.year}
              </DialogDescription>
            </DialogHeader>
            <img src={photo.image} alt={photo.imageAlt || photo.title} />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
