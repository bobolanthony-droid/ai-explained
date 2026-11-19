import i18n from 'i18next';
import { locales } from 'virtual:content-index';
import { switchLocale, useOtherLocales } from '@/i18n';
import { useSettings } from '@/store/settings';

/**
 * The browser language that the app has a version for, if it is not the one
 * showing. E.g. a phone set to French, with the app in English -> 'fr'.
 * Pure function, unit-tested.
 */
export function suggestedLocale(browserLanguages: readonly string[], available: string[], current: string): string | null {
  for (const lang of browserLanguages) {
    const code = lang.toLowerCase().slice(0, 2);
    if (available.includes(code)) return code === current ? null : code;
  }
  return null;
}

/**
 * A one-line offer, written in the phone's own language: "This app also
 * exists in French. Switch?" The app still opens in English for everyone; this
 * only offers the switch (one tap), so phones do not need to translate the page.
 * Hidden for good once the user chooses either way.
 */
export function LanguageSuggestion() {
  const current = useSettings((s) => s.locale);
  const dismissed = useSettings((s) => s.languageSuggestionDismissed);
  useOtherLocales(); // loads the other language's words in the background
  const code = suggestedLocale(
    navigator.languages ?? [navigator.language],
    locales.map((l) => l.code),
    current,
  );
  if (dismissed || !code || !i18n.hasResourceBundle(code, 'translation')) return null;

  const t = i18n.getFixedT(code); // the offer is written in the language it offers
  const choose = (switchTo: boolean) => {
    useSettings.setState({ languageSuggestionDismissed: true });
    if (switchTo) void switchLocale(code);
  };
  return (
    <aside lang={code} className="bg-primary-soft px-5 py-3">
      <p className="font-semibold">{t('language.suggest')}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary min-h-11 px-4 text-sm" onClick={() => choose(true)}>
          {t('language.switchTo')}
        </button>
        <button type="button" className="btn btn-quiet min-h-11 px-4 text-sm" onClick={() => choose(false)}>
          {t('language.noThanks')}
        </button>
      </div>
    </aside>
  );
}
