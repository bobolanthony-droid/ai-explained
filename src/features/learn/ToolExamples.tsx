import { useTranslation } from 'react-i18next';
import { shared } from 'virtual:content-index';
import { formatDate } from '@/i18n';

/**
 * Named examples of each kind of tool. This is the only place in the app where
 * products are named; the list comes from content/shared/tools.yaml and shows
 * the date it was last reviewed, so readers can judge how fresh it is.
 */
export function ToolExamples() {
  const { t, i18n } = useTranslation();
  return (
    <aside className="card mt-4">
      <h3 className="eyebrow text-primary">{t('tools.title')}</h3>
      <dl className="mt-2 space-y-3">
        {shared.tools.tools.map((group) => (
          <div key={group.type}>
            <dt className="font-extrabold">{t(`tools.types.${group.type}`)}</dt>
            <dd className="text-ink-soft">{group.examples.join(', ')}</dd>
          </div>
        ))}
      </dl>
      <p className="text-ink-soft mt-3 text-sm">{t('tools.note')}</p>
      <p className="text-ink-soft mt-1 text-sm">
        {t('tools.reviewed', { date: formatDate(shared.tools.lastReviewed, i18n.language) })}
      </p>
    </aside>
  );
}
