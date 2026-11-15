/**
 * "Install the app" support.
 *
 * - On Android (Chrome), the browser tells us when the app can be installed
 *   (the `beforeinstallprompt` event). We keep that event so our own
 *   "Install now" button can open the browser's install dialog.
 * - On iPhone and iPad there is no such event: people must use Safari's
 *   Share menu, so we show the steps instead.
 * - Once the app runs from the home screen ("standalone"), we show nothing.
 */
import { useSyncExternalStore } from 'react';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: InstallEvent | null = null;
let justInstalled = false;
let version = 0;
const listeners = new Set<() => void>();
const changed = () => {
  version++;
  listeners.forEach((l) => l());
};

/** Call once at startup. */
export function watchInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // we show our own, calmer invitation instead of the browser's banner
    deferred = e as InstallEvent;
    changed();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    justInstalled = true;
    changed();
  });
}

/** True when the app was opened from the home screen icon. */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export type Platform = 'ios' | 'android' | 'other';

/** Which set of steps to show first. `touchPoints` tells an iPad apart from a Mac. */
export function detectPlatform(userAgent: string, touchPoints = 0): Platform {
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && touchPoints > 1)) return 'ios';
  if (/Android/.test(userAgent)) return 'android';
  return 'other';
}

/** Opens the browser's install dialog (Android/desktop Chrome). Resolves to true if accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferred = null; // the browser allows one use per event
  changed();
  return outcome === 'accepted';
}

/** Install state for components; re-renders when the browser's answer changes. */
export function useInstall() {
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
  );
  return {
    installed: justInstalled || isStandalone(),
    /** The browser can show its install dialog right now. */
    canPrompt: deferred !== null,
    platform: detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
  };
}
