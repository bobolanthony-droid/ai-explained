import { useTranslation } from 'react-i18next';
import { locales } from 'virtual:content-index';
import { switchLocale } from '@/i18n';
import { useSettings } from '@/store/settings';

/**
 * EN | FR switch. Built from the list of content folders, so a third language
 * appears here automatically. `full` shows language names instead of codes.
 */
export function LanguageSwitcher({ full = false }: { full?: boolean }) {
  const { t } = useTranslation();
  const current = useSettings((s) => s.locale);
  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="border-line-strong bg-surface inline-flex rounded-full border p-0.5"
    >
      {locales.map((l) => {
        const active = l.code === current;
        return (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            aria-pressed={active}
            onClick={() => {
              useSettings.setState({ languageSuggestionDismissed: true });
              void switchLocale(l.code);
            }}
            className={`min-h-11 min-w-11 rounded-full px-3 text-sm font-bold ${
              active ? 'bg-primary text-primary-ink' : 'text-ink-soft'
            }`}
          >
            {full ? l.name : l.label}
            {!full && <span className="sr-only"> {l.name}</span>}
          </button>
        );
      })}
    </div>
  );
}
