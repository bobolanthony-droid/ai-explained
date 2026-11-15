/** Small lesson helpers shared by the app and the validator (no Zod import here). */
import type { Lesson } from './schema';

/** Everything after the header. A written lesson has all of these. */
export const LESSON_BODY_FIELDS = [
  'opener',
  'idea',
  'sections',
  'example',
  'tryIt',
  'takeaways',
  'quickCheck',
] as const;

/** A lesson whose text is written (not just its title on the journey). */
export type FullLesson = Required<Lesson>;

export function isFullLesson(lesson: Lesson): lesson is FullLesson {
  return LESSON_BODY_FIELDS.every((f) => lesson[f] !== undefined);
}
