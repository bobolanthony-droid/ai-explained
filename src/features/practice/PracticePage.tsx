import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Page } from '@/components/Page';
import { CheckIcon, ChevronIcon } from '@/components/icons';
import { useProgress } from '@/store/progress';
import { SafetyNote } from './SafetyNote';
import { useExercises } from './useExercises';

/** The list of hands-on exercises. */
export function PracticePage() {
  const { t } = useTranslation();
  const { exercises } = useExercises();
  const tried = useProgress((s) => s.exercises);
  return (
    <Page title={t('practice.title')}>
      <p className="text-ink-soft mt-2 text-lg">{t('practice.intro')}</p>
      <SafetyNote />
      <ul className="mt-5 space-y-3">
        {exercises.map((ex) => (
          <li key={ex.id}>
            <Link to={`/practice/${ex.id}`} className="card flex items-center justify-between gap-3 px-5 py-4">
              <span>
                <span className="block text-lg leading-snug font-extrabold">{ex.title}</span>
                <span className="text-ink-soft block text-sm">{ex.goal}</span>
                <span className="text-ink-soft mt-1 flex flex-wrap items-center gap-x-3 text-sm font-bold">
                  {t('learn.minutes', { n: ex.minutes })}
                  {ex.id in tried && (
                    <span className="text-primary flex items-center gap-1">
                      <CheckIcon />
                      {t('practice.tried')}
                    </span>
                  )}
                </span>
              </span>
              <ChevronIcon />
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
