import { useMemo } from 'react';
import { shared } from 'virtual:content-index';
import { isFullLesson } from '@/content/lessons';
import { useContent } from '@/i18n';

/** Lesson order on the path (language-independent). */
export const LESSON_ORDER = shared.path.modules.flatMap((m) => m.lessons);

export function useLessons() {
  const content = useContent();
  return useMemo(() => {
    const byId = new Map(content.lessons.map((l) => [l.id, l]));
    /** Lessons whose text is written (the others show as "being written"). */
    const available = new Set(content.lessons.filter(isFullLesson).map((l) => l.id));
    const numberOf = (id: string) => LESSON_ORDER.indexOf(id) + 1;
    return { order: LESSON_ORDER, byId, available, numberOf };
  }, [content]);
}
