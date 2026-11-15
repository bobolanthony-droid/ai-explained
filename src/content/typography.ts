/**
 * Automatic French typography.
 *
 * Content authors type ordinary spaces and straight apostrophes. At build time
 * we swap in the non-breaking spaces French requires, so a "?" or "»" can never
 * wrap onto a line of its own. Enabled per locale via `typography: french` in
 * that locale's meta.yaml.
 */
const NBSP = ' '; // before ":" and inside « »
const NARROW_NBSP = ' '; // before ; ! ?

export function frenchTypography(s: string): string {
  return s
    .replace(/ ([;!?])/g, `${NARROW_NBSP}$1`)
    .replace(/ :/g, `${NBSP}:`)
    .replace(/« /g, `«${NBSP}`)
    .replace(/ »/g, `${NBSP}»`)
    // Curly apostrophe between letters, and before a [[link]] as in "L'[[ai|IA]]".
    .replace(/(\p{L})'(?=\p{L}|\[\[)/gu, '$1’');
}

/** Apply `fn` to every string value in a nested structure (keys are untouched). */
export function mapStrings<T>(value: T, fn: (s: string) => string): T {
  if (typeof value === 'string') return fn(value) as T;
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, mapStrings(v, fn)]),
    ) as T;
  }
  return value;
}
