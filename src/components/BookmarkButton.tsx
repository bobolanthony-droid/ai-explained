import { useTranslation } from 'react-i18next';
import { toggleBookmark, useProgress } from '@/store/progress';
import { type BookmarkKind, bookmarkKey } from '@/store/progressLogic';
import { BookmarkIcon } from './icons';

/** "Save for later" toggle for a lesson or a glossary term. */
export function BookmarkButton({ kind, id }: { kind: BookmarkKind; id: string }) {
  const { t } = useTranslation();
  const key = bookmarkKey(kind, id);
  const saved = useProgress((s) => s.bookmarks.includes(key));
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => toggleBookmark(key)}
      className={`btn min-h-11 px-4 text-sm ${saved ? 'bg-primary-soft text-primary' : 'btn-quiet'}`}
    >
      <BookmarkIcon filled={saved} />
      {saved ? t('bookmark.saved') : t('bookmark.save')}
    </button>
  );
}
