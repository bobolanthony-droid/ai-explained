import { locales, shared, termNames } from 'virtual:content-index';
import { plainText } from '@/content/richtext';
import type { LocaleContent, Term } from '@/content/schema';
import { useContent } from '@/i18n';
import { useSettings } from '@/store/settings';
import type { Searchable } from './search';

/** A term's name in another language, e.g. { code: 'fr', label: 'FR', name: 'IA générative' }. */
export type OtherName = { code: string; label: string; name: string };

/** A glossary entry: this language's wording + the shared structure, ready to display. */
export type TermView = Term &
  Searchable & {
    category: string;
    lesson: string;
    related: string[];
    otherNames: OtherName[];
  };

export function useGlossary() {
  const content = useContent();
  const locale = useSettings((s) => s.locale);
  // Built once per language and shared: a lesson has dozens of linked words,
  // and each of them calls this hook.
  let built = cache.get(content);
  if (!built) {
    built = build(content, locale);
    cache.set(content, built);
  }
  return built;
}

type Glossary = { terms: TermView[]; byId: Map<string, TermView>; nameOf: (id: string) => string };
const cache = new WeakMap<LocaleContent, Glossary>();

function build(content: LocaleContent, locale: string): Glossary {
  {
    const wording = new Map(content.glossary.map((t) => [t.id, t]));
    const nameOf = (id: string) => wording.get(id)?.term ?? id;

    const terms: TermView[] = shared.glossary.terms.map((s) => {
      const t = wording.get(s.id)!; // guaranteed by the build-time validator
      const otherNames = locales
        .filter((l) => l.code !== locale)
        .map((l) => ({ code: l.code, label: l.label, name: termNames[l.code][s.id] }))
        // No point repeating a name that is identical in both languages ("Hallucination").
        .filter((o) => o.name && o.name !== t.term);
      return {
        ...t,
        category: s.category,
        lesson: s.lesson,
        related: s.related ?? [],
        otherNames,
        names: [t.term, ...otherNames.map((o) => o.name)],
        text: [plainText(t.definition, nameOf), plainText(t.heardAs, nameOf)],
      };
    });
    return { terms, byId: new Map(terms.map((t) => [t.id, t])), nameOf };
  }
}
