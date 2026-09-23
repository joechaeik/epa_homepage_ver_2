type PublicationOrder = {
  date: string;
  year: number;
  sortOrder: number;
  title: string;
  category?: string;
  citation?: string;
  journal?: string;
};

export function isUndatedInPress(entry: PublicationOrder) {
  return !entry.date && (
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
  if (!!a.date !== !!b.date) return a.date ? -1 : 1;
  const chronological = a.date.localeCompare(b.date);
  return (
    (direction === "newest" ? -chronological : chronological) ||
    a.sortOrder - b.sortOrder ||
    a.title.localeCompare(b.title)
  );
}
