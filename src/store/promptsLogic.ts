/**
 * Rules for the Prompt Toolkit's saved data, as pure functions (easy to test).
 */
import type { RecipeId } from '@/content/schema';

export type SavedPrompt = {
  id: string;
  title: string;
  text: string;
  /** YYYY-MM-DD */
  updated: string;
};

export type PromptsState = {
  /** The user's own prompts, newest first. */
  mine: SavedPrompt[];
  /** "template:meeting-prep", "tip:iterate", "gallery:team-day". */
  favourites: string[];
  /** What is typed in the Prompt builder, kept so it survives leaving the page. */
  draft: Partial<Record<RecipeId, string>>;
};

export const EMPTY_PROMPTS: PromptsState = { mine: [], favourites: [], draft: {} };

export type FavouriteKind = 'template' | 'tip' | 'gallery';
export const favouriteKey = (kind: FavouriteKind, id: string) => `${kind}:${id}`;

/**
 * Assembles the builder's boxes into one prompt.
 * Empty boxes are skipped, so a beginner can fill in just "Task".
 * @param elements the recipe elements, in order, each with its label ("Role:")
 */
export function buildPrompt(
  elements: { id: RecipeId; label: string }[],
  draft: PromptsState['draft'],
): string {
  return elements
    .map((el) => ({ label: el.label, value: (draft[el.id] ?? '').trim() }))
    .filter((part) => part.value !== '')
    .map((part) => `${part.label} ${part.value}`)
    .join('\n\n');
}

/** A short name for a prompt saved without one: its first few words. */
export function defaultTitle(text: string, maxWords = 6): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const title = words.slice(0, maxWords).join(' ');
  return words.length > maxWords ? `${title}…` : title;
}

export function addPrompt(mine: SavedPrompt[], input: { title: string; text: string }, id: string, today: string): SavedPrompt[] {
  const text = input.text.trim();
  if (!text) return mine; // nothing to save
  return [{ id, title: input.title.trim() || defaultTitle(text), text, updated: today }, ...mine];
}

export function updatePrompt(mine: SavedPrompt[], id: string, input: { title: string; text: string }, today: string): SavedPrompt[] {
  const text = input.text.trim();
  if (!text) return mine; // keep the old version rather than save an empty prompt
  return mine.map((p) => (p.id === id ? { ...p, title: input.title.trim() || defaultTitle(text), text, updated: today } : p));
}

export function removePrompt(mine: SavedPrompt[], id: string): SavedPrompt[] {
  return mine.filter((p) => p.id !== id);
}
