import type { PublicEntry } from "./content-model";

export const currentMemberGroup = "Current Member";

// Keep the stored categories for editing and history; combine their public view.
export function peopleGroup(person: PublicEntry) {
  if (person.category === "Graduate students" || person.category === "Researchers") return currentMemberGroup;
  return person.category === "Alumni" ? person.alumniGroup || "Alumni" : person.category;
}

export function peopleFilter(category: string) {
  return category === "Graduate students" || category === "Researchers" ? currentMemberGroup : category;
}

export function isAlumnus(person: PublicEntry) {
  return person.category === "Alumni" || peopleGroup(person).includes("Alumni");
}

export function peopleText(person: PublicEntry, text: string) {
  return peopleGroup(person) === "International Alumni" ? text.replace(/\bformer\b\s*/gi, "").trim() : text;
}
