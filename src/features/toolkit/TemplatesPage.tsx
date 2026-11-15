import { useTranslation } from 'react-i18next';
import { FavouriteButton } from '@/components/FavouriteButton';
import { Page } from '@/components/Page';
import { PromptBox } from '@/components/PromptBox';
import { useContent } from '@/i18n';

/** Copy-able, fill-in-the-blank prompts for common work tasks. */
export function TemplatesPage() {
  const { t } = useTranslation();
  const { templates } = useContent().toolkit;
  return (
    <Page title={t('toolkit.tools.templates.title')} back="/prompts">
      <p className="text-ink-soft mt-2 text-lg">{t('toolkit.templates.intro')}</p>
      <ul className="mt-5 space-y-4">
        {templates.map((tpl) => (
          <li key={tpl.id} className="card">
            <h2 className="text-xl leading-snug font-extrabold">{tpl.title}</h2>
            <p className="text-ink-soft mb-3">{tpl.use}</p>
            <PromptBox text={tpl.prompt} pickOther={(c) => c.toolkit.templates.find((x) => x.id === tpl.id)?.prompt}>
              <FavouriteButton kind="template" id={tpl.id} />
            </PromptBox>
          </li>
        ))}
      </ul>
    </Page>
  );
}
