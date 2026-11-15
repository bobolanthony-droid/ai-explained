import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/Page';
import { useContent } from '@/i18n';

/**
 * "Fix my prompt": tick what your prompt already does. Each box left unticked
 * shows one concrete suggestion. Nothing is saved; it is a thinking aid.
 */
export function ChecklistPage() {
  const { t } = useTranslation();
  const { checklist } = useContent().toolkit;
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const todo = checklist.filter((item) => !ticked.has(item.id));

  const flip = (id: string) => {
    const next = new Set(ticked);
    if (!next.delete(id)) next.add(id);
    setTicked(next);
  };

  return (
    <Page title={t('toolkit.tools.checklist.title')} back="/prompts">
      <p className="text-ink-soft mt-2 text-lg">{t('toolkit.checklist.intro')}</p>

      <ul className="card divide-line mt-5 divide-y p-0">
        {checklist.map((item) => (
          <li key={item.id}>
            <label className="flex min-h-14 cursor-pointer items-center gap-3 px-5 py-3 font-semibold">
              <input
                type="checkbox"
                className="accent-primary size-6 shrink-0"
                checked={ticked.has(item.id)}
                onChange={() => flip(item.id)}
              />
              {item.question}
            </label>
          </li>
        ))}
      </ul>

      {/* role=status: the suggestions update as boxes are ticked. */}
      <section role="status" className="mt-8">
        {todo.length ? (
          <>
            <h2 className="font-display text-2xl font-semibold">{t('toolkit.checklist.ideas')}</h2>
            <ul className="mt-3 space-y-3">
              {todo.map((item) => (
                <li key={item.id} className="bg-accent-soft rounded-2xl p-4">
                  {item.suggestion}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="bg-primary-soft rounded-2xl p-4 text-lg font-semibold">{t('toolkit.checklist.allDone')}</p>
        )}
      </section>

      {ticked.size > 0 && (
        <button type="button" className="btn btn-quiet mt-6 w-full" onClick={() => setTicked(new Set())}>
          {t('toolkit.checklist.reset')}
        </button>
      )}
    </Page>
  );
}
