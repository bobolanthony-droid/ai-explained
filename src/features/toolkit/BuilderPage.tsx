import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CopyButton } from '@/components/CopyButton';
import { Page } from '@/components/Page';
import { CheckIcon } from '@/components/icons';
import { useContent } from '@/i18n';
import { clearDraft, savePrompt, setDraft, usePrompts } from '@/store/prompts';
import { buildPrompt } from '@/store/promptsLogic';

/**
 * Prompt builder: one optional box per recipe ingredient. The prompt is
 * assembled live below. What you type is kept on this device, so leaving the
 * page (or switching language) does not lose it.
 */
export function BuilderPage() {
  const { t } = useTranslation();
  const { elements } = useContent().toolkit.recipe;
  const draft = usePrompts((s) => s.draft);
  const [justSaved, setJustSaved] = useState(false);
  const prompt = buildPrompt(elements, draft);

  return (
    <Page title={t('toolkit.tools.builder.title')} back="/prompts">
      <p className="text-ink-soft mt-2 text-lg">{t('toolkit.builder.intro')}</p>

      <div className="mt-5 space-y-4">
        {elements.map((el) => (
          <div key={el.id} className="card">
            <label htmlFor={`builder-${el.id}`} className="block text-lg font-extrabold">
              {el.name}
            </label>
            <p id={`builder-${el.id}-help`} className="text-ink-soft text-sm">
              {el.helper}
            </p>
            <textarea
              id={`builder-${el.id}`}
              aria-describedby={`builder-${el.id}-help`}
              rows={2}
              value={draft[el.id] ?? ''}
              onChange={(e) => {
                setDraft(el.id, e.target.value);
                setJustSaved(false);
              }}
              placeholder={el.placeholder}
              className="bg-bg border-line-strong placeholder:text-ink-soft mt-2 w-full rounded-2xl border p-3"
            />
          </div>
        ))}
      </div>

      <section aria-labelledby="preview" className="mt-8">
        <h2 id="preview" className="font-display text-2xl font-semibold">
          {t('toolkit.builder.preview')}
        </h2>
        {/* aria-live: the assembled prompt is announced (politely) as it changes. */}
        <p
          aria-live="polite"
          className={`bg-primary-soft mt-3 min-h-24 rounded-2xl p-4 whitespace-pre-wrap ${prompt ? '' : 'text-ink-soft'}`}
        >
          {prompt || t('toolkit.builder.empty')}
        </p>
        {prompt && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton text={prompt} primary />
            <button
              type="button"
              className="btn btn-quiet min-h-11 px-4 text-sm"
              disabled={justSaved}
              onClick={() => {
                savePrompt({ title: '', text: prompt });
                setJustSaved(true);
              }}
            >
              {justSaved && <CheckIcon />}
              {justSaved ? t('toolkit.builder.saved') : t('toolkit.builder.save')}
            </button>
            <button
              type="button"
              className="btn btn-quiet min-h-11 px-4 text-sm"
              onClick={() => {
                clearDraft();
                setJustSaved(false);
              }}
            >
              {t('toolkit.builder.clear')}
            </button>
          </div>
        )}
        <p role="status" className="mt-2 text-sm">
          {justSaved && (
            <Link to="/prompts/mine" className="text-primary font-bold underline">
              {t('toolkit.builder.seeMine')}
            </Link>
          )}
        </p>
      </section>
    </Page>
  );
}
