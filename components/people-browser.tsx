"use client";
import { useState } from "react";
import { Mail, ArrowUpRight, UserRound } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PublicEntry } from "@/lib/content-model";
export default function PeopleBrowser({ people }: { people: PublicEntry[] }) {
  const [filter, setFilter] = useState("All");
  const categories = [
    "All",
    ...new Set(people.map((p) => p.category).filter(Boolean)),
  ];
  const shown = people.filter((p) => filter === "All" || p.category === filter);
  return (
    <>
      <Tabs value={filter} onValueChange={setFilter} className="people-tabs">
        <TabsList>
          {categories.map((c) => (
            <TabsTrigger value={c} key={c}>
              {c === "All" ? "Everyone" : c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
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
              <p className="eyebrow">{p.category}</p>
              <h3>{p.title}</h3>
              <p className="person-role">{p.role}</p>
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
