/**
 * Reads the /content folder from disk. Used by the Vite plugin (to bundle
 * content into the app) and by the check scripts, so both see the same data.
 *
 * Folder rules:
 *   content/shared/      language-independent data
 *   content/<locale>/    one folder per language (add a folder = add a language)
 *   foo.yaml | foo.json  becomes the key "foo"
 *   a sub-folder         becomes a nested object, except "collections"
 *                        (e.g. lessons/), which become a list of their files
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { frenchTypography, mapStrings } from '../src/content/typography.ts';

export const CONTENT_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'content');
export const BASE_LOCALE = 'en';
export const LOCK_FILE = 'translation-lock.json';
const SHARED = 'shared';
const COLLECTIONS = new Set(['lessons']);

function readFile(path: string): unknown {
  const raw = readFileSync(path, 'utf8');
  try {
    return extname(path) === '.json' ? JSON.parse(raw) : parseYaml(raw);
  } catch (e) {
    throw new Error(`Could not parse ${path}: ${(e as Error).message}`);
  }
}

function readDir(dir: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const inner = readDir(full);
      out[name] = COLLECTIONS.has(name) ? Object.values(inner) : inner;
    } else if (name !== LOCK_FILE && /\.(ya?ml|json)$/.test(name)) {
      out[basename(name, extname(name))] = readFile(full);
    }
  }
  return out;
}

/** Locale codes found on disk, base language first. */
export function listLocales(): string[] {
  const dirs = readdirSync(CONTENT_DIR).filter(
    (d) => d !== SHARED && statSync(join(CONTENT_DIR, d)).isDirectory(),
  );
  return [BASE_LOCALE, ...dirs.filter((d) => d !== BASE_LOCALE).sort()];
}

export function loadShared(): unknown {
  return readDir(join(CONTENT_DIR, SHARED));
}

export function loadLocale(code: string): Record<string, unknown> {
  const dir = join(CONTENT_DIR, code);
  if (!existsSync(dir)) throw new Error(`No content folder for locale "${code}"`);
  const raw = readDir(dir);
  const typography = (raw.meta as { typography?: string } | undefined)?.typography;
  return typography === 'french' ? mapStrings(raw, frenchTypography) : raw;
}
