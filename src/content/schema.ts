/**
 * Typed schema for everything in /content.
 *
 * The build-time validator (scripts/validate-content.ts) parses the content
 * files with these schemas. The app itself only imports the *types*, so Zod
 * is not shipped to the browser.
 *
 * The schema grows stage by stage (full lessons in Stage 3, toolkit in 4...).
 */
import { z } from 'zod';

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'IDs are lowercase-with-dashes');
const text = z.string().trim().min(1);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

// ---------- Shared (language-independent) ----------

export const SharedSchema = z.strictObject({
  /** Module order and which lessons sit in each module. */
  path: z.strictObject({
    modules: z.array(z.strictObject({ id, lessons: z.array(id).min(1) })).min(1),
  }),
  /**
   * The structure of the glossary: facts that are the same in every language.
   * The wording of each term lives in each language's glossary.yaml.
   */
  glossary: z.strictObject({
    /** Category order for the filter chips. Labels are in ui.json. */
    categories: z.array(id).min(1),
    terms: z.array(
      z.strictObject({
        id,
        category: id,
        /** The lesson where this term is taught. */
        lesson: id,
        related: z.array(id).default([]),
      }),
    ),
  }),
  /** Exercise order, and the lesson whose "Try it" links to each exercise. */
  practice: z.strictObject({
    exercises: z.array(z.strictObject({ id, lesson: id })),
  }),
  /** In-app feedback: the questions, and the form service that collects the answers. */
  feedback: z.strictObject({
    /** Address the answers are posted to. Empty = feedback links are hidden. */
    endpoint: z.union([z.literal(''), z.url()]),
    /** Only for services that need one (Web3Forms). */
    accessKey: z.string(),
    questions: z
      .array(z.strictObject({ id, type: z.enum(['choice', 'text']), options: z.array(id).min(2).optional() }))
      .min(1),
  }),
  /** Named example tools live here only, so lesson text never goes stale. */
  tools: z.strictObject({
    lastReviewed: isoDate,
    contentLastReviewed: isoDate,
    tools: z.array(z.strictObject({ type: id, examples: z.array(text).min(1) })),
  }),
});
export type Shared = z.infer<typeof SharedSchema>;

// ---------- Per-locale ----------

export const LocaleMetaSchema = z.strictObject({
  /** Short label for the header switcher, e.g. "EN". */
  label: z.string().min(2).max(4),
  /** Name of the language in that language, e.g. "Français". */
  name: text,
  /** Optional automatic typography rules applied to every string. */
  typography: z.enum(['french']).optional(),
});

const paragraphs = z.array(text).min(1);

/** Drawings a lesson can show. Each id has a component in src/features/learn/Figure.tsx. */
export const FIGURES = ['nested-circles'] as const;

/** Interactive blocks a lesson section can show. */
export const WIDGETS = ['tool-examples', 'thirty-day-plan'] as const;

const FigureSchema = z.strictObject({
  id: z.enum(FIGURES),
  /** Read aloud by screen readers instead of the picture. */
  alt: text,
  caption: text.optional(),
  /** The words drawn inside the picture, in this language. */
  labels: z.array(text),
});

/**
 * A lesson. The first four fields are the "header" shown on the journey.
 * The rest is the lesson itself, always in the same order (the lesson template).
 * A lesson with only a header is shown as "being written"; a lesson that is
 * half-filled fails the build (see validate.ts).
 * Text may contain [[term-id|links]] to the glossary.
 */
export const LessonSchema = z.strictObject({
  id,
  title: text,
  summary: text,
  minutes: z.number().int().min(3).max(10),

  /** 1. Reassurance opener: one or two lines. */
  opener: text.optional(),
  /** 2. The idea in plain words, its "even simpler" version, and an analogy. */
  idea: z
    .strictObject({
      paragraphs,
      simpler: text,
      analogy: text,
      /** Where the analogy stops working. */
      analogyLimit: text,
    })
    .optional(),
  /** Optional "a bit more" sections, one idea each. */
  sections: z
    .array(
      z.strictObject({
        title: text,
        paragraphs,
        figure: FigureSchema.optional(),
        /** An interactive block shown after the text (see LessonPage.tsx). */
        widget: z.enum(WIDGETS).optional(),
      }),
    )
    .optional(),
  /** 3. A workplace example. */
  example: z.strictObject({ title: text, paragraphs }).optional(),
  /** 4. Try it: one or more short paragraphs. */
  tryIt: paragraphs.optional(),
  /** 5. Exactly three takeaways. */
  takeaways: z.array(text).length(3).optional(),
  /** 6. Two or three low-stakes questions. Every option has a kind reply. */
  quickCheck: z
    .array(
      z.strictObject({
        question: text,
        options: z
          .array(z.strictObject({ text, correct: z.literal(true).optional(), reply: text }))
          .min(2)
          .max(4),
      }),
    )
    .min(2)
    .max(3)
    .optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;

/** One glossary entry. Text fields may contain [[term-id|links]]. */
export const TermSchema = z.strictObject({
  id,
  /** The word itself, as shown in lists. */
  term: text,
  /** One plain sentence, 20 words at most (checked by the validator). */
  definition: text,
  /** The "like I'm 10" version, shown by "Explain it even simpler". */
  simpler: text,
  /** Everyday comparison. Must also say where the comparison stops working. */
  analogy: text,
  /** A concrete workplace example. */
  example: text,
  /** How people say it at work. */
  heardAs: text,
  /** Optional language-specific note, e.g. "in French people keep the English word". */
  usageNote: text.optional(),
});
export type Term = z.infer<typeof TermSchema>;

/** A hands-on exercise, done in whatever AI tool the user already has. */
export const ExerciseSchema = z.strictObject({
  id,
  title: text,
  minutes: z.number().int().min(2).max(15),
  goal: text,
  /** Made-up text the user can safely paste. */
  sampleText: text.optional(),
  starterPrompt: text,
  /** What a good answer looks like. */
  good: z.array(text).min(2),
  /** The "make it better" tweak, with a second prompt to copy. */
  better: z.strictObject({ text, prompt: text }),
  /** Short checks to carry out on the answer, each starting with a verb. */
  selfCheck: z.array(text).min(2),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

/** The six ingredients of the prompt recipe. The Prompt builder has one box per id. */
export const RECIPE_IDS = ['role', 'context', 'task', 'format', 'constraints', 'examples'] as const;
export type RecipeId = (typeof RECIPE_IDS)[number];

export const ToolkitSchema = z.strictObject({
  recipe: z.strictObject({
    intro: text,
    note: text,
    elements: z
      .array(
        z.strictObject({
          id: z.enum(RECIPE_IDS),
          name: text,
          /** How this part starts in the built prompt, e.g. "Role:". */
          label: text,
          oneLine: text,
          analogy: text,
          before: text,
          after: text,
          /** Builder: help text and example for the box. */
          helper: text,
          placeholder: text,
        }),
      )
      .length(RECIPE_IDS.length),
  }),
  /** "Fix my prompt": the suggestion shows while the box is not ticked. */
  checklist: z.array(z.strictObject({ id, question: text, suggestion: text })).min(4),
  /** Before/after gallery. */
  gallery: z.array(z.strictObject({ id, title: text, weak: text, strong: text, why: text })).min(1),
  /** Fill-in-the-blank templates with [placeholders]. */
  templates: z.array(z.strictObject({ id, title: text, use: text, prompt: text })).min(1),
  tips: z.array(z.strictObject({ id, title: text, text, example: text })).min(1),
});
export type Toolkit = z.infer<typeof ToolkitSchema>;

export const LocaleContentSchema = z.strictObject({
  meta: LocaleMetaSchema,
  /** UI strings, handed to i18next as-is. */
  ui: z.record(z.string(), z.unknown()),
  path: z.strictObject({
    modules: z.record(id, z.strictObject({ title: text, blurb: text })),
  }),
  pages: z.strictObject({
    why: z.strictObject({ title: text, paragraphs: z.array(text).min(1) }),
    /** The "next 30 days" plan: one small step a week. */
    plan: z.strictObject({
      title: text,
      intro: text,
      steps: z.array(z.strictObject({ id, title: text, text })).min(3),
      /** Shown when every step is ticked. */
      done: text,
    }),
  }),
  lessons: z.array(LessonSchema),
  glossary: z.array(TermSchema),
  exercises: z.array(ExerciseSchema),
  toolkit: ToolkitSchema,
  /** Wording of the feedback screen. */
  feedback: z.strictObject({
    title: text,
    intro: text,
    privacy: text,
    alsoSent: text,
    questions: z.record(id, z.strictObject({ label: text, options: z.record(id, text).optional() })),
    send: text,
    sending: text,
    empty: text,
    sentTitle: text,
    sentBody: text,
    failed: text,
    copy: text,
    notReady: text,
  }),
});
export type LocaleContent = z.infer<typeof LocaleContentSchema>;

export type LocaleInfo = { code: string; label: string; name: string };
