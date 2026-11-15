import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { shared } from 'virtual:content-index';
import { Choice } from '@/components/Choice';
import { CopyButton } from '@/components/CopyButton';
import { Page } from '@/components/Page';
import { LESSON_ORDER } from '@/features/learn/useLessons';
import { useContent } from '@/i18n';
import { useProgress } from '@/store/progress';
import { doneCount } from '@/store/progressLogic';
import { useSettings } from '@/store/settings';
import { type Answers, MAX_TEXT, buildPayload, cleanAnswers, formatForCopy, sendFeedback } from './feedbackLogic';

/**
 * A short, optional feedback form. This is the only place where anything
 * leaves the device, and only when the person presses "Send".
 * If sending fails (or is not set up), they can copy their answers instead.
 */
export function FeedbackPage() {
  const { t } = useTranslation();
  const text = useContent().feedback;
  const { questions, endpoint, accessKey } = shared.feedback;
  const locale = useSettings((s) => s.locale);
  const completed = useProgress((s) => s.completed);

  const [answers, setAnswers] = useState<Answers>({});
  const [state, setState] = useState<'idle' | 'empty' | 'sending' | 'sent' | 'failed'>('idle');
  const set = (id: string, value: string) => {
    setAnswers({ ...answers, [id]: value });
    if (state !== 'sending') setState('idle');
  };

  const clean = cleanAnswers(questions, answers);
  const copyText = clean
    ? formatForCopy(
        questions,
        clean,
        (id) => text.questions[id].label,
        (id, option) => text.questions[id].options?.[option] ?? option,
      )
    : '';

  const submit = async () => {
    if (!clean) return setState('empty');
    if (!endpoint) return setState('failed');
    setState('sending');
    const payload = buildPayload(
      clean,
      { language: locale, lessonsDone: doneCount(LESSON_ORDER, completed), version: __APP_VERSION__ },
      accessKey || undefined,
    );
    setState((await sendFeedback(endpoint, payload)) ? 'sent' : 'failed');
  };

  if (state === 'sent') {
    return (
      <Page title={text.title} heading={text.sentTitle}>
        <p className="mt-3 text-lg">{text.sentBody}</p>
        <Link to="/" className="btn btn-primary mt-6 w-full">
          {t('notFound.home')}
        </Link>
      </Page>
    );
  }

  return (
    <Page title={text.title} back="/me">
      <p className="mt-3 text-lg">{text.intro}</p>
      <p className="text-ink-soft mt-3">{text.privacy}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {questions.map((q) => {
          const wording = text.questions[q.id];
          if (q.type === 'choice') {
            return (
              <Choice
                key={q.id}
                legend={wording.label}
                name={`feedback-${q.id}`}
                value={answers[q.id]}
                options={(q.options ?? []).map((value) => ({ value, label: wording.options?.[value] ?? value }))}
                onChange={(value) => set(q.id, value)}
              />
            );
          }
          return (
            <div key={q.id} className="card mt-5">
              <label htmlFor={`feedback-${q.id}`} className="block text-lg font-extrabold">
                {wording.label}
              </label>
              <textarea
                id={`feedback-${q.id}`}
                rows={3}
                maxLength={MAX_TEXT}
                value={answers[q.id] ?? ''}
                onChange={(e) => set(q.id, e.target.value)}
                className="bg-bg border-line-strong mt-2 w-full rounded-2xl border p-3"
              />
            </div>
          );
        })}

        <p className="text-ink-soft mt-5 text-sm">{text.alsoSent}</p>
        <button type="submit" className="btn btn-primary mt-3 min-h-14 w-full text-lg" disabled={state === 'sending'}>
          {state === 'sending' ? text.sending : text.send}
        </button>
      </form>

      {/* role=status: the outcome is announced to screen readers. */}
      <div role="status" className="mt-4">
        {state === 'empty' && <p className="font-semibold">{text.empty}</p>}
        {state === 'failed' && (
          <div className="bg-accent-soft rounded-2xl p-4">
            <p>{endpoint ? text.failed : text.notReady}</p>
            {copyText && (
              <div className="mt-3">
                <CopyButton text={copyText} label={text.copy} />
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
