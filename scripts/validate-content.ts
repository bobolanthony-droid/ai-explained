/**
 * Build-time content validator. Run with `npm run check`.
 * Fails (exit code 1) if any content file breaks the schema or a cross-link.
 */
import type { ZodType } from 'zod';
import { LocaleContentSchema, SharedSchema } from '../src/content/schema';
import { crossCheck } from '../src/content/validate';
import { listLocales, loadLocale, loadShared } from './content-lib';

const problems: string[] = [];

function parse<T>(schema: ZodType<T>, data: unknown, where: string): T | undefined {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    problems.push(`[${where}] ${issue.path.join('.') || '(root)'}: ${issue.message}`);
  }
}

const shared = parse(SharedSchema, loadShared(), 'shared');
const locales = listLocales();

for (const code of locales) {
  const content = parse(LocaleContentSchema, loadLocale(code), code);
  if (shared && content) problems.push(...crossCheck(shared, content, code));
}

if (problems.length) {
  console.error(`Content check failed with ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`Content OK: ${locales.join(', ')}`);
