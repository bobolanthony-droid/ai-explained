import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Page } from '@/components/Page';
import { RichText } from '@/components/RichText';
import { Simpler } from '@/components/Simpler';
import { CheckIcon } from '@/components/icons';
import { type FullLesson, isFullLesson } from '@/content/lessons';
import { NotFound } from '@/features/NotFound';
import { openTerm } from '@/features/glossary/sheetStore';
import { useGlossary } from '@/features/glossary/useGlossary';
import { useExercises } from '@/features/practice/useExercises';
import { completeLesson, setNote, useProgress, visitLesson } from '@/store/progress';
import { lessonAfter } from '@/store/progressLogic';
import { Figure } from './Figure';
import { PlanChecklist } from './PlanChecklist';
import { QuickCheck } from './QuickCheck';
import { ReadingBar } from './ReadingBar';
import { ToolExamples } from './ToolExamples';
import { useLessons } from './useLessons';

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="mt-2 space-y-3 text-lg">
      {items.map((p, i) => (
        <p key={i}>
          <RichText text={p} />
        </p>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl leading-tight font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function LessonPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { byId, numberOf } = useLessons();
  const lesson = id ? byId.get(id) : undefined;
  const written = lesson !== undefined && isFullLesson(lesson);

  // Remember this lesson for "Continue where you left off".
  useEffect(() => {
    if (written && id) visitLesson(id);
  }, [written, id]);

  if (!lesson) return <NotFound />;
  if (!isFullLesson(lesson)) {
    return (
      <Page title={lesson.title} back="/" kicker={t('learn.lessonNumber', { number: numberOf(lesson.id) })}>
        <div className="card bg-soft mt-6 border-transparent">
          <p className="eyebrow text-accent-ink">{t('stage.comingTitle')}</p>
          <p className="mt-1">{t('stage.lesson')}</p>
        </div>
      </Page>
    );
  }
  // key: a fresh quick check and "simpler" toggle for each lesson.
  return <LessonBody key={lesson.id} lesson={lesson} />;
}

/** The lesson template: always the same seven parts, in the same order. */
function LessonBody({ lesson }: { lesson: FullLesson }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { order, available, numberOf, byId } = useLessons();
  const { terms } = useGlossary();
  const done = useProgress((s) => lesson.id in s.completed);
  const note = useProgress((s) => s.notes[lesson.id] ?? '');

  const introduced = terms.filter((term) => term.lesson === lesson.id);
  const exercises = useExercises().exercises.filter((ex) => ex.lesson === lesson.id);
  const nextId = lessonAfter(order, lesson.id);
  const next = nextId && available.has(nextId) ? byId.get(nextId) : undefined;

  const finish = () => {
    completeLesson(lesson.id);
    navigate(next ? `/learn/${next.id}` : '/');
  };

  return (
    <Page
      title={lesson.title}
      back="/"
      kicker={`${t('learn.lessonNumber', { number: numberOf(lesson.id) })} · ${t('learn.minutes', { n: lesson.minutes })}`}
    >
      <ReadingBar />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <BookmarkButton kind="lesson" id={lesson.id} />
        {done && (
          <span className="text-primary flex items-center gap-1 text-sm font-bold">
            <CheckIcon />
            {t('learn.statusDone')}
          </span>
        )}
      </div>

      {/* 1. Reassurance opener */}
      <p className="bg-primary-soft mt-6 rounded-3xl p-5 text-lg font-semibold">
        <RichText text={lesson.opener} />
      </p>

      {/* 2. The idea in plain words, the even-simpler version, and an analogy */}
      <Section title={t('lesson.idea')}>
        <Paragraphs items={lesson.idea.paragraphs} />
        <Simpler text={lesson.idea.simpler} />
        <div className="card mt-5">
          <h3 className="eyebrow text-primary">{t('glossary.analogy')}</h3>
          <p className="mt-1 text-lg">
            <RichText text={lesson.idea.analogy} />
          </p>
          <p className="text-ink-soft mt-3">
            <RichText text={lesson.idea.analogyLimit} />
          </p>
        </div>
      </Section>

      {/* A bit more: one idea per section */}
      {lesson.sections.map((s, i) => (
        <Section key={i} title={s.title}>
          <Paragraphs items={s.paragraphs} />
          {s.figure && <Figure figure={s.figure} />}
          {s.widget === 'tool-examples' && <ToolExamples />}
          {s.widget === 'thirty-day-plan' && <PlanChecklist />}
        </Section>
      ))}

      {/* 3. Workplace example */}
      <Section title={lesson.example.title}>
        <div className="card mt-3">
          <Paragraphs items={lesson.example.paragraphs} />
        </div>
      </Section>

      {/* 4. Try it */}
      <Section title={t('lesson.tryIt')}>
        <div className="bg-accent-soft mt-3 space-y-3 rounded-3xl p-5 text-lg">
          {lesson.tryIt.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </div>
        {exercises.map((ex) => (
          <Link key={ex.id} to={`/practice/${ex.id}`} className="btn btn-quiet mt-3 w-full">
            {t('lesson.exercise', { title: ex.title })}
          </Link>
        ))}
      </Section>

      {/* 5. Key takeaways */}
      <Section title={t('lesson.takeaways')}>
        <ul className="mt-3 space-y-3 text-lg">
          {lesson.takeaways.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-primary mt-1">
                <CheckIcon />
              </span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {introduced.length > 0 && (
        <Section title={t('lesson.words')}>
          <ul className="mt-3 flex flex-wrap gap-2">
            {introduced.map((term) => (
              <li key={term.id}>
                <button type="button" onClick={() => openTerm(term.id)} className="btn btn-quiet min-h-11 rounded-2xl py-2 text-sm">
                  {term.term}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 6. Quick check */}
      <Section title={t('lesson.quickCheck')}>
        <p className="text-ink-soft mt-1">{t('lesson.quickCheckIntro')}</p>
        <QuickCheck questions={lesson.quickCheck} />
      </Section>

      <Section title={t('lesson.notes')}>
        <label htmlFor="lesson-note" className="text-ink-soft mt-1 block">
          {t('lesson.notesHint')}
        </label>
        <textarea
          id="lesson-note"
          rows={4}
          value={note}
          onChange={(e) => setNote(lesson.id, e.target.value)}
          placeholder={t('lesson.notesPlaceholder')}
          className="bg-surface border-line-strong placeholder:text-ink-soft mt-2 w-full rounded-2xl border p-4 text-lg"
        />
      </Section>

      {/* 7. Next lesson */}
      <div className="mt-10">
        <button type="button" onClick={finish} className="btn btn-primary min-h-14 w-full text-lg">
          {next ? t('lesson.doneNext') : t('lesson.doneBack')}
        </button>
        {next && (
          <p className="text-ink-soft mt-2 text-center text-sm">
            {t('lesson.nextIs', { title: next.title })}
          </p>
        )}
      </div>
    </Page>
  );
}
