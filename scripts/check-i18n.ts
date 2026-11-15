/**
 * Translation check. Run with `npm run check`.
 *
 *  - MISSING: an English item has no counterpart  -> build fails
 *  - STALE:   the English changed after the translation was reviewed -> warning
 *             (add --strict to fail on these too)
 *
 * How "stale" works: each translation folder holds a translation-lock.json that
 * records a fingerprint of the English text each item was translated from.
 * After you review a translation, run `npm run i18n:stamp` to refresh it.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { compareLocales, flatten, type Leaf } from '../src/content/flatten';
import { BASE_LOCALE, CONTENT_DIR, LOCK_FILE, listLocales, loadLocale } from './content-lib';

const stamp = process.argv.includes('--stamp');
const strict = process.argv.includes('--strict');
const hash = (v: Leaf) => createHash('sha1').update(String(v)).digest('hex').slice(0, 10);

const base = flatten(loadLocale(BASE_LOCALE));
let failed = false;

for (const code of listLocales().filter((c) => c !== BASE_LOCALE)) {
  const translation = flatten(loadLocale(code));
  const lockPath = join(CONTENT_DIR, code, LOCK_FILE);

  if (stamp) {
    const lock: Record<string, string> = {};
    for (const k of Object.keys(base).sort()) {
      if (k in translation && !k.startsWith('meta.')) lock[k] = hash(base[k]);
    }
    writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
    console.log(`[${code}] stamped ${Object.keys(lock).length} items as reviewed`);
    continue;
  }

  const lock = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : {};
  const diff = compareLocales(base, translation, lock, hash);
  const list = (label: string, keys: string[]) => {
    if (keys.length) console.warn(`[${code}] ${keys.length} ${label}:\n${keys.map((k) => `    ${k}`).join('\n')}`);
  };
  list('MISSING translation(s)', diff.missing);
  list('STALE translation(s) (English changed since last review)', diff.stale);
  // usageNote is language-specific by design ("in French, people keep the English word").
  list('extra item(s) not in English', diff.extra.filter((k) => !k.endsWith('.usageNote')));
  if (diff.unstamped.length) {
    console.warn(`[${code}] ${diff.unstamped.length} item(s) not yet stamped as reviewed (run: npm run i18n:stamp)`);
  }
  if (diff.missing.length || (strict && diff.stale.length)) failed = true;
  if (!diff.missing.length && !diff.stale.length) {
    console.log(`[${code}] translations complete: 0 missing, 0 stale (${Object.keys(base).length} items)`);
  }
}

if (failed) process.exit(1);
