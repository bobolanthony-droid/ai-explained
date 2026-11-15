import { describe, expect, it } from 'vitest';
import { loadLocale, loadShared } from '../../scripts/content-lib';
import { LocaleContentSchema, SharedSchema } from '../../src/content/schema';
import { crossCheck } from '../../src/content/validate';
import { type Question, buildPayload, cleanAnswers, formatForCopy } from '../../src/features/feedback/feedbackLogic';

const questions: Question[] = [
  { id: 'clarity', type: 'choice', options: ['very-clear', 'mostly-clear'] },
  { id: 'missing', type: 'text' },
];

describe('feedback answers', () => {
  it('keeps only answered questions, trimmed', () => {
    expect(cleanAnswers(questions, { clarity: 'mostly-clear', missing: '  more examples  ' })).toEqual({
      clarity: 'mostly-clear',
      missing: 'more examples',
    });
  });
  it('returns null when nothing is answered', () => {
    expect(cleanAnswers(questions, {})).toBeNull();
    expect(cleanAnswers(questions, { missing: '   ' })).toBeNull();
  });
  it('drops a choice that is not one of the options, and cuts very long text', () => {
    expect(cleanAnswers(questions, { clarity: 'made-up' })).toBeNull();
    expect(cleanAnswers(questions, { missing: 'x'.repeat(5000) })!.missing).toHaveLength(1500);
  });
});

describe('feedback payload', () => {
  it('sends the answers plus language, lessons done and version, and nothing personal', () => {
    const payload = buildPayload({ clarity: 'very-clear' }, { language: 'fr', lessonsDone: 3, version: '0.1.0' });
    expect(payload).toEqual({ clarity: 'very-clear', language: 'fr', lessons_done: '3', app_version: '0.1.0' });
  });
  it('adds an access key only when one is configured', () => {
    expect(buildPayload({}, { language: 'en', lessonsDone: 0, version: '1' }, 'key').access_key).toBe('key');
  });
  it('formats answers as readable text for copying', () => {
    const text = formatForCopy(
      questions,
      { clarity: 'mostly-clear', missing: 'More examples' },
      (id) => `Q:${id}`,
      (_, option) => option.toUpperCase(),
    );
    expect(text).toBe('Q:clarity\nMOSTLY-CLEAR\n\nQ:missing\nMore examples');
  });
});

describe('feedback content', () => {
  const shared = SharedSchema.parse(loadShared());
  it('every question and option has wording in every language', () => {
    for (const code of ['en', 'fr']) {
      const content = LocaleContentSchema.parse(loadLocale(code));
      expect(crossCheck(shared, content, code).filter((p) => p.includes('feedback'))).toEqual([]);
    }
  });
  it('flags an option without a label', () => {
    const en = LocaleContentSchema.parse(loadLocale('en'));
    const broken = { ...en, feedback: { ...en.feedback, questions: { ...en.feedback.questions, recommend: { label: 'x' } } } };
    expect(crossCheck(shared, broken, 'en').join('\n')).toContain('option "yes" has no label');
  });
});
