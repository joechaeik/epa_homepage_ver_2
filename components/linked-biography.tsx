import type { ReactNode } from "react";

function linkedText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const links = /\[([^\]\n]+)\]\((https?:\/\/[^\s<>)]*)\)/g;
  let start = 0;
  for (const match of text.matchAll(links)) {
    const index = match.index;
    parts.push(text.slice(start, index));
    try {
      const url = new URL(match[2]);
      if (url.username || url.password) throw new Error("Credentials are not supported.");
      parts.push(
        <a key={index} href={url.href} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>,
      );
    } catch {
      parts.push(match[0]);
    }
    start = index + match[0].length;
  }
  parts.push(text.slice(start));
  return parts;
}

export default function LinkedBiography({ text }: { text: string }) {
  return (
    <div className="pi-biography">
      {text.split(/\r?\n\s*\r?\n/).filter((paragraph) => paragraph.trim()).map((paragraph, index) => (
        <p key={index}>{linkedText(paragraph)}</p>
      ))}
    </div>
  );
}
