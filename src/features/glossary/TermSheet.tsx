import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { RichText } from '@/components/RichText';
import { Simpler } from '@/components/Simpler';
import { OtherNames } from './OtherNames';
import { closeTerm, useTermSheet } from './sheetStore';
import { useGlossary } from './useGlossary';

/**
 * Bottom sheet with a term's definition. Opened by tapping any [[term]] link,
 * so the reader gets the meaning without leaving the page they are on.
 *
 * Uses the native <dialog>: focus is trapped inside, Escape closes it, and
 * focus returns to the tapped word afterwards, with no extra code.
 */
export function TermSheet() {
  const { t } = useTranslation();
  const termId = useTermSheet((s) => s.termId);
  const { byId } = useGlossary();
  const dialog = useRef<HTMLDialogElement>(null);
  const { pathname } = useLocation();
  const term = termId ? byId.get(termId) : undefined;

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (term && !el.open) el.showModal();
    if (!term && el.open) el.close();
  }, [term]);

  // Following "Open the full entry" (or any navigation) closes the sheet.
  useEffect(() => closeTerm, [pathname]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="term-sheet-title"
      onClose={closeTerm}
      // A tap on the dimmed area outside the sheet closes it.
      onClick={(e) => e.target === dialog.current && closeTerm()}
      className="bg-surface text-ink fixed inset-x-0 top-auto bottom-0 mx-auto max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl p-0"
    >
      {term && (
        <div className="px-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="term-sheet-title" className="font-display text-2xl leading-tight font-semibold">
                {term.term}
              </h2>
              <OtherNames names={term.otherNames} />
            </div>
            <button type="button" onClick={closeTerm} className="btn btn-quiet min-h-11 shrink-0 px-4 text-sm">
              {t('glossary.close')}
            </button>
          </div>
          <p className="mt-4 text-lg font-semibold">
            <RichText text={term.definition} />
          </p>
          <Simpler key={term.id} text={term.simpler} />
          <p className="eyebrow text-primary mt-5">{t('glossary.analogy')}</p>
          <p className="mt-1">
            <RichText text={term.analogy} />
          </p>
          <Link to={`/glossary/${term.id}`} onClick={closeTerm} className="btn btn-primary mt-6 w-full">
            {t('glossary.openFull')}
          </Link>
        </div>
      )}
    </dialog>
  );
}
