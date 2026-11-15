/**
 * Vite plugin that turns /content into importable modules:
 *
 *   virtual:content-index   -> shared data, the list of locales, and a lazy
 *                              loader per locale (generated from the folders)
 *   virtual:content/<code>  -> one locale's content as a single JS chunk
 *
 * Each language is its own chunk, so a user only downloads what they read
 * (the service worker still precaches all of them for offline use).
 */
import type { Plugin } from 'vite';
import { CONTENT_DIR, listLocales, loadLocale, loadShared } from './content-lib.ts';

const INDEX = 'virtual:content-index';
const LOCALE_PREFIX = 'virtual:content/';
const norm = (p: string) => p.replace(/\\/g, '/');

export function contentPlugin(): Plugin {
  let base = '/';
  return {
    name: 'app-content',
    configResolved(config) {
      base = config.base;
    },
    resolveId(id) {
      if (id === INDEX || id.startsWith(LOCALE_PREFIX)) return `\0${id}`;
    },
    load(id) {
      if (id === `\0${INDEX}`) {
        const locales = listLocales().map((code) => {
          const meta = loadLocale(code).meta as { label: string; name: string };
          return { code, label: meta.label, name: meta.name };
        });
        const loaders = locales
          .map((l) => `${JSON.stringify(l.code)}: () => import(${JSON.stringify(LOCALE_PREFIX + l.code)}).then((m) => m.default)`)
          .join(',\n  ');
        // Every term's name in every language, so the glossary can show
        // "prompt / requête" side by side and search in either language.
        const termNames = Object.fromEntries(
          locales.map((l) => {
            const terms = (loadLocale(l.code).glossary ?? []) as { id: string; term: string }[];
            return [l.code, Object.fromEntries(terms.map((t) => [t.id, t.term]))];
          }),
        );
        return [
          `export const termNames = ${JSON.stringify(termNames)};`,
          `export const shared = ${JSON.stringify(loadShared())};`,
          `export const locales = ${JSON.stringify(locales)};`,
          `export const loaders = {\n  ${loaders}\n};`,
        ].join('\n');
      }
      if (id.startsWith(`\0${LOCALE_PREFIX}`)) {
        const code = id.slice(LOCALE_PREFIX.length + 1);
        return `export default ${JSON.stringify(loadLocale(code))};`;
      }
    },
    // Build only: start downloading the user's language file straight away,
    // instead of waiting for the main script to ask for it. On a slow phone
    // this saves one round trip before the first screen appears.
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html; // dev server: nothing to preload
        const files: Record<string, string> = {};
        for (const chunk of Object.values(ctx.bundle)) {
          if (chunk.type !== 'chunk') continue;
          const id = chunk.moduleIds.find((m) => m.startsWith(`\0${LOCALE_PREFIX}`));
          if (id) files[id.slice(LOCALE_PREFIX.length + 1)] = `${base}${chunk.fileName}`;
        }
        const script =
          `<script>try{var c=${JSON.stringify(files)},` +
          `l=(JSON.parse(localStorage.getItem('ai-explained:settings')||'{}').state||{}).locale||'en',` +
          `k=document.createElement('link');k.rel='modulepreload';k.href=c[l]||c.en;document.head.appendChild(k)}catch(e){}</script>`;
        return html.replace('</head>', `${script}\n  </head>`);
      },
    },
    // Dev only: editing a content file reloads the page with the new text.
    handleHotUpdate({ file, server }) {
      if (!norm(file).startsWith(norm(CONTENT_DIR))) return;
      for (const [id, mod] of server.moduleGraph.idToModuleMap) {
        if (id.startsWith('\0virtual:content')) server.moduleGraph.invalidateModule(mod);
      }
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
