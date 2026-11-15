/**
 * Progress rules as pure functions (no storage, no React), so they are easy to test.
 *
 * Everything is keyed by content ID ("not-late", "prompt"), never by language,
 * so switching language never loses progress.
 */

export type WelcomeAnswers = {
  feeling?: 'curious' | 'overwhelmed' | 'sceptical' | 'behind';
  used?: 'never' | 'once' | 'often';
  time?: 'five' | 'fifteen' | 'more';
};

export type Progress = {
  /** lessonId -> date it was finished (YYYY-MM-DD). */
  completed: Record<string, string>;
  /** The lesson most recently opened. */
  lastLesson: string | null;
  /** "lesson:not-late" or "term:prompt". */
  bookmarks: string[];
  /** lessonId -> the user's own notes. */
  notes: Record<string, string>;
  /** exerciseId -> date it was tried (YYYY-MM-DD). */
  exercises: Record<string, string>;
  /** Ticked steps of the 30-day plan ("week-1"...). */
  plan: string[];
  welcome: WelcomeAnswers & { done: boolean };
};

export const EMPTY_PROGRESS: Progress = {
  completed: {},
  lastLesson: null,
  bookmarks: [],
  notes: {},
  exercises: {},
  plan: [],
  welcome: { done: false },
};

export type BookmarkKind = 'lesson' | 'term';
export const bookmarkKey = (kind: BookmarkKind, id: string) => `${kind}:${id}`;

/** Add the item if absent, remove it if present. */
export function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function doneCount(order: string[], completed: Progress['completed']): number {
  return order.filter((id) => id in completed).length;
}

export type StepStatus = 'done' | 'next' | 'todo';

/** Status of each step on the journey. Exactly one step is "next" until all are done. */
export function journey(order: string[], completed: Progress['completed']): Record<string, StepStatus> {
  const next = order.find((id) => !(id in completed));
  return Object.fromEntries(
    order.map((id) => [id, id in completed ? 'done' : id === next ? 'next' : 'todo']),
  );
}

export type Resume =
  | { kind: 'start' | 'continue' | 'next'; lessonId: string }
  /** The next lesson exists on the path but is not written yet. */
  | { kind: 'soon'; lessonId: string }
  | { kind: 'finished' };

/**
 * What the "Continue where you left off" card should offer.
 * @param available lessons whose text is written
 */
export function resume(order: string[], available: Set<string>, p: Pick<Progress, 'completed' | 'lastLesson'>): Resume {
  // Opened but not finished: go back to it.
  if (p.lastLesson && available.has(p.lastLesson) && !(p.lastLesson in p.completed)) {
    return { kind: 'continue', lessonId: p.lastLesson };
  }
  const next = order.find((id) => !(id in p.completed));
  if (!next) return { kind: 'finished' };
  if (!available.has(next)) return { kind: 'soon', lessonId: next };
  const started = p.lastLesson !== null || Object.keys(p.completed).length > 0;
  return { kind: started ? 'next' : 'start', lessonId: next };
}

/** The lesson after this one on the path, if any. */
export function lessonAfter(order: string[], lessonId: string): string | null {
  const i = order.indexOf(lessonId);
  return i >= 0 && i < order.length - 1 ? order[i + 1] : null;
}

/** The lesson where regular AI users may prefer to begin. */
export const PROMPT_LESSON = 'good-prompt';

/**
 * Suggested starting lesson from the welcome questions.
 * People who already use AI fairly often can jump to the prompt lesson;
 * everyone else starts at the beginning. Falls back to the first lesson
 * if the suggested one is not written yet.
 */
export function suggestStart(answers: WelcomeAnswers, order: string[], available: Set<string>): string {
  const wanted = answers.used === 'often' ? PROMPT_LESSON : order[0];
  return available.has(wanted) ? wanted : order[0];
}
