import type { ReactNode } from "react";

/** A block of store-guide text, as written in the admin: plain paragraphs separated by blank
 * lines, plus a small Markdown subset so a store guide can carry the structure of a long-form
 * article: `### ` sub-headings, `- ` bullet lists, `1. ` numbered lists, `|` tables,
 * `**bold**` and `[label](link)`. Anything else stays a plain paragraph, so older plain-text
 * content renders exactly as before. */
export type RichBlock =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

const bullet = /^\s*[-•]\s+/;
const numbered = /^\s*\d+[.)]\s+/;
const tableRow = /^\s*\|/;
const separatorRow = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function cells(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

export function parseRichText(text = ""): RichBlock[] {
  const blocks: RichBlock[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let paragraph: string[] = [];
  const flush = () => {
    const joined = paragraph.join("\n").trim();
    if (joined) blocks.push({ type: "p", text: joined });
    paragraph = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { flush(); continue; }
    const heading = line.match(/^\s*#{2,4}\s+(.+)$/);
    if (heading) { flush(); blocks.push({ type: "h3", text: heading[1].trim() }); continue; }
    const listType = bullet.test(line) ? "ul" : numbered.test(line) ? "ol" : null;
    if (listType) {
      flush();
      const pattern = listType === "ul" ? bullet : numbered;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i])) items.push(lines[i++].replace(pattern, "").trim());
      i--;
      blocks.push({ type: listType, items });
      continue;
    }
    if (tableRow.test(line)) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && tableRow.test(lines[i])) {
        if (!separatorRow.test(lines[i])) rows.push(cells(lines[i]));
        i++;
      }
      i--;
      const [head = [], ...body] = rows;
      blocks.push({ type: "table", head, rows: body });
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

/** Plain text of a rich block, without Markdown marks: for schema and search snippets. */
export function richToPlain(text = "") {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1").replace(/^\s*#{2,4}\s+/gm, "");
}

/** Inline `**bold**` and `[label](href)`. Links to this site stay in the tab; others open
 * in a new one and carry no ranking credit. Only http(s) and site-relative links are linked. */
export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${match.index}`;
    if (match[1] !== undefined) out.push(<strong key={key}>{match[1]}</strong>);
    else {
      const [label, href] = [match[2], match[3]];
      if (href.startsWith("/") && !href.startsWith("//")) out.push(<a key={key} href={href}>{label}</a>);
      else if (/^https?:\/\//.test(href)) out.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">{label}</a>);
      else out.push(label);
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text }: { text: string }) {
  return <>{parseRichText(text).map((block, i) => {
    switch (block.type) {
      case "h3": return <h3 key={i}>{renderInline(block.text)}</h3>;
      case "p": return <p key={i}>{renderInline(block.text)}</p>;
      case "ul": return <ul key={i}>{block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}</ul>;
      case "ol": return <ol key={i}>{block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}</ol>;
      case "table": return <div key={i} className="store-table-wrap"><table className="store-table">
        {block.head.length > 0 && <thead><tr>{block.head.map((cell, j) => <th key={j} scope="col">{renderInline(cell)}</th>)}</tr></thead>}
        <tbody>{block.rows.map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k}>{renderInline(cell)}</td>)}</tr>)}</tbody>
      </table></div>;
    }
  })}</>;
}
