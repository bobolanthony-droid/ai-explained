import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { shared } from 'virtual:content-index';
import { Page } from '@/components/Page';
import { CheckIcon } from '@/components/icons';
import { OtherNames } from './OtherNames';
import { initial, matchTerms } from './search';
import { type TermView, useGlossary } from './useGlossary';

function TermRow({ term }: { term: TermView }) {
  return (
    <li>
      <Link to={`/glossary/${term.id}`} className="card block px-5 py-4">
        <span className="block text-lg leading-snug font-extrabold">{term.term}</span>
        <OtherNames names={term.otherNames} />
        <span className="text-ink-soft mt-1 block text-sm">{term.text[0]}</span>
      </Link>
    </li>
  );
}

export function GlossaryPage() {
  const { t, i18n } = useTranslation();
  const { terms } = useGlossary();

  // The search and filter live in the URL (?q=...&cat=...), so they are still
  // there when you come back from a term, and they survive a language switch.
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = params.get('cat') ?? '';
  const update = (key: 'q' | 'cat', value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const collator = useMemo(() => new Intl.Collator(i18n.language, { sensitivity: 'base' }), [i18n.language]);
  const searching = query.trim() !== '';
  const inCategory = terms.filter((term) => !category || term.category === category);
  const results = searching
    ? matchTerms(inCategory, query) // best match first
    : [...inCategory].sort((a, b) => collator.compare(a.term, b.term)); // A to Z

  // A to Z view: group under letter headings.
  const groups = new Map<string, TermView[]>();
  if (!searching) {
    for (const term of results) {
      const letter = initial(term.term);
      groups.set(letter, [...(groups.get(letter) ?? []), term]);
    }
  }

  const chips = [{ id: '', label: t('glossary.all') }].concat(
    shared.glossary.categories.map((id) => ({ id, label: t(`glossary.categories.${id}`) })),
  );

  return (
    <Page title={t('glossary.title')}>
      <p className="text-ink-soft mt-2 text-lg">{t('glossary.intro')}</p>

      <label htmlFor="glossary-search" className="mt-6 block font-bold">
        {t('glossary.searchLabel')}
      </label>
      <input
        id="glossary-search"
        type="search"
        value={query}
        onChange={(e) => update('q', e.target.value)}
        placeholder={t('glossary.searchPlaceholder')}
        autoComplete="off"
        enterKeyHint="search"
        className="bg-surface border-line-strong placeholder:text-ink-soft mt-1 min-h-12 w-full rounded-2xl border px-4 text-lg"
      />

      <div role="group" aria-label={t('glossary.filterLabel')} className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = chip.id === category;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={active}
              onClick={() => update('cat', chip.id)}
              className={`flex min-h-11 items-center gap-1 rounded-full border px-4 text-sm font-bold ${
                active ? 'bg-primary text-primary-ink border-primary' : 'border-line-strong bg-surface'
              }`}
            >
              {active && <CheckIcon />}
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* role=status: screen readers announce the new count as you type. */}
      <p role="status" className="text-ink-soft mt-5 text-sm">
        {results.length ? t('glossary.count', { count: results.length }) : t('glossary.none')}
      </p>

      {searching ? (
        <ul className="mt-3 space-y-3">
          {results.map((term) => (
            <TermRow key={term.id} term={term} />
          ))}
        </ul>
      ) : (
        [...groups].map(([letter, group]) => (
          <section key={letter} aria-labelledby={`letter-${letter}`} className="mt-4">
            <h2 id={`letter-${letter}`} className="font-display text-accent-ink text-xl font-semibold">
              {letter}
            </h2>
            <ul className="mt-2 space-y-3">
              {group.map((term) => (
                <TermRow key={term.id} term={term} />
              ))}
            </ul>
          </section>
        ))
      )}
    </Page>
  );
}
