/**
 * The user's progress, bookmarks and notes, saved on this device only.
 * The rules live in progressLogic.ts; this file just stores the result.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EMPTY_PROGRESS, type Progress, type WelcomeAnswers, toggle } from './progressLogic';
import { STORAGE_PREFIX } from './settings';

export const useProgress = create<Progress>()(
  persist((): Progress => EMPTY_PROGRESS, { name: `${STORAGE_PREFIX}progress`, version: 1 }),
);

const set = useProgress.setState;

export function visitLesson(lessonId: string) {
  set({ lastLesson: lessonId });
}

export function completeLesson(lessonId: string) {
  set((p) =>
    lessonId in p.completed
      ? p // keep the first completion date
      : { completed: { ...p.completed, [lessonId]: new Date().toISOString().slice(0, 10) } },
  );
}

export function markExerciseTried(exerciseId: string) {
  set((p) =>
    exerciseId in p.exercises ? p : { exercises: { ...p.exercises, [exerciseId]: new Date().toISOString().slice(0, 10) } },
  );
}

export function togglePlanStep(stepId: string) {
  set((p) => ({ plan: toggle(p.plan, stepId) }));
}

export function toggleBookmark(key: string) {
  set((p) => ({ bookmarks: toggle(p.bookmarks, key) }));
}

export function setNote(lessonId: string, text: string) {
  set((p) => {
    const notes = { ...p.notes, [lessonId]: text };
    if (!text.trim()) delete notes[lessonId]; // an emptied note is no note
    return { notes };
  });
}

export function finishWelcome(answers: WelcomeAnswers) {
  set({ welcome: { ...answers, done: true } });
}
