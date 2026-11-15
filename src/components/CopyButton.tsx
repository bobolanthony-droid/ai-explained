import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon, CopyIcon } from './icons';

/** Copy to the clipboard, with a fallback for browsers that block the modern API. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

/**
 * One-tap copy. Shows "Copied" for two seconds, and says so to screen readers.
 * @param label defaults to "Copy"; pass e.g. "Copy in French" for the other-language button
 */
export function CopyButton({ text, label, primary = false }: { text: string; label?: string; primary?: boolean }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = setTimeout(() => setState('idle'), state === 'copied' ? 2000 : 5000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <>
      <button
        type="button"
        className={`btn min-h-11 px-4 text-sm ${primary ? 'btn-primary' : 'btn-quiet'}`}
        onClick={async () => setState((await copyText(text)) ? 'copied' : 'failed')}
      >
        {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
        {state === 'copied' ? t('copy.copied') : (label ?? t('copy.copy'))}
      </button>
      <span role="status" className={state === 'failed' ? 'text-sm' : 'sr-only'}>
        {state === 'copied' && t('copy.copied')}
        {state === 'failed' && t('copy.failed')}
      </span>
    </>
  );
}
