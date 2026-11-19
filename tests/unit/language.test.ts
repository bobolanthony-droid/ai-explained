import { describe, expect, it } from 'vitest';
import { suggestedLocale } from '../../src/components/LanguageSuggestion';

describe('suggestedLocale (offer the phone language)', () => {
  const available = ['en', 'fr'];
  it('offers French to a French phone while the app shows English', () => {
    expect(suggestedLocale(['fr-FR', 'en-US'], available, 'en')).toBe('fr');
    expect(suggestedLocale(['fr-BE'], available, 'en')).toBe('fr');
  });
  it('offers nothing when the app already shows the phone language', () => {
    expect(suggestedLocale(['en-GB', 'fr-FR'], available, 'en')).toBeNull();
    expect(suggestedLocale(['fr-CA'], available, 'fr')).toBeNull();
  });
  it('skips languages the app does not have, and uses the next one', () => {
    expect(suggestedLocale(['de-DE', 'fr-FR'], available, 'en')).toBe('fr');
    expect(suggestedLocale(['de-DE', 'es-ES'], available, 'en')).toBeNull();
  });
});
