import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BackIcon } from './icons';

/** Common page frame: browser-tab title, optional back link, and the <h1>. */
/** `kicker` is the small line above the title, e.g. "Lesson 1 · 6 min". */
export function Page(props: {
  title: string;
  heading?: string;
  kicker?: string;
  back?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const appName = t('app.name');
  useEffect(() => {
    document.title = `${props.title} · ${appName}`;
  }, [props.title, appName]);

  return (
    <>
      {props.back && (
        <Link
          to={props.back}
          className="text-primary mb-2 -ml-2 inline-flex min-h-11 items-center gap-1 pr-3 font-bold"
        >
          <BackIcon />
          {t('nav.back')}
        </Link>
      )}
      {props.kicker && <p className="eyebrow text-accent-ink mb-1">{props.kicker}</p>}
      <h1 className="font-display text-3xl leading-tight font-semibold text-balance">
        {props.heading ?? props.title}
      </h1>
      {props.children}
    </>
  );
}
