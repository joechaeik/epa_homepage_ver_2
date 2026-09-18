"use client";
import Link from "next/link";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, ArrowUp, Quote, Copy, Check } from "lucide-react";
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
  ["News", "/news"],
];
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link aria-label="EPA Lab home" className="wordmark" href="/">
          EPA<span>LAB</span>
          <small>PHOTOENERGY & ENVIRONMENT</small>
        </Link>
        <nav aria-label="Main navigation">
          {nav.map(([label, url]) => (
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
          <Sheet open={open} onOpenChange={setOpen}>
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
                {[...nav, ["Join us", "/join-us"]].map(([label, url]) => (
                  <Link
                    key={url}
                    href={url}
                    onClick={() => setOpen(false)}
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
