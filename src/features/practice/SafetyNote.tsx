import { useTranslation } from 'react-i18next';

/** The "Before you paste anything" reminder, shown on every practice screen. */
export function SafetyNote() {
  const { t } = useTranslation();
  return (
    <aside className="bg-accent-soft mt-5 rounded-3xl p-5">
      <h2 className="eyebrow text-accent-ink">{t('practice.safetyTitle')}</h2>
      <p className="mt-1">{t('practice.safetyBody')}</p>
    </aside>
  );
}
