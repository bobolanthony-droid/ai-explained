/**
 * User settings, saved on this device only (localStorage).
 * All app data uses the "ai-explained:" key prefix so export/reset can find it.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const STORAGE_PREFIX = 'ai-explained:';

export type Theme = 'system' | 'light' | 'dark';
export type TextSize = 'standard' | 'large' | 'larger' | 'largest';

export type Settings = {
  /** English for everyone by default; we never auto-switch from the browser language. */
  locale: string;
  theme: Theme;
  textSize: TextSize;
  reduceMotion: boolean;
  /** The user tapped "Not now" on the install invitation. */
  installHintDismissed: boolean;
  /** The user answered the "also in French" offer, or picked a language themselves. */
  languageSuggestionDismissed: boolean;
};

export const useSettings = create<Settings>()(
  persist(
    (): Settings => ({ locale: 'en', theme: 'light', textSize: 'standard', reduceMotion: false, installHintDismissed: false, languageSuggestionDismissed: false }),
    { name: `${STORAGE_PREFIX}settings`, version: 1 },
  ),
);
