import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TabBar } from '@/components/TabBar';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { TermSheet } from '@/features/glossary/TermSheet';

export function AppShell() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const lastPath = useRef(pathname);

  // After each navigation: back to the top, and move keyboard / screen-reader
  // focus to the new page (a single-page app does not do this by itself).
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <a
        href="#main"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        {t('nav.skip')}
      </a>
      <Header />
      <main id="main" ref={main} tabIndex={-1} className="flex-1 px-5 pt-6 pb-32">
        <Outlet />
      </main>
      <TabBar />
      <UpdatePrompt />
      <TermSheet />
    </div>
  );
}
