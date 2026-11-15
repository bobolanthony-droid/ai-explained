import { type ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { shared } from 'virtual:content-index';
import { Choice } from '@/components/Choice';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Page } from '@/components/Page';
import { formatDate } from '@/i18n';
import { downloadExport, resetData } from '@/store/backup';
import { type TextSize, type Theme, useSettings } from '@/store/settings';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card mt-5">
      <h2 className="mb-3 text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const settings = useSettings();
  const dialog = useRef<HTMLDialogElement>(null);

  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: t('settings.themeSystem') },
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
  ];
  const sizes: { value: TextSize; label: string }[] = [
    { value: 'standard', label: t('settings.sizeStandard') },
    { value: 'large', label: t('settings.sizeLarge') },
    { value: 'larger', label: t('settings.sizeLarger') },
    { value: 'largest', label: t('settings.sizeLargest') },
  ];

  return (
    <Page title={t('settings.title')} back="/me">
      <Section title={t('settings.language')}>
        <LanguageSwitcher full />
      </Section>

      <Choice
        legend={t('settings.theme')}
        name="theme"
        value={settings.theme}
        options={themes}
        onChange={(theme) => useSettings.setState({ theme })}
      />
      <Choice
        legend={t('settings.textSize')}
        name="text-size"
        value={settings.textSize}
        options={sizes}
        onChange={(textSize) => useSettings.setState({ textSize })}
      />

      <section className="card mt-5">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-lg font-extrabold">
          <input
            type="checkbox"
            className="accent-primary size-6 shrink-0"
            checked={settings.reduceMotion}
            aria-describedby="motion-hint"
            onChange={(e) => useSettings.setState({ reduceMotion: e.target.checked })}
          />
          {t('settings.motion')}
        </label>
        <p id="motion-hint" className="text-ink-soft mt-1 text-sm">
          {t('settings.motionHint')}
        </p>
      </section>

      <Section title={t('settings.data')}>
        <p className="text-ink-soft -mt-2 mb-4 text-sm">{t('settings.dataHint')}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-quiet" onClick={downloadExport}>
            {t('settings.export')}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => dialog.current?.showModal()}>
            {t('settings.reset')}
          </button>
        </div>
      </Section>

      <Section title={t('settings.about')}>
        <ul className="text-ink-soft space-y-1 text-sm">
          <li>{t('settings.privacy')}</li>
          <li>
            {t('settings.reviewed', { date: formatDate(shared.tools.contentLastReviewed, i18n.language) })}
          </li>
          <li>{t('settings.version', { version: __APP_VERSION__ })}</li>
        </ul>
      </Section>

      {/* Native <dialog>: traps focus and closes on Escape with no extra code. */}
      <dialog
        ref={dialog}
        aria-labelledby="reset-title"
        className="bg-surface text-ink m-auto w-[min(92vw,26rem)] rounded-3xl p-6"
      >
        <h2 id="reset-title" className="font-display text-2xl font-semibold">
          {t('settings.resetTitle')}
        </h2>
        <p className="mt-2">{t('settings.resetBody')}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn btn-quiet" onClick={() => dialog.current?.close()}>
            {t('settings.cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={resetData}>
            {t('settings.resetConfirm')}
          </button>
        </div>
      </dialog>
    </Page>
  );
}
