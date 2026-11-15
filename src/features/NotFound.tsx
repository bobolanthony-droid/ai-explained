import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Page } from '@/components/Page';

export function NotFound() {
  const { t } = useTranslation();
  return (
    <Page title={t('notFound.title')}>
      <p className="text-ink-soft mt-3">{t('notFound.body')}</p>
      <Link to="/" className="btn btn-primary mt-6">
        {t('notFound.home')}
      </Link>
    </Page>
  );
}
