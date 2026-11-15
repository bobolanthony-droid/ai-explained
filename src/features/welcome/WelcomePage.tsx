import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Choice } from '@/components/Choice';
import { Page } from '@/components/Page';
import { useLessons } from '@/features/learn/useLessons';
import { finishWelcome, useProgress } from '@/store/progress';
import { PROMPT_LESSON, type WelcomeAnswers, suggestStart } from '@/store/progressLogic';

const FEELINGS = ['curious', 'overwhelmed', 'sceptical', 'behind'] as const;
const USED = ['never', 'once', 'often'] as const;
const TIME = ['five', 'fifteen', 'more'] as const;

/**
 * First-run screen: three optional questions, then a suggested starting point.
 * Every answer gets a supportive reply; "Skip" is always one tap away.
 * Can be reopened later from the Me tab.
 */
export function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { order, available, byId, numberOf } = useLessons();
  const saved = useProgress((s) => s.welcome);
  const [answers, setAnswers] = useState<WelcomeAnswers>({
    feeling: saved.feeling,
    used: saved.used,
    time: saved.time,
  });
  const [showResult, setShowResult] = useState(false);

  const options = <T extends string>(group: string, values: readonly T[]) =>
    values.map((value) => ({ value, label: t(`welcome.${group}.${value}` as string) }));

  if (showResult) {
    const lesson = byId.get(suggestStart(answers, order, available))!;
    return (
      <Page title={t('welcome.title')} heading={t('welcome.resultTitle')}>
        <div className="mt-4 space-y-3 text-lg">
          {answers.feeling && <p>{t(`welcome.feelingReply.${answers.feeling}`)}</p>}
          {answers.time && <p>{t(`welcome.timeReply.${answers.time}`)}</p>}
          {answers.used === 'often' && lesson.id !== PROMPT_LESSON && <p>{t('welcome.usedOften')}</p>}
        </div>
        <section className="card bg-primary-soft mt-6 border-transparent">
          <h2 className="eyebrow text-primary">{t('welcome.suggestion')}</h2>
          <p className="font-display mt-1 text-xl leading-snug font-semibold">{lesson.title}</p>
          <p className="text-ink-soft mt-1 text-sm">
            {t('learn.lessonNumber', { number: numberOf(lesson.id) })} · {t('learn.minutes', { n: lesson.minutes })}
          </p>
          <Link to={`/learn/${lesson.id}`} className="btn btn-primary mt-4 w-full">
            {t('learn.startButton')}
          </Link>
        </section>
        <Link to="/" className="btn btn-quiet mt-3 w-full">
          {t('welcome.seePath')}
        </Link>
      </Page>
    );
  }

  return (
    <Page title={t('welcome.title')} heading={t('learn.greeting')}>
      <p className="text-ink-soft mt-2 text-lg">{t('welcome.intro')}</p>

      <Choice
        legend={t('welcome.feeling.question')}
        name="feeling"
        value={answers.feeling}
        options={options('feeling', FEELINGS)}
        onChange={(feeling) => setAnswers({ ...answers, feeling })}
      />
      <Choice
        legend={t('welcome.used.question')}
        name="used"
        value={answers.used}
        options={options('used', USED)}
        onChange={(used) => setAnswers({ ...answers, used })}
      />
      <Choice
        legend={t('welcome.time.question')}
        name="time"
        value={answers.time}
        options={options('time', TIME)}
        onChange={(time) => setAnswers({ ...answers, time })}
      />

      <button
        type="button"
        className="btn btn-primary mt-6 w-full"
        onClick={() => {
          finishWelcome(answers);
          setShowResult(true);
          window.scrollTo(0, 0);
        }}
      >
        {t('welcome.submit')}
      </button>
      <button
        type="button"
        className="btn btn-quiet mt-3 w-full"
        onClick={() => {
          finishWelcome({});
          navigate('/');
        }}
      >
        {t('welcome.skip')}
      </button>
    </Page>
  );
}
