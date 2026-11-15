# AI ExplAIned / IA pas le feu

A calm, plain-language learning app about AI for non-technical adults at work.
Mobile-first Progressive Web App (PWA): installable, works offline, English and French.
No accounts, no backend, no tracking.

**Build status:** all five stages done. Content: 8 lessons, 39 glossary terms, 5 exercises, 13 prompt templates, 16 tips, 8 before/after examples, in English and French.

## Run it

You need Node 20 or newer.

```bash
npm install
npm run dev        # development server with live reload (no service worker)
npm run build      # checks content + translations + types, then builds to dist/
npm run preview    # serves dist/ exactly as it will be deployed (with offline support)
npm test           # unit tests
npm run test:e2e   # end-to-end smoke tests in a real browser (first time: npx playwright install chromium)
npm run check      # content validation + translation check only
npm run audit      # plain-language and tone audit; writes docs/content-audit.md
```

## How it is organised

```
content/                 <- everything a writer edits. No code here.
  shared/                language-independent data (lesson order, tools list, review dates)
  en/                    English (the base language)
  fr/                    French: same files, same IDs
scripts/                 build-time helpers (content loader, validator, translation check)
src/
  app/                   shell and routes
  components/            shared UI (header, tab bar, language switcher...)
  features/              one folder per tab
  content/               content schema (types) and pure helpers
  i18n/                  language switching
  store/                 on-device settings, progress and saved prompts, export/reset
                         (progressLogic.ts holds the rules as plain, tested functions)
tests/unit/  tests/e2e/
```

How content reaches the app: a small Vite plugin (`scripts/vite-content-plugin.ts`) reads
`content/`, and bundles each language into its own file. The app loads the current
language on demand; the service worker stores all of them for offline use.

## Editing content

Content is YAML (lessons, pages) and JSON (short UI strings). Edit, save, and the
dev server reloads. `npm run check` tells you if anything is broken.

- **Edit a lesson:** `content/en/lessons/NN-id.yaml` and the same file in `fr/`. `01-not-late.yaml` is the model:
  the header (`id`, `title`, `summary`, `minutes`), then the template parts in order: `opener`, `idea`
  (with `simpler`, `analogy`, `analogyLimit`), `sections`, `example`, `tryIt`, three `takeaways`, and a
  `quickCheck` of 2-3 questions (one `correct: true` option each, and a kind `reply` for every option).
  A lesson with only a header shows as "being written"; a half-filled lesson fails the check.
- **Which words a lesson introduces** comes from `lesson:` in `content/shared/glossary.yaml`. Each written
  lesson must introduce 3 to 6 terms and link each one at least once with `[[term-id]]`.
- **Add a picture to a lesson:** drawings are small components in `src/features/learn/Figure.tsx`. The lesson
  file supplies the translated `labels`, the `alt` text and the `caption`.
- **Add a lesson:** create the file in *each* language folder with the same `id`,
  then add that `id` to a module in `content/shared/path.yaml`.
- **Change UI wording:** `content/<lang>/ui.json`.
- **Update named tools / review date:** `content/shared/tools.yaml` (the only place products are named).
  Lesson 8 shows this list with its "last reviewed" date. Review it every few months.
- **The 30-day plan:** `plan` in each `pages.yaml`.
- **Add a glossary term:**
  1. In `content/shared/glossary.yaml`, add its `id`, `category`, the `lesson` that teaches it and its `related` terms.
  2. In `content/en/glossary.yaml` and `content/fr/glossary.yaml`, write the entry with the same `id`:
     `term`, `definition` (one sentence, 20 words at most), `simpler`, `analogy`, `example`, `heardAs`,
     and optionally `usageNote` (for example, when French speakers keep the English word).
  3. Run `npm run check`. It fails if a term is missing in a language, a definition is too long,
     or a related term, lesson or link does not exist.
- **Link to a term from any text:** write `[[term-id]]` to show the term name, or
  `[[term-id|words to show]]`. Readers tap it to see the definition in a bottom sheet.
- **Rename a glossary category:** `glossary.categories` in each `ui.json`. Their order is in `content/shared/glossary.yaml`.
- **Add an exercise:** add its `id` and `lesson` to `content/shared/practice.yaml`, then write it in each
  language's `exercises.yaml` (`title`, `minutes`, `goal`, optional `sampleText`, `starterPrompt`, `good`,
  `better` with its own `prompt`, and `selfCheck`). The lesson named there links to it from "Try it".
- **Prompt Toolkit content** is in `content/<lang>/toolkit/`:
  - `templates.yaml`: `id`, `title`, `use`, `prompt`. Each prompt needs at least one `[placeholder]`.
  - `tips.yaml`: `id`, `title`, `text`, `example`.
  - `gallery.yaml`: `id`, `title`, `weak`, `strong`, `why`.
  - `checklist.yaml`: `id`, `question`, `suggestion` (shown while the box is unticked).
  - `recipe.yaml`: the six ingredients. Their ids are fixed (the Prompt builder has one box per id);
    `label` is how each part starts in the built prompt, e.g. `"Role:"`.
  Use the same ids in every language. Order on screen follows the order in the file.
- **French prompts** address the AI with *tu* (common usage) while the app addresses the reader with *vous*.

### French typography is automatic

In French files, type normal spaces and straight apostrophes. The build inserts
non-breaking spaces before `: ; ! ?` and inside `« »`, and curly apostrophes
(`src/content/typography.ts`).

### Translations: missing and stale

`npm run check` (also run by `npm run build`) compares every language with English:

- **Missing** item -> the build fails.
- **Stale** item (the English changed after the French was reviewed) -> warning.
  Use `npx tsx scripts/check-i18n.ts --strict` to fail on these too.

After reviewing French text, run `npm run i18n:stamp`. It records, in
`content/fr/translation-lock.json`, which English wording each French item matches.

### Adding a third language

Copy `content/en/` to `content/<code>/`, translate it, set `label` and `name` in its
`meta.yaml`, run `npm run i18n:stamp`. The switcher picks it up; no code changes.

## Quality checks

| Check | Command | What it covers |
|---|---|---|
| Content rules | `npm run check` | schema, links, 3-6 terms per lesson, definitions of 20 words at most, missing or stale French |
| Plain language and tone | `npm run audit` | reading ease 70+ (Flesch in English, Kandel-Moles in French), no sentence over 25 words, no paragraph over 3 sentences, no buzzwords or fear phrases, every analogy states its limit |
| Logic | `npm test` | progress, prompts, search, validation and readability rules |
| Real browser | `npm run test:e2e` | the learning flow, the Prompt Toolkit, offline use, accessibility (axe, WCAG 2.2 AA, both themes and languages), largest text size, keyboard use, and a performance budget on a simulated slow phone |

The audit results are kept in [docs/content-audit.md](docs/content-audit.md). Run `npm run audit` after any content change.

**Lighthouse** is not run automatically. To get scores, run `npm run preview`, open the app in Chrome,
and use the Lighthouse tab in DevTools (mobile). Lighthouse no longer has a PWA category; installability
and offline use are covered by the end-to-end tests.

## Deploy

`npm run build` produces static files in `dist/`. Host them anywhere.

- **Cloudflare Pages / Netlify:** build command `npm run build`, output folder `dist`.
  `public/_redirects` already sends every route to `index.html`.
- **GitHub Pages (current setup):** every push to `main` runs `.github/workflows/deploy.yml`, which
  tests, builds and publishes the app. GitHub Pages serves from `/<repository name>/`, so the
  workflow sets `BASE_PATH` for the build. To publish a change: commit it, then `git push`.
  The build copies `index.html` to `404.html` so that reloading a deep link still opens the app.

While the app is a draft, `index.html` carries `<meta name="robots" content="noindex">` so search
engines do not list it. Remove that line when you want it to be found.

The app needs HTTPS to install and work offline (localhost is exempt).

## Privacy and analytics

Nothing leaves the device. Fonts are bundled, there are no third-party scripts.
If you later want privacy-friendly analytics (a cookieless tool such as Plausible),
the one place to add it is `src/main.tsx`, behind an explicit setting.

## Known limits

- The installed app name is fixed ("AI Explained"): a web app has one manifest, so the
  home-screen name cannot follow the in-app language. In-app, the name switches.
- App icons are generated from `public/logo.svg` with `npm run icons`.
- iOS splash images are not generated yet (Android builds its own from the manifest).
- Not yet tested on a real phone or with a real screen reader. The automated accessibility
  checks pass, but they do not replace that.
- The syllable counts behind the reading-ease scores use simple spelling rules, so treat the
  scores as a good guide, not an exact measure.
