import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PromptText } from '@/components/PromptBox';
import { useContent } from '@/i18n';

/** The recipe: one card per ingredient, each with an analogy and a before/after. */
export function RecipePage() {
  const { t } = useTranslation();
  const { recipe } = useContent().toolkit;
  return (
    <Page title={t('toolkit.tools.recipe.title')} back="/prompts">
      <p className="mt-3 text-lg">{recipe.intro}</p>
      <p className="text-ink-soft mt-3">{recipe.note}</p>

      <ol className="mt-6 space-y-4">
        {recipe.elements.map((el, i) => (
          <li key={el.id} className="card">
            <h2 className="font-display text-2xl font-semibold">
              <span className="text-accent-ink">{i + 1}. </span>
              {el.name}
            </h2>
            <p className="mt-1 text-lg font-semibold">{el.oneLine}</p>
            <p className="text-ink-soft mt-2">{el.analogy}</p>

            <h3 className="eyebrow text-ink-soft mt-4 mb-1">{t('toolkit.before')}</h3>
            <PromptText text={el.before} muted />
            <h3 className="eyebrow text-primary mt-3 mb-1">{t('toolkit.after')}</h3>
            <PromptText text={el.after} />
          </li>
        ))}
      </ol>

      <Link to="/prompts/builder" className="btn btn-primary mt-6 w-full">
        {t('toolkit.toBuilder')}
      </Link>
    </Page>
  );
}
