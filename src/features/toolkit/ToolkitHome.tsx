import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Page } from '@/components/Page';
import { ChevronIcon } from '@/components/icons';

/** The tools, in the order a beginner would use them. */
const TOOLS = ['recipe', 'builder', 'checklist', 'gallery', 'templates', 'tips', 'mine'] as const;

export function ToolkitHome() {
  const { t } = useTranslation();
  return (
    <Page title={t('toolkit.title')}>
      <p className="text-ink-soft mt-2 text-lg">{t('toolkit.intro')}</p>
      <ul className="mt-6 space-y-3">
        {TOOLS.map((tool) => (
          <li key={tool}>
            <Link to={`/prompts/${tool}`} className="card flex items-center justify-between gap-3 px-5 py-4">
              <span>
                <span className="block text-lg leading-snug font-extrabold">{t(`toolkit.tools.${tool}.title`)}</span>
                <span className="text-ink-soft block text-sm">{t(`toolkit.tools.${tool}.text`)}</span>
              </span>
              <ChevronIcon />
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
