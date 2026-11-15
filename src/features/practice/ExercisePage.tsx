import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PromptBox } from '@/components/PromptBox';
import { CheckIcon } from '@/components/icons';
import type { LocaleContent } from '@/content/schema';
import { NotFound } from '@/features/NotFound';
import { markExerciseTried, useProgress } from '@/store/progress';
import { SafetyNote } from './SafetyNote';
import { useExercises } from './useExercises';

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl leading-tight font-semibold">
        <span className="text-accent-ink">{number}. </span>
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * One exercise. The app gives the task; the user does it in an AI tool they
 * already have. Every prompt and the sample text have a one-tap copy button.
 */
export function ExercisePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { byId } = useExercises();
  const exercise = id ? byId.get(id) : undefined;
  const tried = useProgress((s) => (id ? id in s.exercises : false));
  const [checked, setChecked] = useState<Set<number>>(new Set());

  if (!exercise) return <NotFound />;
  // The same exercise in another language, for the "Copy in French/English" buttons.
  const other = (c: LocaleContent) => c.exercises.find((e) => e.id === exercise.id);

  let step = 0;
  return (
    <Page title={exercise.title} back="/practice" kicker={t('learn.minutes', { n: exercise.minutes })}>
      <p className="mt-3 text-xl leading-snug font-semibold">{exercise.goal}</p>
      <SafetyNote />

      {exercise.sampleText && (
        <Step number={++step} title={t('practice.sample')}>
          <p className="text-ink-soft mb-2">{t('practice.sampleHint')}</p>
          <PromptBox text={exercise.sampleText} pickOther={(c) => other(c)?.sampleText} />
        </Step>
      )}

      <Step number={++step} title={t('practice.starter')}>
        <p className="text-ink-soft mb-2">{t('practice.starterHint')}</p>
        <PromptBox text={exercise.starterPrompt} pickOther={(c) => other(c)?.starterPrompt} />
      </Step>

      <Step number={++step} title={t('practice.better')}>
        <p className="mb-2 text-lg">{exercise.better.text}</p>
        <PromptBox text={exercise.better.prompt} pickOther={(c) => other(c)?.better.prompt} />
      </Step>

      <Step number={++step} title={t('practice.good')}>
        <ul className="space-y-3 text-lg">
          {exercise.good.map((line, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-primary mt-1">
                <CheckIcon />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Step>

      <Step number={++step} title={t('practice.selfCheck')}>
        <p className="text-ink-soft mb-2">{t('practice.selfCheckHint')}</p>
        <ul className="card divide-line divide-y p-0">
          {exercise.selfCheck.map((question, i) => (
            <li key={i}>
              <label className="flex min-h-14 cursor-pointer items-center gap-3 px-5 py-3 font-semibold">
                <input
                  type="checkbox"
                  className="accent-primary size-6 shrink-0"
                  checked={checked.has(i)}
                  onChange={() => {
                    const next = new Set(checked);
                    if (!next.delete(i)) next.add(i);
                    setChecked(next);
                  }}
                />
                {question}
              </label>
            </li>
          ))}
        </ul>
      </Step>

      <div className="mt-10" role="status">
        {tried ? (
          <p className="bg-primary-soft text-primary flex items-center gap-2 rounded-2xl p-4 text-lg font-bold">
            <CheckIcon />
            {t('practice.triedDone')}
          </p>
        ) : (
          <button type="button" className="btn btn-primary min-h-14 w-full text-lg" onClick={() => markExerciseTried(exercise.id)}>
            {t('practice.markTried')}
          </button>
        )}
      </div>
    </Page>
  );
}
