import type { Entry } from "./content-model";

export type PeopleSortDirection = "asc" | "desc";

export function compareDisplayOrder(
  a: Pick<Entry, "sortOrder" | "title">,
  b: Pick<Entry, "sortOrder" | "title">,
  direction: PeopleSortDirection,
) {
  const order = direction === "desc"
    ? b.sortOrder - a.sortOrder
    : a.sortOrder - b.sortOrder;
  return order || a.title.localeCompare(b.title);
}

export function comparePeople(
  a: Pick<Entry, "sortOrder" | "title">,
  b: Pick<Entry, "sortOrder" | "title">,
  direction: PeopleSortDirection,
) {
  return compareDisplayOrder(a, b, direction);
}
