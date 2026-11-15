import { describe, expect, it } from 'vitest';
import {
  bannedHits,
  countSyllables,
  measure,
  sentenceCount,
  splitSentences,
  splitWords,
} from '../../src/content/readability';

describe('syllables', () => {
  it('English: counts vowel groups and drops silent endings', () => {
    expect(countSyllables('cat', 'en')).toBe(1);
    expect(countSyllables('made', 'en')).toBe(1);
    expect(countSyllables('table', 'en')).toBe(2);
    expect(countSyllables('asked', 'en')).toBe(1);
    expect(countSyllables('wanted', 'en')).toBe(2);
    expect(countSyllables('computer', 'en')).toBe(3);
    expect(countSyllables('the', 'en')).toBe(1);
  });
  it('French: accents count, mute endings do not, elisions carry no syllable', () => {
    expect(countSyllables('été', 'fr')).toBe(2);
    expect(countSyllables('table', 'fr')).toBe(1);
    expect(countSyllables('ordinateur', 'fr')).toBe(4);
    expect(countSyllables('l', 'fr')).toBe(0);
  });
});

describe('sentences and words', () => {
  it('splits sentences, including after a French closing quote', () => {
    expect(splitSentences('It is short. Is it clear? Yes.')).toHaveLength(3);
    expect(splitSentences('Il écrit, « Résume ce texte. » La réponse arrive.')).toHaveLength(2);
  });
  it('counts "l\'IA" as two words in French', () => {
    expect(splitWords('L’IA est utile', 'fr')).toHaveLength(4);
    expect(splitWords("It's useful", 'en')).toHaveLength(2);
  });
  it('treats a quoted example as one unit when counting a paragraph', () => {
    expect(sentenceCount('Say what to change. “Shorter.” “Friendlier.” “Add a table.”')).toBe(2);
    expect(sentenceCount('One. Two. Three. Four.')).toBe(4);
  });
});

describe('measure', () => {
  it('scores plain text as easy and dense text as hard', () => {
    const easy = measure(['The cat sat on the mat. It was warm. The sun was out.'], 'en');
    const hard = measure(
      ['Organisational interoperability necessitates comprehensive architectural reconsideration notwithstanding considerable institutional reluctance.'],
      'en',
    );
    expect(easy.score).toBeGreaterThan(90);
    expect(hard.score).toBeLessThan(0);
  });
  it('lists sentences over 20 words', () => {
    const long = Array.from({ length: 22 }, () => 'word').join(' ') + '.';
    expect(measure([long, 'Short one.'], 'en').longSentences).toHaveLength(1);
  });
  it('reads [[links]] as their visible words', () => {
    expect(measure(['A [[chatbot|chat assistant]] answers.'], 'en').words).toBe(4);
  });
});

describe('tone', () => {
  it('catches buzzwords and fear phrases, in both languages', () => {
    expect(bannedHits('We leverage synergies.', 'en')).toHaveLength(2);
    expect(bannedHits("Don't get left behind!", 'en')).toHaveLength(1);
    expect(bannedHits('Ne restez pas à la traîne.', 'fr')).toHaveLength(1);
  });
  it('leaves calm wording alone', () => {
    expect(bannedHits('You are not late. Most people are just starting.', 'en')).toEqual([]);
    expect(bannedHits("Vous n'êtes pas en retard.", 'fr')).toEqual([]);
  });
});
