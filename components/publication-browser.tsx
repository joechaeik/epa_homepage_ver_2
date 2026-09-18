"use client";
import { useMemo, useState } from "react";
import { Search, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { PublicationRow, EmptyContent } from "./site-frame";
import type { PublicEntry } from "@/lib/content-model";
export default function PublicationBrowser({
  entries,
}: {
  entries: PublicEntry[];
}) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const years = useMemo(
    () => [...new Set(entries.map((e) => e.year))].sort((a, b) => b - a),
    [entries],
  );
  const results = useMemo(
    () =>
      entries
        .filter(
          (p) =>
            (year === "all" || String(p.year) === year) &&
            `${p.title} ${p.authors} ${p.journal} ${p.doi} ${p.tags}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "journal"
            ? a.journal.localeCompare(b.journal)
            : sort === "oldest"
              ? a.year - b.year || a.sortOrder - b.sortOrder
              : b.year - a.year || a.sortOrder - b.sortOrder,
        ),
    [entries, query, year, sort],
  );
  const pages = Math.ceil(results.length / 6);
  const visible = results.slice((page - 1) * 6, page * 6);
  return (
    <>
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={19} />
          <input
            aria-label="Search publications"
            placeholder="Search by title, author, journal or DOI"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={year}
          onValueChange={(v) => {
            setYear(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Publication year"
            className="filter-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Sort publications"
            className="filter-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="journal">Journal A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="result-meta">
        <p aria-live="polite">
          {results.length}{" "}
          {results.length === 1 ? "publication" : "publications"}
          {query ? " matching your search" : ""}
        </p>
        <span>Selected recent publications · EPA Lab</span>
      </div>
      {visible.length ? (
        <div className="publication-list">
          {visible.map((p) => (
            <PublicationRow key={p.id} entry={p} />
          ))}
        </div>
      ) : (
        <EmptyContent
          title="No publications found"
          body="Try a different title, author, or year."
        />
      )}
      {pages > 1 ? (
        <Pagination className="paper-pagination">
          <PaginationContent>
            <PaginationItem>
              <button
                className="icon-button"
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={18} />
              </button>
            </PaginationItem>
            {Array.from({ length: pages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#publications"
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <button
                className="icon-button"
                aria-label="Next page"
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
      <div className="archive-note">
        <p>Looking for an earlier paper?</p>
        <a
          className="text-link"
          href="https://epa.kentech.ac.kr/board_4_1"
          target="_blank"
          rel="noreferrer"
        >
          Visit the full publication archive <ArrowUpRight size={17} />
        </a>
      </div>
    </>
  );
}
