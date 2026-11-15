/** Export / reset of everything the app has saved on this device. */
import { STORAGE_PREFIX } from './settings';

/** Minimal slice of localStorage, so tests can pass a fake. */
type Store = Pick<Storage, 'getItem' | 'removeItem' | 'key' | 'length'>;

function ownKeys(store: Store): string[] {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (k?.startsWith(STORAGE_PREFIX)) keys.push(k);
  }
  return keys;
}

export function exportData(store: Store = localStorage): string {
  const data: Record<string, unknown> = {};
  for (const key of ownKeys(store)) {
    const raw = store.getItem(key)!;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  return JSON.stringify({ app: 'ai-explained', exportedAt: new Date().toISOString(), data }, null, 2);
}

export function clearData(store: Store = localStorage) {
  for (const key of ownKeys(store)) store.removeItem(key);
}

export function downloadExport() {
  const url = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-explained-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetData() {
  clearData();
  window.location.assign(import.meta.env.BASE_URL); // fresh start, back in the default language
}
