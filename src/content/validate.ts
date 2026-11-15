/**
 * Cross-file checks the schema alone cannot express
 * (e.g. "every lesson in the path exists in this language").
 * Returns a list of human-readable problems; empty means all good.
 */
import { LESSON_BODY_FIELDS } from './lessons';
import { PLACEHOLDER, termLinks, wordCount } from './richtext';
import type { LocaleContent, Shared } from './schema';

/** Glossary definitions must stay one short sentence. */
export const MAX_DEFINITION_WORDS = 20;

function duplicates(ids: string[]): string[] {
  return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
}

/** Every string in a nested structure, with a readable path to it. */
function collectStrings(value: unknown, path: string, out: [string, string][] = []) {
  if (typeof value === 'string') out.push([path, value]);
  else if (Array.isArray(value)) {
    value.forEach((v, i) => {
      const key = v && typeof v === 'object' && 'id' in v ? String(v.id) : String(i);
      collectStrings(v, `${path}.${key}`, out);
    });
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collectStrings(v, `${path}.${k}`, out);
  }
  return out;
}

export function crossCheck(shared: Shared, locale: LocaleContent, code: string): string[] {
  const problems: string[] = [];
  const say = (msg: string) => problems.push(`[${code}] ${msg}`);

  // ----- Lessons and path -----
  const lessonIds = locale.lessons.map((l) => l.id);
  for (const id of duplicates(lessonIds)) say(`lesson id "${id}" is used more than once`);

  const inPath = shared.path.modules.flatMap((m) => m.lessons);
  for (const id of inPath) {
    if (!lessonIds.includes(id)) say(`lesson "${id}" is in shared/path.yaml but has no lesson file`);
  }
  for (const id of lessonIds) {
    if (!inPath.includes(id)) say(`lesson "${id}" has a file but is not in shared/path.yaml`);
  }
  for (const m of shared.path.modules) {
    if (!locale.path.modules[m.id]) say(`module "${m.id}" has no title in path.yaml`);
  }

  // ----- Glossary -----
  const structure = shared.glossary.terms;

  // ----- Lesson bodies -----
  for (const lesson of locale.lessons) {
    const present = LESSON_BODY_FIELDS.filter((f) => lesson[f] !== undefined);
    if (present.length === 0) continue; // header only: "being written"
    const absent = LESSON_BODY_FIELDS.filter((f) => lesson[f] === undefined);
    if (absent.length) say(`lesson "${lesson.id}" is half-written, missing: ${absent.join(', ')}`);

    for (const [i, q] of (lesson.quickCheck ?? []).entries()) {
      const correct = q.options.filter((o) => o.correct).length;
      if (correct !== 1) say(`lesson "${lesson.id}" question ${i + 1}: needs exactly one correct option (has ${correct})`);
    }

    // Each lesson introduces 3 to 6 glossary terms, and links each of them in its text.
    const introduces = structure.filter((t) => t.lesson === lesson.id).map((t) => t.id);
    if (introduces.length < 3 || introduces.length > 6) {
      say(`lesson "${lesson.id}" introduces ${introduces.length} glossary terms (should be 3 to 6)`);
    }
    const linked = new Set(collectStrings(lesson, 'lesson').flatMap(([, v]) => termLinks(v)));
    for (const id of introduces) {
      if (!linked.has(id)) say(`lesson "${lesson.id}" introduces "${id}" but never links it with [[${id}]]`);
    }
  }

  const structureIds = structure.map((t) => t.id);
  const termIds = locale.glossary.map((t) => t.id);
  for (const id of duplicates(termIds)) say(`glossary term "${id}" is written more than once`);
  for (const id of duplicates(structureIds)) say(`glossary term "${id}" is listed twice in shared/glossary.yaml`);
  for (const id of structureIds) {
    if (!termIds.includes(id)) say(`term "${id}" is in shared/glossary.yaml but not written in glossary.yaml`);
  }
  for (const id of termIds) {
    if (!structureIds.includes(id)) say(`term "${id}" is written but not listed in shared/glossary.yaml`);
  }
  for (const t of structure) {
    if (!shared.glossary.categories.includes(t.category)) say(`term "${t.id}": unknown category "${t.category}"`);
    if (!inPath.includes(t.lesson)) say(`term "${t.id}": unknown lesson "${t.lesson}"`);
    for (const r of t.related) {
      if (r === t.id) say(`term "${t.id}" lists itself as related`);
      else if (!structureIds.includes(r)) say(`term "${t.id}": related term "${r}" does not exist`);
    }
  }
  for (const t of locale.glossary) {
    const words = wordCount(t.definition);
    if (words > MAX_DEFINITION_WORDS) {
      say(`term "${t.id}": definition has ${words} words (max ${MAX_DEFINITION_WORDS})`);
    }
  }

  // ----- Exercises -----
  const exerciseIds = locale.exercises.map((e) => e.id);
  const practiceIds = shared.practice.exercises.map((e) => e.id);
  for (const id of duplicates(exerciseIds)) say(`exercise "${id}" is written more than once`);
  for (const id of practiceIds) {
    if (!exerciseIds.includes(id)) say(`exercise "${id}" is in shared/practice.yaml but not written in exercises.yaml`);
  }
  for (const id of exerciseIds) {
    if (!practiceIds.includes(id)) say(`exercise "${id}" is written but not listed in shared/practice.yaml`);
  }
  for (const e of shared.practice.exercises) {
    if (!inPath.includes(e.lesson)) say(`exercise "${e.id}": unknown lesson "${e.lesson}"`);
  }

  // ----- Prompt Toolkit -----
  const { recipe, checklist, gallery, templates, tips } = locale.toolkit;
  const lists = { 'recipe element': recipe.elements, 'checklist item': checklist, 'gallery example': gallery, template: templates, tip: tips };
  for (const [kind, items] of Object.entries(lists)) {
    for (const id of duplicates(items.map((i) => i.id))) say(`${kind} "${id}" appears more than once`);
  }
  for (const tpl of templates) {
    if (!PLACEHOLDER.test(tpl.prompt)) say(`template "${tpl.id}" has no [placeholder] to fill in`);
  }

  // ----- Every [[term]] link, anywhere in the content, must resolve -----
  for (const [path, value] of collectStrings({ ...locale, ui: undefined, meta: undefined }, 'content')) {
    for (const id of termLinks(value)) {
      if (!structureIds.includes(id)) say(`${path}: link [[${id}]] points to a term that does not exist`);
    }
  }
  return problems;
}
