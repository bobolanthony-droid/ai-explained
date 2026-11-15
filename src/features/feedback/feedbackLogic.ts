/**
 * Feedback rules as pure functions (easy to test).
 * Answers are sent under stable ids, never translated labels, so replies in
 * English and French add up in the same columns.
 */

export type Question = { id: string; type: 'choice' | 'text'; options?: string[] };
export type Answers = Record<string, string>;

/** Longest free-text answer we send. */
export const MAX_TEXT = 1500;

/** The answered questions only, trimmed. Returns null if nothing was answered. */
export function cleanAnswers(questions: Question[], answers: Answers): Answers | null {
  const out: Answers = {};
  for (const q of questions) {
    const value = (answers[q.id] ?? '').trim();
    if (!value) continue;
    // A choice must be one of its listed options.
    if (q.type === 'choice' && !q.options?.includes(value)) continue;
    out[q.id] = value.slice(0, MAX_TEXT);
  }
  return Object.keys(out).length ? out : null;
}

/** What is posted to the form service: the answers plus three facts about the app. */
export function buildPayload(
  clean: Answers,
  meta: { language: string; lessonsDone: number; version: string },
  accessKey?: string,
): Record<string, string> {
  return {
    ...clean,
    language: meta.language,
    lessons_done: String(meta.lessonsDone),
    app_version: meta.version,
    ...(accessKey ? { access_key: accessKey } : {}),
  };
}

/** The answers as readable text, for the "Copy my answers" fallback. */
export function formatForCopy(
  questions: Question[],
  clean: Answers,
  labelOf: (questionId: string) => string,
  optionLabel: (questionId: string, optionId: string) => string,
): string {
  return questions
    .filter((q) => q.id in clean)
    .map((q) => `${labelOf(q.id)}\n${q.type === 'choice' ? optionLabel(q.id, clean[q.id]) : clean[q.id]}`)
    .join('\n\n');
}

/** Posts the feedback. Resolves to true only when the service accepted it. */
export async function sendFeedback(endpoint: string, payload: Record<string, string>): Promise<boolean> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false; // offline, blocked, or the service is down
  }
}
