/**
 * Language handling.
 *
 * UI strings go through i18next (plurals, interpolation). Structured content
 * (lessons, glossary...) is read with useContent(). Both come from the same
 * per-language bundle, loaded on demand and cached in memory.
 */
import i18n from 'i18next';
import { useEffect, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { loaders, locales } from 'virtual:content-index';
import type { LocaleContent, LocaleInfo } from '@/content/schema';
import { useSettings } from '@/store/settings';

export const BASE_LOCALE = 'en';
const loaded = new Map<string, LocaleContent>();
const loading = new Map<string, Promise<LocaleContent>>();

/** Load a language's bundle once (works offline: the service worker has it). */
function ensureLoaded(code: string): Promise<LocaleContent> {
  let promise = loading.get(code);
  if (!promise) {
    promise = loaders[code]().then((content) => {
      loaded.set(code, content);
      i18n.addResourceBundle(code, 'translation', content.ui);
      return content;
    });
    loading.set(code, promise);
  }
  return promise;
}

/** Switch language instantly: no reload, the current page and its state stay put. */
export async function switchLocale(code: string) {
  await ensureLoaded(code);
  await i18n.changeLanguage(code);
  document.documentElement.lang = code;
  // Set last: components re-render only once the content is ready.
  useSettings.setState({ locale: code });
}

export async function startLocale() {
  await i18n.use(initReactI18next).init({
    lng: BASE_LOCALE,
    fallbackLng: BASE_LOCALE,
    resources: {},
    interpolation: { escapeValue: false }, // React already escapes
  });
  const saved = useSettings.getState().locale;
  await switchLocale(locales.some((l) => l.code === saved) ? saved : BASE_LOCALE);
}

/** The current language's content. Re-renders the component on language change. */
export function useContent(): LocaleContent {
  const locale = useSettings((s) => s.locale);
  return loaded.get(locale)!;
}

/**
 * The content of the OTHER language(s), for "Copy in French / English" buttons.
 * Loaded in the background the first time a page asks; returns [] until ready.
 * (Loading ahead of the tap matters: browsers only allow copying to the
 * clipboard directly inside a tap, not after a wait.)
 */
export function useOtherLocales(): { info: LocaleInfo; content: LocaleContent }[] {
  const locale = useSettings((s) => s.locale);
  const [, refresh] = useState(0);
  const others = locales.filter((l) => l.code !== locale);
  useEffect(() => {
    let alive = true;
    for (const l of others) {
      if (!loaded.has(l.code)) void ensureLoaded(l.code).then(() => alive && refresh((n) => n + 1));
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
  return others.flatMap((info) => {
    const content = loaded.get(info.code);
    return content ? [{ info, content }] : [];
  });
}

/** Format a YYYY-MM-DD date for the current language, e.g. "14 novembre 2026". */
export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso));
}
