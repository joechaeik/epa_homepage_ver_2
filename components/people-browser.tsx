"use client";
import { useState } from "react";
import { Mail, ArrowUpRight, UserRound } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PublicEntry } from "@/lib/content-model";
export default function PeopleBrowser({ people, initialFilter = "Graduate students", alumniListUpdated = "" }: { people: PublicEntry[]; initialFilter?: string; alumniListUpdated?: string }) {
  const groupOf = (p: PublicEntry) => p.category === "Alumni" ? p.alumniGroup || "Alumni" : p.category;
  const available = new Set(people.map(groupOf).filter(Boolean));
  const preferred = ["Graduate students", "Researchers", "Korean Alumni", "International Alumni", "Visitors"];
  const categories = [...preferred.filter(c => available.has(c)), ...[...available].filter(c => !preferred.includes(c))];
  // Preserve old Alumni links while opening the first available alumni group.
  const requested = initialFilter === "Alumni" ? categories.find(c => c.includes("Alumni")) : initialFilter;
  const [filter, setFilter] = useState(requested && available.has(requested) ? requested : categories[0] || "");
  const shown = people.filter((p) => groupOf(p) === filter);
  const showAlumniNote = filter.includes("Alumni");
  const updatedLabel = alumniListUpdated ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(alumniListUpdated + "T00:00:00Z")) : "";
  return (
    <>
      <Tabs value={filter} onValueChange={setFilter} className="people-tabs">
        <TabsList>
          {categories.map((c) => (
            <TabsTrigger value={c} key={c}>
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {showAlumniNote && updatedLabel ? <p className="alumni-list-note">Alumni records updated: <time dateTime={alumniListUpdated}>{updatedLabel}</time>.<br />Affiliations and titles are reported in the source records; this date does not indicate that every current position has been verified.</p> : null}
      <div className="people-grid">
        {shown.map((p) => (
          <article key={p.id} className="person-card">
            {p.image ? (
              <img loading="lazy" src={p.image} alt={p.imageAlt || p.title} />
            ) : (
              <div className="person-placeholder">
                <UserRound size={45} />
              </div>
            )}
            <div className="person-info">
              <p className="eyebrow">{groupOf(p)}</p>
              <h3>{p.title}</h3>
              <p className="person-role">{p.membershipHistory || p.role}</p>
              {p.affiliation || p.affiliationPosition ? <p className="person-affiliation">{p.affiliation}{p.affiliation && p.affiliationPosition ? <br /> : null}{p.affiliationPosition ? <span>{p.affiliationPosition}</span> : null}</p> : null}
              {p.summary ? <p className="person-summary">{p.summary}</p> : null}
              <div className="person-links">
                {p.email ? (
                  <a href={"mailto:" + p.email} aria-label={"Email " + p.title}>
                    <Mail size={16} />
                    Email
                  </a>
                ) : null}
                {p.link ? (
                  <a href={p.link} target="_blank" rel="noreferrer">
                    Profile <ArrowUpRight size={16} />
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
