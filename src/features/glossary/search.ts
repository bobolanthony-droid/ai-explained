/** Glossary search. Pure functions, unit-tested. */

/** Lowercase and strip accents, so "generative" finds "générative". */
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

export type Searchable = {
  /** The term's name in every language (so English words work in French mode, and vice versa). */
  names: string[];
  /** Other text worth searching: definition, "you might hear". */
  text: string[];
};

/** Terms matching the query. Name matches come first, then matches in the text. */
export function matchTerms<T extends Searchable>(items: T[], query: string): T[] {
  const q = fold(query.trim());
  if (!q) return items;
  const byName = items.filter((i) => i.names.some((n) => fold(n).includes(q)));
  const byText = items.filter((i) => !byName.includes(i) && i.text.some((t) => fold(t).includes(q)));
  return [...byName, ...byText];
}

/** The letter a term is filed under: "Données..." -> "D", "IA (...)" -> "I". */
export function initial(term: string): string {
  return fold(term).charAt(0).toUpperCase();
}
