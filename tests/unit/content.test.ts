import { describe, expect, it } from 'vitest';
import { listLocales, loadLocale, loadShared } from '../../scripts/content-lib';
import { compareLocales, flatten } from '../../src/content/flatten';
import { LocaleContentSchema, SharedSchema } from '../../src/content/schema';
import { frenchTypography, mapStrings } from '../../src/content/typography';
import { crossCheck } from '../../src/content/validate';

describe('flatten', () => {
  it('keys lists of objects by id, so order does not matter', () => {
    const a = flatten({ lessons: [{ id: 'x', title: 'X' }, { id: 'y', title: 'Y' }] });
    const b = flatten({ lessons: [{ id: 'y', title: 'Y' }, { id: 'x', title: 'X' }] });
    expect(a).toEqual(b);
    expect(a['lessons.x.title']).toBe('X');
  });
  it('keys plain lists by position', () => {
    expect(flatten({ p: ['one', 'two'] })).toEqual({ 'p.0': 'one', 'p.1': 'two' });
  });
});

describe('compareLocales', () => {
  const hash = (v: unknown) => `h:${v}`;
  it('reports missing, stale, extra and unstamped items', () => {
    const base = { a: 'A', b: 'B changed', c: 'C', d: 'D', 'meta.label': 'EN' };
    const tr = { b: 'B fr', c: 'C fr', d: 'D fr', e: 'only in fr' };
    const lock = { b: 'h:B', c: 'h:C' };
    expect(compareLocales(base, tr, lock, hash)).toEqual({
      missing: ['a'],
      stale: ['b'],
      extra: ['e'],
      unstamped: ['d'],
    });
  });
});

describe('frenchTypography', () => {
  it('adds non-breaking spaces and curly apostrophes', () => {
    expect(frenchTypography("Qu'est-ce que l'IA ?")).toBe('Qu’est-ce que l’IA ?');
    expect(frenchTypography('Note : « oui »')).toBe('Note : « oui »');
    expect(frenchTypography("L'[[ai|IA]]")).toBe('L’[[ai|IA]]');
  });
  it('mapStrings leaves keys and non-strings alone', () => {
    expect(mapStrings({ 'a ?': ['x ?', 3] }, frenchTypography)).toEqual({ 'a ?': ['x ?', 3] });
  });
});

describe('crossCheck', () => {
  const shared = SharedSchema.parse(loadShared());
  const en = LocaleContentSchema.parse(loadLocale('en'));
  it('passes for the real content', () => {
    expect(crossCheck(shared, en, 'en')).toEqual([]);
  });
  it('flags a lesson missing from a language', () => {
    const broken = { ...en, lessons: en.lessons.slice(1) };
    expect(crossCheck(shared, broken, 'en').join('\n')).toContain('has no lesson file');
  });
  it('flags a lesson file that is not on the path', () => {
    const extra = { ...en, lessons: [...en.lessons, { ...en.lessons[0], id: 'orphan' }] };
    expect(crossCheck(shared, extra, 'en').join('\n')).toContain('not in shared/path.yaml');
  });
});

describe('real content', () => {
  it('every language passes the schema and has every English item', () => {
    const base = flatten(loadLocale('en'));
    for (const code of listLocales()) {
      expect(() => LocaleContentSchema.parse(loadLocale(code))).not.toThrow();
      const diff = compareLocales(base, flatten(loadLocale(code)), {}, String);
      expect(diff.missing, `missing in ${code}`).toEqual([]);
    }
  });
});
