import { describe, expect, it } from 'vitest';
import { loadLocale, loadShared } from '../../scripts/content-lib';
import { isFullLesson } from '../../src/content/lessons';
import { LocaleContentSchema, SharedSchema } from '../../src/content/schema';
import { crossCheck } from '../../src/content/validate';
import {
  bookmarkKey,
  doneCount,
  journey,
  lessonAfter,
  resume,
  suggestStart,
  toggle,
} from '../../src/store/progressLogic';

const order = ['a', 'b', 'c'];
const all = new Set(order);

describe('journey', () => {
  it('marks done steps and exactly one next step', () => {
    expect(journey(order, {})).toEqual({ a: 'next', b: 'todo', c: 'todo' });
    expect(journey(order, { a: '2026-01-01' })).toEqual({ a: 'done', b: 'next', c: 'todo' });
    // Lessons can be done in any order: the next step is the first one not done.
    expect(journey(order, { b: '2026-01-01' })).toEqual({ a: 'next', b: 'done', c: 'todo' });
    expect(journey(order, { a: 'x', b: 'x', c: 'x' })).toEqual({ a: 'done', b: 'done', c: 'done' });
  });
  it('counts only lessons that are on the path', () => {
    expect(doneCount(order, { a: 'x', removed: 'x' })).toBe(1);
  });
});

describe('resume ("continue where you left off")', () => {
  it('offers the first lesson to a new user', () => {
    expect(resume(order, all, { completed: {}, lastLesson: null })).toEqual({ kind: 'start', lessonId: 'a' });
  });
  it('goes back to a lesson that was opened but not finished', () => {
    expect(resume(order, all, { completed: { a: 'x' }, lastLesson: 'c' })).toEqual({ kind: 'continue', lessonId: 'c' });
  });
  it('offers the next lesson after one is finished', () => {
    expect(resume(order, all, { completed: { a: 'x' }, lastLesson: 'a' })).toEqual({ kind: 'next', lessonId: 'b' });
  });
  it('says "soon" when the next lesson is not written yet', () => {
    expect(resume(order, new Set(['a']), { completed: { a: 'x' }, lastLesson: 'a' })).toEqual({ kind: 'soon', lessonId: 'b' });
  });
  it('says finished when everything is done', () => {
    expect(resume(order, all, { completed: { a: 'x', b: 'x', c: 'x' }, lastLesson: 'c' })).toEqual({ kind: 'finished' });
  });
});

describe('small helpers', () => {
  it('lessonAfter', () => {
    expect(lessonAfter(order, 'a')).toBe('b');
    expect(lessonAfter(order, 'c')).toBeNull();
    expect(lessonAfter(order, 'nope')).toBeNull();
  });
  it('toggle adds then removes a bookmark', () => {
    const key = bookmarkKey('term', 'prompt');
    expect(toggle([], key)).toEqual(['term:prompt']);
    expect(toggle(['term:prompt', 'lesson:a'], key)).toEqual(['lesson:a']);
  });
});

describe('suggestStart (welcome questions)', () => {
  const path = ['not-late', 'how', 'good-prompt'];
  it('starts beginners at the beginning', () => {
    expect(suggestStart({ used: 'never' }, path, new Set(path))).toBe('not-late');
    expect(suggestStart({}, path, new Set(path))).toBe('not-late');
  });
  it('sends regular users to the prompt lesson, if it is written', () => {
    expect(suggestStart({ used: 'often' }, path, new Set(path))).toBe('good-prompt');
    expect(suggestStart({ used: 'often' }, path, new Set(['not-late']))).toBe('not-late');
  });
});

describe('lesson validation', () => {
  const shared = SharedSchema.parse(loadShared());
  const en = LocaleContentSchema.parse(loadLocale('en'));
  const first = en.lessons.find((l) => l.id === 'not-late')!;
  const withFirst = (patch: object) =>
    crossCheck(shared, { ...en, lessons: en.lessons.map((l) => (l === first ? { ...l, ...patch } : l)) }, 'en').join('\n');

  it('lesson 1 is fully written in every language', () => {
    expect(isFullLesson(first)).toBe(true);
    const fr = LocaleContentSchema.parse(loadLocale('fr'));
    expect(isFullLesson(fr.lessons.find((l) => l.id === 'not-late')!)).toBe(true);
  });
  it('flags a half-written lesson', () => {
    expect(withFirst({ takeaways: undefined })).toContain('half-written, missing: takeaways');
  });
  it('flags a question without exactly one correct option', () => {
    const q = first.quickCheck![0];
    const none = { ...q, options: q.options.map((o) => ({ text: o.text, reply: o.reply })) };
    expect(withFirst({ quickCheck: [none, ...first.quickCheck!.slice(1)] })).toContain('needs exactly one correct option (has 0)');
  });
  it('flags a lesson that never links a term it introduces', () => {
    expect(withFirst({ sections: [] })).toContain('never links it with [[machine-learning]]');
  });
});
