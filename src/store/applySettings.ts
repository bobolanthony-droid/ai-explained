/** Mirrors settings onto <html> so plain CSS can react to them. */
import { type Settings, type TextSize, useSettings } from './settings';

// Scales every rem-based size in the app.
const SCALE: Record<TextSize, string> = {
  standard: '100%',
  large: '112.5%',
  larger: '125%',
  largest: '150%',
};

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function apply(s: Settings) {
  const root = document.documentElement;
  const theme = s.theme === 'system' ? (prefersDark.matches ? 'dark' : 'light') : s.theme;
  root.dataset.theme = theme;
  root.dataset.reduceMotion = String(s.reduceMotion);
  root.style.fontSize = SCALE[s.textSize];
  // Colour of the phone's status bar / browser chrome.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#1f2c2b' : '#fffaf2');
}

/** True when animations should be skipped (device setting or in-app setting). */
export function prefersReducedMotion(): boolean {
  return useSettings.getState().reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function watchSettings() {
  apply(useSettings.getState());
  useSettings.subscribe(apply);
  prefersDark.addEventListener('change', () => apply(useSettings.getState()));
}
