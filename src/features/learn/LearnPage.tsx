import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { shared } from 'virtual:content-index';
import { Page } from '@/components/Page';
import { CheckIcon, ChevronIcon } from '@/components/icons';
import { useContent } from '@/i18n';
import { useProgress } from '@/store/progress';
import { doneCount, journey, resume } from '@/store/progressLogic';
import { useLessons } from './useLessons';

/** The card at the top: start, continue, or a calm "all done". */
function ResumeCard() {
  const { t } = useTranslation();
  const { order, available, byId, numberOf } = useLessons();
  const progress = useProgress();
  const target = resume(order, available, progress);

  if (target.kind === 'finished') {
    return (
      <section className="card bg-primary-soft mt-6 border-transparent">
        <h2 className="font-display text-xl font-semibold">{t('learn.finishedTitle')}</h2>
        <p className="mt-1">{t('learn.finishedBody')}</p>
      </section>
    );
  }

  const lesson = byId.get(target.lessonId)!;
  const label = { start: 'learn.startLabel', continue: 'learn.continueLabel', next: 'learn.nextLabel', soon: 'learn.nextLabel' }[
    target.kind
  ];
  return (
    <section aria-labelledby="resume" className="card bg-primary-soft mt-6 border-transparent">
      <h2 id="resume" className="eyebrow text-primary">
        {t(label)}
      </h2>
      <p className="font-display mt-1 text-xl leading-snug font-semibold">{lesson.title}</p>
      <p className="text-ink-soft mt-1 text-sm">
        {t('learn.lessonNumber', { number: numberOf(lesson.id) })} · {t('learn.minutes', { n: lesson.minutes })}
      </p>
      {target.kind === 'soon' ? (
        <p className="mt-3 text-sm">{t('stage.lesson')}</p>
      ) : (
        <Link to={`/learn/${lesson.id}`} className="btn btn-primary mt-4 w-full">
          {t(target.kind === 'continue' ? 'learn.continueButton' : 'learn.startButton')}
        </Link>
      )}
    </section>
  );
}

export function LearnPage() {
  const { t } = useTranslation();
  const content = useContent();
  const { order, available, byId, numberOf } = useLessons();
  const completed = useProgress((s) => s.completed);
  const welcomed = useProgress((s) => s.welcome.done);

  // First visit: the optional welcome questions (they can be skipped in one tap).
  if (!welcomed) return <Navigate to="/welcome" replace />;

  const status = journey(order, completed);
  const done = doneCount(order, completed);

  return (
    <Page title={t('learn.title')} heading={t('learn.greeting')}>
      <p className="text-ink-soft mt-2 text-lg">{t('learn.intro')}</p>

      <ResumeCard />

      <h2 className="font-display mt-10 text-2xl font-semibold">{t('learn.journey')}</h2>
      {/* A gentle count, not a score: no percentages, no streaks. */}
      <p className="text-ink-soft mt-1 text-sm">{t('learn.doneCount', { done, total: order.length })}</p>

      {shared.path.modules.map((m) => {
        const mod = content.path.modules[m.id];
        return (
          <section key={m.id} aria-labelledby={`module-${m.id}`} className="mt-6">
            <h3 id={`module-${m.id}`} className="text-primary text-lg font-extrabold">
              {mod.title}
            </h3>
            <p className="text-ink-soft text-sm">
              {mod.blurb} · {t('learn.lessonCount', { count: m.lessons.length })}
            </p>
            {/* The dotted line between the numbered stones is the "path". */}
            <ol className="mt-4">
              {m.lessons.map((id) => {
                const lesson = byId.get(id)!;
                const number = numberOf(id);
                const isDone = status[id] === 'done';
                const open = available.has(id);
                const text = (
                  <>
                    <span className="block leading-snug font-bold">
                      <span className="sr-only">
                        {t('learn.lessonNumber', { number })}
                        {isDone ? ` (${t('learn.statusDone')})` : ''}.{' '}
                      </span>
                      {lesson.title}
                    </span>
                    <span className="text-ink-soft mt-0.5 block text-sm">
                      {lesson.summary} · {open ? t('learn.minutes', { n: lesson.minutes }) : t('learn.soon')}
                    </span>
                  </>
                );
                return (
                  <li
                    key={id}
                    className="before:border-accent relative pb-5 pl-14 before:absolute before:top-11 before:bottom-1 before:left-5 before:border-l-2 before:border-dotted last:pb-0 last:before:hidden"
                  >
                    {/* Stone: a tick when done, a ring on the next step, the number otherwise. */}
                    <span
                      aria-hidden="true"
                      className={`absolute top-0 left-0 flex size-10 items-center justify-center rounded-full border-2 font-extrabold ${
                        isDone
                          ? 'bg-primary border-primary text-primary-ink'
                          : `border-accent bg-accent-soft text-accent-ink ${status[id] === 'next' ? 'ring-accent/40 ring-4' : ''}`
                      }`}
                    >
                      {isDone ? <CheckIcon /> : number}
                    </span>
                    {open ? (
                      <Link to={`/learn/${id}`} className="block min-h-11">
                        {text}
                      </Link>
                    ) : (
                      <div>{text}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      <Link to="/me/why" className="card row-link mt-10">
        {t('learn.whyLink')}
        <ChevronIcon />
      </Link>
    </Page>
  );
}
