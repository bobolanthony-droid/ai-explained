import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { shared } from 'virtual:content-index';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Page } from '@/components/Page';
import { RichText } from '@/components/RichText';
import { Simpler } from '@/components/Simpler';
import { isFullLesson } from '@/content/lessons';
import { NotFound } from '@/features/NotFound';
import { useContent } from '@/i18n';
import { OtherNames } from './OtherNames';
import { useGlossary } from './useGlossary';

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="card mt-4">
      <h2 className="eyebrow text-primary">{label}</h2>
      <p className="mt-1 text-lg">{children}</p>
    </section>
  );
}

export function TermPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { byId } = useGlossary();
  const content = useContent();
  const term = id ? byId.get(id) : undefined;
  if (!term) return <NotFound />;

  const lessonNumber = shared.path.modules.flatMap((m) => m.lessons).indexOf(term.lesson) + 1;
  const lesson = content.lessons.find((l) => l.id === term.lesson);

  return (
    <Page title={term.term} back="/glossary">
      <OtherNames names={term.otherNames} />
      <p className="text-ink-soft mt-2 text-sm font-bold">{t(`glossary.categories.${term.category}`)}</p>
      <div className="mt-3">
        <BookmarkButton kind="term" id={term.id} />
      </div>

      {/* 1. The one-line definition, then the optional "even simpler" version. */}
      <p className="mt-4 text-xl leading-snug font-semibold">
        <RichText text={term.definition} />
      </p>
      {/* key: start closed again when moving to another term */}
      <Simpler key={term.id} text={term.simpler} />

      {/* 2. Analogy, 3. workplace example, then how it sounds in real life. */}
      <div className="mt-6">
        <Block label={t('glossary.analogy')}>
          <RichText text={term.analogy} />
        </Block>
        <Block label={t('glossary.example')}>
          <RichText text={term.example} />
        </Block>
        <Block label={t('glossary.heardAs')}>
          <RichText text={term.heardAs} />
        </Block>
        {term.usageNote && (
          <Block label={t('glossary.usageNote')}>
            <RichText text={term.usageNote} />
          </Block>
        )}
      </div>

      {term.related.length > 0 && (
        <section aria-labelledby="related" className="mt-8">
          <h2 id="related" className="text-lg font-extrabold">
            {t('glossary.related')}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {term.related.map((rid) => (
              <li key={rid}>
                <Link to={`/glossary/${rid}`} className="btn btn-quiet min-h-11 rounded-2xl py-2 text-sm">
                  {byId.get(rid)?.term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lesson && (
        <section aria-labelledby="taught-in" className="mt-8">
          <h2 id="taught-in" className="text-lg font-extrabold">
            {t('glossary.taughtIn')}
          </h2>
          {isFullLesson(lesson) ? (
            <Link to={`/learn/${lesson.id}`} className="text-primary mt-1 inline-flex min-h-11 items-center font-bold underline">
              {t('learn.lessonNumber', { number: lessonNumber })} · {lesson.title}
            </Link>
          ) : (
            <p className="text-ink-soft mt-1">
              {t('learn.lessonNumber', { number: lessonNumber })} · {lesson.title}
            </p>
          )}
        </section>
      )}
    </Page>
  );
}
