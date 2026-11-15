/** "My prompts", favourites and the builder draft, saved on this device only. */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RecipeId } from '@/content/schema';
import { toggle } from './progressLogic';
import { EMPTY_PROMPTS, type PromptsState, addPrompt, removePrompt, updatePrompt } from './promptsLogic';
import { STORAGE_PREFIX } from './settings';

export const usePrompts = create<PromptsState>()(
  persist((): PromptsState => EMPTY_PROMPTS, { name: `${STORAGE_PREFIX}prompts`, version: 1 }),
);

const set = usePrompts.setState;
const today = () => new Date().toISOString().slice(0, 10);

export function savePrompt(input: { title: string; text: string }) {
  set((s) => ({ mine: addPrompt(s.mine, input, crypto.randomUUID(), today()) }));
}
export function editPrompt(id: string, input: { title: string; text: string }) {
  set((s) => ({ mine: updatePrompt(s.mine, id, input, today()) }));
}
export function deletePrompt(id: string) {
  set((s) => ({ mine: removePrompt(s.mine, id) }));
}
export function toggleFavourite(key: string) {
  set((s) => ({ favourites: toggle(s.favourites, key) }));
}
export function setDraft(id: RecipeId, value: string) {
  set((s) => ({ draft: { ...s.draft, [id]: value } }));
}
export function clearDraft() {
  set({ draft: {} });
}
