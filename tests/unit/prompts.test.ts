import { describe, expect, it } from 'vitest';
import { loadLocale, loadShared } from '../../scripts/content-lib';
import { PLACEHOLDER, splitPlaceholders } from '../../src/content/richtext';
import { LocaleContentSchema, SharedSchema } from '../../src/content/schema';
import { crossCheck } from '../../src/content/validate';
import { addPrompt, buildPrompt, defaultTitle, removePrompt, updatePrompt } from '../../src/store/promptsLogic';

const elements = [
  { id: 'role' as const, label: 'Role:' },
  { id: 'task' as const, label: 'Task:' },
  { id: 'format' as const, label: 'Format:' },
];

describe('buildPrompt (Prompt builder)', () => {
  it('works with only the task filled in', () => {
    expect(buildPrompt(elements, { task: 'Write a note' })).toBe('Task: Write a note');
  });
  it('joins filled boxes in recipe order and skips empty ones', () => {
    expect(buildPrompt(elements, { format: ' A table ', role: 'An HR manager', task: '   ' })).toBe(
      'Role: An HR manager\n\nFormat: A table',
    );
  });
  it('is empty when nothing is typed', () => {
    expect(buildPrompt(elements, {})).toBe('');
  });
});

describe('My prompts', () => {
  it('names an untitled prompt after its first words', () => {
    expect(defaultTitle('Summarise this email in three bullet points please')).toBe('Summarise this email in three bullet…');
    expect(defaultTitle('Short one')).toBe('Short one');
  });
  it('adds newest first, and ignores an empty prompt', () => {
    const one = addPrompt([], { title: '', text: 'First prompt' }, 'a', '2026-01-01');
    const two = addPrompt(one, { title: 'Named', text: 'Second' }, 'b', '2026-01-02');
    expect(two.map((p) => p.title)).toEqual(['Named', 'First prompt']);
    expect(addPrompt(two, { title: 'x', text: '   ' }, 'c', '2026-01-03')).toBe(two);
  });
  it('edits and deletes by id', () => {
    const list = addPrompt([], { title: 'T', text: 'Old' }, 'a', '2026-01-01');
    const edited = updatePrompt(list, 'a', { title: 'T2', text: 'New' }, '2026-02-02');
    expect(edited[0]).toEqual({ id: 'a', title: 'T2', text: 'New', updated: '2026-02-02' });
    expect(updatePrompt(edited, 'a', { title: 'T2', text: '' }, '2026-03-03')).toBe(edited); // never saves empty
    expect(removePrompt(edited, 'a')).toEqual([]);
  });
});

describe('placeholders', () => {
  it('finds [placeholders] but not [[term links]]', () => {
    expect(PLACEHOLDER.test('Write to [who]')).toBe(true);
    expect(PLACEHOLDER.test('A [[chatbot]] writes')).toBe(false);
  });
  it('splits a prompt for highlighting', () => {
    expect(splitPlaceholders('For [reader], in [number] points.')).toEqual([
      { text: 'For ', placeholder: false },
      { text: '[reader]', placeholder: true },
      { text: ', in ', placeholder: false },
      { text: '[number]', placeholder: true },
      { text: ' points.', placeholder: false },
    ]);
  });
});

describe('toolkit and exercise validation', () => {
  const shared = SharedSchema.parse(loadShared());
  const en = LocaleContentSchema.parse(loadLocale('en'));

  it('flags a template with nothing to fill in', () => {
    const templates = [{ ...en.toolkit.templates[0], prompt: 'No blanks here.' }, ...en.toolkit.templates.slice(1)];
    const out = crossCheck(shared, { ...en, toolkit: { ...en.toolkit, templates } }, 'en').join('\n');
    expect(out).toContain('has no [placeholder]');
  });
  it('flags an exercise that is listed but not written', () => {
    const out = crossCheck(shared, { ...en, exercises: en.exercises.slice(1) }, 'en').join('\n');
    expect(out).toContain('not written in exercises.yaml');
  });
  it('flags duplicate ids', () => {
    const tips = [...en.toolkit.tips, en.toolkit.tips[0]];
    const out = crossCheck(shared, { ...en, toolkit: { ...en.toolkit, tips } }, 'en').join('\n');
    expect(out).toContain('appears more than once');
  });
  it('the recipe has the six ingredients in every language', () => {
    for (const code of ['en', 'fr']) {
      const content = LocaleContentSchema.parse(loadLocale(code));
      expect(content.toolkit.recipe.elements.map((e) => e.id)).toEqual([
        'role',
        'context',
        'task',
        'format',
        'constraints',
        'examples',
      ]);
    }
  });
});
