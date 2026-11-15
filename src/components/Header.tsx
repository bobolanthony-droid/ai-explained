import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Renders "*AI* Expl*AI*ned": the parts between stars get the accent colour. */
function Wordmark({ text }: { text: string }) {
  return (
    <span aria-hidden="true">
      {text.split('*').map((part, i) =>
        i % 2 ? (
          <span key={i} className="text-accent-ink">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}

export function Header() {
  const { t } = useTranslation();
  const name = t('app.name');
  return (
    <header className="bg-bg/95 border-line sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-5 py-2 backdrop-blur">
      {/* Screen readers hear the plainly spelled name, not the mixed capitals. */}
      <Link
        to="/"
        aria-label={t('nav.home', { name })}
        className="font-display flex min-h-11 items-center text-[min(1.25rem,5.4vw)] font-semibold tracking-tight whitespace-nowrap"
      >
        <Wordmark text={t('app.wordmark')} />
      </Link>
      <LanguageSwitcher />
    </header>
  );
}
