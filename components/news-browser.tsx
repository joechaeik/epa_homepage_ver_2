"use client";
import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dateLabel, type PublicEntry } from "@/lib/content-model";
import { compareDisplayOrder } from "@/lib/people-order";
import { EmptyContent } from "./site-frame";
export default function NewsBrowser({ entries, orderDirection = "asc" }: { entries: PublicEntry[]; orderDirection?: "asc" | "desc" }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const categories = [
    "All",
    ...new Set(entries.map((p) => p.category).filter(Boolean)),
  ];
  const results = entries
    .filter(
      (n) =>
        (filter === "All" || n.category === filter) &&
        `${n.title} ${n.summary}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      const order = orderDirection === "desc" ? b.sortOrder - a.sortOrder : a.sortOrder - b.sortOrder;
      return order || b.date.localeCompare(a.date) || compareDisplayOrder(a, b, orderDirection);
    });
  return (
    <>
      <div className="news-filters">
        <Tabs value={filter} onValueChange={setFilter} className="news-tabs">
          <TabsList>
            {categories.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c === "All" ? "All updates" : c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="search-box">
          <Search size={18} />
          <input
            aria-label="Search news"
            placeholder="Search news"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <p className="result-meta" aria-live="polite">
        {results.length} updates
      </p>
      {results.length ? (
        <div className="news-list">
          {results.map((n) => (
            <a key={n.id} className="news-list-item" href={"/news/" + n.id}>
              <time dateTime={n.date}>{dateLabel(n.date)}</time>
              <div>
                <span className="tag">{n.category}</span>
                <h2>{n.title}</h2>
                <p>{n.summary}</p>
              </div>
              <ArrowUpRight size={24} />
            </a>
          ))}
        </div>
      ) : (
        <EmptyContent
          title="No stories found"
          body="Try another keyword or category."
        />
      )}
    </>
  );
}
