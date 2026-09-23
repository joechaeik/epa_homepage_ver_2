type PublicationOrder = {
  date: string;
  releaseDate?: string;
  publicationSortBy?: "date" | "releaseDate";
  year: number;
  sortOrder: number;
  title: string;
  category?: string;
  citation?: string;
  journal?: string;
};

export function publicationSortDate(entry: PublicationOrder) {
  return entry.publicationSortBy === "releaseDate"
    ? entry.releaseDate || ""
    : entry.date || "";
}

export function isUndatedInPress(entry: PublicationOrder) {
  return !publicationSortDate(entry) && (
    entry.category?.toLowerCase() === "in press" ||
    /\bin[\s-]?press\b/i.test(`${entry.citation ?? ""} ${entry.journal ?? ""}`)
  );
}

export function comparePublications(
  a: PublicationOrder,
  b: PublicationOrder,
  direction: "newest" | "oldest" = "newest",
) {
  const inPress = Number(isUndatedInPress(b)) - Number(isUndatedInPress(a));
  if (inPress) return inPress;
  const aDate = publicationSortDate(a);
  const bDate = publicationSortDate(b);
  if (!!aDate !== !!bDate) return aDate ? -1 : 1;
  const chronological = aDate.localeCompare(bDate);
  return (
    (direction === "newest" ? -chronological : chronological) ||
    a.sortOrder - b.sortOrder ||
    a.title.localeCompare(b.title)
  );
}
