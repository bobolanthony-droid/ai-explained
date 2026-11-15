import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RichText } from '@/components/RichText';
import { CheckIcon } from '@/components/icons';
import type { FullLesson } from '@/content/lessons';

type Question = FullLesson['quickCheck'][number];

/**
 * Low-stakes questions. No score, no red crosses: every choice gets a kind
 * explanation, and you can simply pick again.
 *
 * The choice is remembered by position, so switching language mid-question
 * keeps your answer.
 */
function QuestionCard({ question, number }: { question: Question; number: number }) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<number | null>(null);
  const chosen = picked === null ? null : question.options[picked];

  return (
    <fieldset className="card mt-4">
      <legend className="float-left mb-3 w-full text-lg leading-snug font-extrabold">
        <span className="text-accent-ink">{number}. </span>
        {question.question}
      </legend>
      <div className="clear-both space-y-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
            className={`flex min-h-12 w-full items-center rounded-2xl border px-4 py-2 text-left font-semibold ${
              picked === i ? 'border-primary bg-primary-soft border-2' : 'border-line-strong'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
      {/* role=status: the reply is read aloud when it appears. */}
      <div role="status">
        {chosen && (
          <div className={`mt-3 rounded-2xl p-4 ${chosen.correct ? 'bg-primary-soft' : 'bg-accent-soft'}`}>
            <p className={`eyebrow flex items-center gap-1 ${chosen.correct ? 'text-primary' : 'text-accent-ink'}`}>
              {chosen.correct && <CheckIcon />}
              {chosen.correct ? t('lesson.correctTag') : t('lesson.retryTag')}
            </p>
            <p className="mt-1">
              <RichText text={chosen.reply} />
            </p>
          </div>
        )}
      </div>
    </fieldset>
  );
}

export function QuickCheck({ questions }: { questions: Question[] }) {
  return (
    <>
      {questions.map((q, i) => (
        <QuestionCard key={i} question={q} number={i + 1} />
      ))}
    </>
  );
}
