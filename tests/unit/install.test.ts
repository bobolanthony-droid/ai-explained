import { describe, expect, it } from 'vitest';
import { detectPlatform } from '../../src/features/install/install';

describe('detectPlatform (which install steps to show first)', () => {
  it('recognises iPhone and iPad', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1')).toBe('ios');
    // Recent iPads say they are a Mac; the touch screen gives them away.
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 5)).toBe('ios');
  });
  it('recognises Android', () => {
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 15; Pixel 8) Chrome/130.0 Mobile Safari/537.36')).toBe('android');
  });
  it('treats computers as "other"', () => {
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 0)).toBe('other');
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36')).toBe('other');
  });
});
