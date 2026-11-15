import { describe, expect, it } from 'vitest';
import { clearData, exportData } from '../../src/store/backup';

/** A tiny in-memory stand-in for localStorage. */
function fakeStore(initial: Record<string, string>) {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    removeItem: (k: string) => void map.delete(k),
    map,
  };
}

describe('backup', () => {
  it('exports only this app’s keys', () => {
    const store = fakeStore({ 'ai-explained:settings': '{"state":{"locale":"fr"}}', other: 'x' });
    const out = JSON.parse(exportData(store));
    expect(Object.keys(out.data)).toEqual(['ai-explained:settings']);
    expect(out.data['ai-explained:settings'].state.locale).toBe('fr');
  });
  it('reset removes only this app’s keys', () => {
    const store = fakeStore({ 'ai-explained:settings': '{}', 'ai-explained:progress': '{}', other: 'x' });
    clearData(store);
    expect([...store.map.keys()]).toEqual(['other']);
  });
});
