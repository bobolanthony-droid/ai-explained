import { describe, expect, it } from 'vitest';
import { loadLocale, loadShared } from '../../scripts/content-lib';
import { parseRichText, plainText, termLinks, wordCount } from '../../src/content/richtext';
import { LocaleContentSchema, SharedSchema } from '../../src/content/schema';
import { crossCheck } from '../../src/content/validate';
import { fold, initial, matchTerms } from '../../src/features/glossary/search';

describe('rich text', () => {
  it('splits text and term links', () => {
    expect(parseRichText('Ask a [[chatbot|chat assistant]] or an [[agent]].')).toEqual([
      { text: 'Ask a ' },
      { termId: 'chatbot', label: 'chat assistant' },
      { text: ' or an ' },
      { termId: 'agent', label: undefined },
      { text: '.' },
    ]);
  });
  it('lists links and strips markup', () => {
    expect(termLinks('a [[llm]] b [[prompt|x]]')).toEqual(['llm', 'prompt']);
    expect(plainText('a [[llm]] b [[prompt|x]]', (id) => id.toUpperCase())).toBe('a LLM b x');
  });
  it('counts words, ignoring punctuation that stands alone (as in French)', () => {
    expect(wordCount('Une IA : votre question ?')).toBe(4);
  });
});

describe('glossary search', () => {
  const items = [
    { id: 'gen', names: ['IA générative', 'Generative AI'], text: ['Une IA qui crée du nouveau'] },
    { id: 'prompt', names: ['Prompt (requête, instruction)', 'Prompt'], text: ['Ce que vous écrivez à une IA générative'] },
    { id: 'agent', names: ['Agent IA', 'AI agent'], text: ['Enchaîne des étapes'] },
  ];
  const ids = (q: string) => matchTerms(items, q).map((i) => i.id);

  it('ignores accents and case, and ranks name matches first', () => {
    expect(fold('Générative')).toBe('generative');
    expect(ids('GENERATIVE')).toEqual(['gen', 'prompt']);
  });
  it('finds a term by its name in the other language', () => {
    expect(ids('requete')).toEqual(['prompt']);
    expect(ids('ai agent')).toEqual(['agent']);
  });
  it('returns everything for an empty query and nothing for nonsense', () => {
    expect(ids('  ')).toEqual(['gen', 'prompt', 'agent']);
    expect(ids('zzz')).toEqual([]);
  });
  it('files accented terms under the plain letter', () => {
    expect(initial('États')).toBe('E');
  });
});

describe('glossary validation', () => {
  const shared = SharedSchema.parse(loadShared());
  const en = LocaleContentSchema.parse(loadLocale('en'));
  const check = (patch: Partial<typeof en>, s = shared) => crossCheck(s, { ...en, ...patch }, 'en').join('\n');

  it('flags a term that is listed but not written', () => {
    expect(check({ glossary: en.glossary.slice(1) })).toContain('not written in glossary.yaml');
  });
  it('flags a definition that is too long', () => {
    const long = { ...en.glossary[0], definition: 'word '.repeat(21) };
    expect(check({ glossary: [long, ...en.glossary.slice(1)] })).toContain('definition has 21 words');
  });
  it('flags a [[link]] to a term that does not exist', () => {
    const broken = { ...en.glossary[0], example: 'See [[no-such-term]].' };
    expect(check({ glossary: [broken, ...en.glossary.slice(1)] })).toContain('[[no-such-term]]');
  });
  it('flags a related term or lesson that does not exist', () => {
    const terms = [{ ...shared.glossary.terms[0], related: ['ghost'], lesson: 'nope' }, ...shared.glossary.terms.slice(1)];
    const out = check({}, { ...shared, glossary: { ...shared.glossary, terms } });
    expect(out).toContain('related term "ghost"');
    expect(out).toContain('unknown lesson "nope"');
  });
});
