/**
 * Helpers for comparing two locales item by item.
 *
 * `flatten` turns nested content into "dotted path -> value" pairs, e.g.
 *   lessons.not-late.title -> "You're not late"
 * Lists of objects are keyed by each object's `id` (not its position), so
 * re-ordering a list never looks like a translation change.
 */
export type Leaf = string | number | boolean;

export function flatten(value: unknown, prefix = '', out: Record<string, Leaf> = {}) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      const key =
        item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string'
          ? (item as { id: string }).id
          : String(i);
      flatten(item, prefix ? `${prefix}.${key}` : key, out);
    });
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (value !== null && value !== undefined) {
    out[prefix] = value as Leaf;
  }
  return out;
}

export type LocaleDiff = {
  /** In the base language but not in the translation. Fails the build. */
  missing: string[];
  /** In the translation but not in the base language. Warning only. */
  extra: string[];
  /** Base text changed since the translation was last stamped. Warning. */
  stale: string[];
  /** Translated but never stamped as reviewed. Warning. */
  unstamped: string[];
};

/**
 * @param lock  path -> hash of the base text at the time the translation was reviewed
 * @param hash  hashing function (injected so this stays pure and testable)
 */
export function compareLocales(
  base: Record<string, Leaf>,
  translation: Record<string, Leaf>,
  lock: Record<string, string>,
  hash: (v: Leaf) => string,
): LocaleDiff {
  // `meta.*` describes the language itself (label, typography), so it may differ.
  const keys = (o: object) => Object.keys(o).filter((k) => !k.startsWith('meta.'));
  const diff: LocaleDiff = { missing: [], extra: [], stale: [], unstamped: [] };
  for (const k of keys(base)) {
    if (!(k in translation)) diff.missing.push(k);
    else if (!(k in lock)) diff.unstamped.push(k);
    else if (lock[k] !== hash(base[k])) diff.stale.push(k);
  }
  // Plural forms differ between languages (e.g. French has "_many"), so extras only warn.
  for (const k of keys(translation)) if (!(k in base)) diff.extra.push(k);
  return diff;
}
