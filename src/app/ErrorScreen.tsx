import { useTranslation } from 'react-i18next';

/**
 * Shown if something goes wrong while drawing a screen, instead of the raw
 * technical error (a stack trace) that the router shows by default.
 * Calm wording, and one obvious way out: reload. Progress is kept, because it
 * is saved on the device.
 */
export function ErrorScreen() {
  const { t } = useTranslation();
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-10">
      <h1 className="font-display text-3xl leading-tight font-semibold">{t('error.title')}</h1>
      <p className="mt-3 text-lg">{t('error.body')}</p>
      <button type="button" className="btn btn-primary mt-6 w-full" onClick={() => window.location.reload()}>
        {t('error.reload')}
      </button>
      <a href={import.meta.env.BASE_URL} className="btn btn-quiet mt-3 w-full">
        {t('error.home')}
      </a>
    </main>
  );
}
