/**
 * Tiny markup for content text: glossary links.
 *
 *   [[prompt]]                 -> link showing the term's own name
 *   [[chatbot|chat assistant]] -> link showing "chat assistant"
 *
 * Kept free of React so the build-time validator can use it too.
 */
const LINK = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

export type Segment = { text: string } | { termId: string; label?: string };

export function parseRichText(source: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of source.matchAll(LINK)) {
    if (m.index > last) out.push({ text: source.slice(last, m.index) });
    out.push({ termId: m[1], label: m[2] });
    last = m.index + m[0].length;
  }
  if (last < source.length) out.push({ text: source.slice(last) });
  return out;
}

/** A fill-in-the-blank [placeholder] in a prompt (single brackets, unlike [[term links]]). */
export const PLACEHOLDER = /(?<!\[)\[[^\[\]]+\](?!\])/;

/** Splits a prompt into plain text and [placeholders], so the UI can highlight them. */
export function splitPlaceholders(prompt: string): { text: string; placeholder: boolean }[] {
  return prompt
    .split(/((?<!\[)\[[^\[\]]+\](?!\]))/)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, placeholder: PLACEHOLDER.test(part) }));
}

/** IDs of every glossary term linked from this text. */
export function termLinks(source: string): string[] {
  return [...source.matchAll(LINK)].map((m) => m[1]);
}

/** The text with link markup removed (for search, previews and word counts). */
export function plainText(source: string, nameOf: (id: string) => string = (id) => id): string {
  return source.replace(LINK, (_, id: string, label?: string) => label ?? nameOf(id));
}

/** Counts real words; punctuation standing alone (French " : ") is not a word. */
export function wordCount(source: string): number {
  return plainText(source).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}
