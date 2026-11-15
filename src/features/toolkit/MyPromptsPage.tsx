import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyButton } from '@/components/CopyButton';
import { FavouriteButton } from '@/components/FavouriteButton';
import { Page } from '@/components/Page';
import { PromptText } from '@/components/PromptBox';
import { useContent } from '@/i18n';
import { deletePrompt, editPrompt, savePrompt, usePrompts } from '@/store/prompts';
import type { FavouriteKind, SavedPrompt } from '@/store/promptsLogic';

const field = 'bg-bg border-line-strong placeholder:text-ink-soft mt-1 w-full rounded-2xl border p-3';

/** The name + text form, used both for a new prompt and for editing one. */
function PromptForm(props: {
  idPrefix: string;
  initial?: { title: string; text: string };
  submitLabel: string;
  onSubmit: (value: { title: string; text: string }) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(props.initial?.title ?? '');
  const [text, setText] = useState(props.initial?.text ?? '');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        props.onSubmit({ title, text });
        if (!props.initial) {
          setTitle('');
          setText('');
        }
      }}
    >
      <label htmlFor={`${props.idPrefix}-title`} className="block font-bold">
        {t('toolkit.mine.nameLabel')}
      </label>
      <input
        id={`${props.idPrefix}-title`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('toolkit.mine.namePlaceholder')}
        className={`${field} min-h-12`}
      />
      <label htmlFor={`${props.idPrefix}-text`} className="mt-3 block font-bold">
        {t('toolkit.mine.textLabel')}
      </label>
      <textarea
        id={`${props.idPrefix}-text`}
        rows={4}
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={field}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary min-h-11 px-4 text-sm">
          {props.submitLabel}
        </button>
        {props.onCancel && (
          <button type="button" className="btn btn-quiet min-h-11 px-4 text-sm" onClick={props.onCancel}>
            {t('settings.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}

function SavedCard({ prompt }: { prompt: SavedPrompt }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view');

  if (mode === 'edit') {
    return (
      <li className="card">
        <PromptForm
          idPrefix={`edit-${prompt.id}`}
          initial={prompt}
          submitLabel={t('toolkit.mine.saveChanges')}
          onSubmit={(value) => {
            editPrompt(prompt.id, value);
            setMode('view');
          }}
          onCancel={() => setMode('view')}
        />
      </li>
    );
  }
  return (
    <li className="card">
      <h3 className="mb-2 text-lg leading-snug font-extrabold">{prompt.title}</h3>
      <PromptText text={prompt.text} />
      {mode === 'confirm' ? (
        // Two taps to delete, so nothing is lost by accident.
        <div role="alert" className="mt-3 flex flex-wrap items-center gap-2">
          <p className="w-full font-bold">{t('toolkit.mine.confirmDelete')}</p>
          <button type="button" className="btn btn-primary min-h-11 px-4 text-sm" onClick={() => deletePrompt(prompt.id)}>
            {t('toolkit.mine.yesDelete')}
          </button>
          <button type="button" className="btn btn-quiet min-h-11 px-4 text-sm" onClick={() => setMode('view')}>
            {t('settings.cancel')}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={prompt.text} primary />
          <button type="button" className="btn btn-quiet min-h-11 px-4 text-sm" onClick={() => setMode('edit')}>
            {t('toolkit.mine.edit')}
          </button>
          <button type="button" className="btn btn-quiet min-h-11 px-4 text-sm" onClick={() => setMode('confirm')}>
            {t('toolkit.mine.delete')}
          </button>
        </div>
      )}
    </li>
  );
}

export function MyPromptsPage() {
  const { t } = useTranslation();
  const { toolkit } = useContent();
  const mine = usePrompts((s) => s.mine);
  const favouriteKeys = usePrompts((s) => s.favourites);

  // Favourites are stored as "kind:id"; show them in the current language.
  type Favourite = { key: string; kind: FavouriteKind; id: string; title: string; prompt?: string; note?: string };
  const favourites = favouriteKeys.flatMap((key): Favourite[] => {
    const [kind, id] = key.split(':') as [FavouriteKind, string];
    const template = kind === 'template' ? toolkit.templates.find((x) => x.id === id) : undefined;
    const example = kind === 'gallery' ? toolkit.gallery.find((x) => x.id === id) : undefined;
    const tip = kind === 'tip' ? toolkit.tips.find((x) => x.id === id) : undefined;
    if (template) return [{ key, kind, id, title: template.title, prompt: template.prompt }];
    if (example) return [{ key, kind, id, title: example.title, prompt: example.strong }];
    if (tip) return [{ key, kind, id, title: tip.title, note: `${tip.text} ${tip.example}` }];
    return []; // content that no longer exists
  });

  return (
    <Page title={t('toolkit.tools.mine.title')} back="/prompts">
      <p className="text-ink-soft mt-2 text-lg">{t('toolkit.mine.intro')}</p>

      <section aria-labelledby="yours" className="mt-6">
        <h2 id="yours" className="font-display text-2xl font-semibold">
          {t('toolkit.mine.yours')}
        </h2>
        {mine.length ? (
          <ul className="mt-3 space-y-4">
            {mine.map((p) => (
              <SavedCard key={p.id} prompt={p} />
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft mt-1">{t('toolkit.mine.none')}</p>
        )}
      </section>

      <section aria-labelledby="new-prompt" className="card mt-6">
        <h2 id="new-prompt" className="mb-3 text-lg font-extrabold">
          {t('toolkit.mine.newTitle')}
        </h2>
        <PromptForm idPrefix="new" submitLabel={t('toolkit.mine.add')} onSubmit={savePrompt} />
      </section>

      <section aria-labelledby="favourites" className="mt-8">
        <h2 id="favourites" className="font-display text-2xl font-semibold">
          {t('toolkit.mine.favourites')}
        </h2>
        {favourites.length ? (
          <ul className="mt-3 space-y-4">
            {favourites.map((f) => (
              <li key={f.key} className="card">
                <p className="eyebrow text-accent-ink">{t(`toolkit.mine.kind.${f.kind}`)}</p>
                <h3 className="mb-2 text-lg leading-snug font-extrabold">{f.title}</h3>
                {f.prompt ? <PromptText text={f.prompt} /> : <p>{f.note}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {f.prompt && <CopyButton text={f.prompt} primary />}
                  <FavouriteButton kind={f.kind} id={f.id} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft mt-1">{t('toolkit.mine.noFavourites')}</p>
        )}
      </section>
    </Page>
  );
}
