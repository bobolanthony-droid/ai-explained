import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { shared } from 'virtual:content-index';
import { Page } from '@/components/Page';
import { ChevronIcon } from '@/components/icons';
import { useGlossary } from '@/features/glossary/useGlossary';
import { useLessons } from '@/features/learn/useLessons';
import { useContent } from '@/i18n';
import { useProgress } from '@/store/progress';
import { doneCount } from '@/store/progressLogic';

function Group({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-extrabold">{title}</h2>
      {children.length ? (
        <ul className="card divide-line mt-3 divide-y p-0">{children}</ul>
      ) : (
        <p className="text-ink-soft mt-1">{empty}</p>
      )}
    </section>
  );
}

export function MePage() {
  const { t } = useTranslation();
  const { order, byId, numberOf } = useLessons();
  const { byId: termById } = useGlossary();
  const progress = useProgress();
  const content = useContent();

  // Bookmarks are stored as "lesson:id" / "term:id"; show them in this language.
  const bookmarks = progress.bookmarks.flatMap((key) => {
    const [kind, id] = key.split(':');
    const lesson = kind === 'lesson' ? byId.get(id) : undefined;
    const term = kind === 'term' ? termById.get(id) : undefined;
    if (lesson) return [{ key, to: `/learn/${id}`, label: lesson.title, kind: t('learn.lessonNumber', { number: numberOf(id) }) }];
    if (term) return [{ key, to: `/glossary/${id}`, label: term.term, kind: t('nav.glossary') }];
    return []; // content that no longer exists
  });
  const notes = order.filter((id) => progress.notes[id]).map((id) => ({ id, lesson: byId.get(id)!, text: progress.notes[id] }));

  return (
    <Page title={t('me.title')}>
      <section className="card bg-primary-soft mt-6 border-transparent">
        <h2 className="eyebrow text-primary">{t('learn.journey')}</h2>
        <p className="font-display mt-1 text-xl font-semibold">
          {t('learn.doneCount', { done: doneCount(order, progress.completed), total: order.length })}
        </p>
        <p className="mt-1 text-sm">{t('me.pace')}</p>
      </section>

      <Group title={t('me.bookmarks')} empty={t('me.noBookmarks')}>
        {bookmarks.map((b) => (
          <li key={b.key}>
            <Link to={b.to} className="row-link">
              <span>
                <span className="text-ink-soft block text-sm font-normal">{b.kind}</span>
                {b.label}
              </span>
              <ChevronIcon />
            </Link>
          </li>
        ))}
      </Group>

      <Group title={t('me.notes')} empty={t('me.noNotes')}>
        {notes.map((n) => (
          <li key={n.id}>
            <Link to={`/learn/${n.id}`} className="row-link">
              <span className="min-w-0">
                <span className="block">{n.lesson.title}</span>
                <span className="text-ink-soft line-clamp-3 text-sm font-normal whitespace-pre-line">{n.text}</span>
              </span>
              <ChevronIcon />
            </Link>
          </li>
        ))}
      </Group>

      <ul className="card divide-line mt-8 divide-y p-0">
        <li>
          <Link to="/prompts/mine" className="row-link">
            {t('toolkit.tools.mine.title')}
            <ChevronIcon />
          </Link>
        </li>
        <li>
          <Link to="/me/plan" className="row-link">
            {content.pages.plan.title}
            <ChevronIcon />
          </Link>
        </li>
        <li>
          <Link to="/me/settings" className="row-link">
            {t('me.settings')}
            <ChevronIcon />
          </Link>
        </li>
        <li>
          <Link to="/welcome" className="row-link">
            {t('me.welcome')}
            <ChevronIcon />
          </Link>
        </li>
        {shared.feedback.endpoint && (
          <li>
            <Link to="/feedback" className="row-link">
              {content.feedback.title}
              <ChevronIcon />
            </Link>
          </li>
        )}
        <li>
          <Link to="/me/why" className="row-link">
            {t('me.why')}
            <ChevronIcon />
          </Link>
        </li>
      </ul>
    </Page>
  );
}
