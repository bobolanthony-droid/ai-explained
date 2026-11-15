import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RichText } from './RichText';

/**
 * The "Explain it even simpler" toggle: reveals the "like I'm 10" version.
 * A real <button> with aria-expanded, so it works with keyboard and screen readers.
 */
export function Simpler({ text }: { text: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="mt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="btn btn-quiet min-h-11 text-sm"
      >
        {open ? t('simpler.hide') : t('simpler.show')}
      </button>
      <div id={panelId} hidden={!open} className="bg-accent-soft mt-3 rounded-2xl p-4">
        <p className="eyebrow text-accent-ink">{t('simpler.label')}</p>
        <p className="mt-1 text-lg">
          <RichText text={text} />
        </p>
      </div>
    </div>
  );
}
