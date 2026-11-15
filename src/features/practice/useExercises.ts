import { useMemo } from 'react';
import { shared } from 'virtual:content-index';
import type { Exercise } from '@/content/schema';
import { useContent } from '@/i18n';

/** An exercise in this language, plus the lesson it goes with. */
export type ExerciseView = Exercise & { lesson: string };

/** Exercises in the order set by content/shared/practice.yaml. */
export function useExercises() {
  const content = useContent();
  return useMemo(() => {
    const wording = new Map(content.exercises.map((e) => [e.id, e]));
    const exercises: ExerciseView[] = shared.practice.exercises.map((s) => ({
      ...wording.get(s.id)!, // guaranteed by the build-time validator
      lesson: s.lesson,
    }));
    return { exercises, byId: new Map(exercises.map((e) => [e.id, e])) };
  }, [content]);
}
