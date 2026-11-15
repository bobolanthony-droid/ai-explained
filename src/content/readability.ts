/**
 * Plain-language measurements (the "Grandma test", in numbers).
 *
 * English: Flesch Reading Ease   = 206.835 - 1.015 x (words per sentence) - 84.6 x (syllables per word)
 * French:  Kandel-Moles          = 207     - 1.015 x (words per sentence) - 73.6 x (syllables per word)
 *          (the standard adaptation of Flesch for French, whose words are longer)
 *
 * Both give roughly 0-100; higher is easier. 70+ is "easy": about the level
 * of a 12-year-old reader. Syllables are counted with simple spelling rules,
 * so scores are a good guide, not an exact science.
 */
import { plainText } from './richtext';

export type Language = 'en' | 'fr';

const VOWELS: Record<Language, RegExp> = {
  en: /[aeiouy]+/g,
  fr: /[aeiouyàâäéèêëîïôöùûüœæ]+/g,
};

export function countSyllables(word: string, lang: Language): number {
  const w = word.toLowerCase().replace(/[^a-zàâäçéèêëîïôöùûüœæ]/g, '');
  if (!w) return 1; // a number such as "30" is read as (at least) one beat
  let groups = (w.match(VOWELS[lang]) ?? []).length;
  if (lang === 'en') {
    if (/e$/.test(w) && !/[^aeiouy]le$/.test(w)) groups--; // silent final e: "made" (but not "table")
    else if (/[^aeiouy]es$/.test(w) && !/(s|x|z|ch|sh|c|g)es$/.test(w)) groups--; // "tiles" (but not "boxes")
    else if (/[^aeiouytd]ed$/.test(w)) groups--; // "asked" (but not "wanted")
  } else {
    // French mute endings: "table", "tables", and the verb ending "-ent" is left alone (too ambiguous).
    if (/[^aeiouyàâäéèêëîïôöùûüœ]es?$/.test(w) && groups > 1) groups--;
    // Elided words (l', d', qu') carry no syllable of their own.
    if (groups === 0) return 0;
  }
  return Math.max(groups, lang === 'en' ? 1 : 0);
}

/** Splits on sentence-ending punctuation. Good enough for short, plain prose. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    // After . ! ? (and an optional closing quote, as in « ... . »), before a capital letter.
    .split(/(?<=[.!?…])(?:[\s  ]?["”»])?\s+(?=[\p{Lu}\p{N}“«"[])/u)
    .map((s) => s.trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
}

/** Words of a sentence. In French, "l'IA" counts as two words, as is usual for these formulas. */
export function splitWords(sentence: string, lang: Language): string[] {
  const text = lang === 'fr' ? sentence.replace(/[’']/g, ' ') : sentence;
  return text.split(/[\s  ]+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
}

export type Readability = {
  words: number;
  sentences: number;
  wordsPerSentence: number;
  syllablesPerWord: number;
  /** Flesch (en) or Kandel-Moles (fr). */
  score: number;
  /** Sentences longer than `longSentence` words, longest first. */
  longSentences: { words: number; text: string }[];
};

export const LONG_SENTENCE = 20;

/** Measures a set of text blocks (paragraphs). Glossary [[links]] are read as plain words. */
export function measure(blocks: string[], lang: Language): Readability {
  const sentences = blocks.flatMap((b) => splitSentences(plainText(b)));
  let words = 0;
  let syllables = 0;
  const longSentences: Readability['longSentences'] = [];
  for (const sentence of sentences) {
    const tokens = splitWords(sentence, lang);
    words += tokens.length;
    for (const token of tokens) syllables += countSyllables(token, lang);
    if (tokens.length > LONG_SENTENCE) longSentences.push({ words: tokens.length, text: sentence });
  }
  const wordsPerSentence = sentences.length ? words / sentences.length : 0;
  const syllablesPerWord = words ? syllables / words : 0;
  const score =
    lang === 'en'
      ? 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
      : 207 - 1.015 * wordsPerSentence - 73.6 * syllablesPerWord;
  return {
    words,
    sentences: sentences.length,
    wordsPerSentence,
    syllablesPerWord,
    score,
    longSentences: longSentences.sort((a, b) => b.words - a.words),
  };
}

/** How many sentences a paragraph has (the rule is three at most). */
export function sentenceCount(paragraph: string): number {
  // A quoted example (one prompt, or a few in a row) reads as a single unit,
  // however many full stops it contains.
  const text = plainText(paragraph).replace(/(?:[“«][^”»]*[”»][\s  ]*)+/g, 'Quote. ');
  return splitSentences(text).length;
}

/** Words and phrases the tone rules forbid: buzzwords, hype and fear. */
export const BANNED: Record<Language, RegExp[]> = {
  en: [
    /\bleverag\w*/i, /\bparadigm\w*/i, /\btransformative\b/i, /\becosystem\w*/i, /\bsynerg\w*/i, /\butili[sz]\w*/i,
    /\brevolution\w*/i, /\bgame[- ]chang\w*/i, /\bdisrupt\w*/i, /\bcutting[- ]edge\b/i, /\bsupercharg\w*/i,
    /\b(get|be|being|getting) left behind\b/i, /\bfall(ing)? behind\b/i, /\breplace you\b/i, /\btake your job\b/i,
    /\bdon'?t miss\b/i, /\bbefore it'?s too late\b/i, /\bmiss(ing)? out\b/i, /\bact now\b/i, /\bmust-have\b/i,
  ],
  fr: [
    /\bparadigme\w*/i, /\bsynergie\w*/i, /\bécosystème\w*/i, /\bdisrupt\w*/i, /\brévolution\w*/i, /\bincontournable\w*/i,
    /\bbooster\b/i, /\boptimiser\b/i, /à la traîne/i, /\bne (ratez|manquez) pas\b/i, /avant qu[’']il ne soit trop tard/i,
    /\bvous remplacer\b/i, /\bprendre votre (travail|emploi|place)\b/i, /\bdépassés? par\b/i, /\bagissez maintenant\b/i,
  ],
};

export function bannedHits(text: string, lang: Language): string[] {
  return BANNED[lang].flatMap((re) => {
    const m = plainText(text).match(re);
    return m ? [m[0]] : [];
  });
}
