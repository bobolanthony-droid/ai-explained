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
};

export const useSettings = create<Settings>()(
  persist(
    (): Settings => ({ locale: 'en', theme: 'light', textSize: 'standard', reduceMotion: false }),
    { name: `${STORAGE_PREFIX}settings`, version: 1 },
  ),
);
