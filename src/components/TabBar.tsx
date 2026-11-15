import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { BookIcon, ChatIcon, PathIcon, PersonIcon, PracticeIcon } from './icons';

// `also`: other URLs that belong to this tab (a lesson lives under Learn).
const TABS: { to: string; key: string; icon: ReactNode; end?: boolean; also?: RegExp }[] = [
  { to: '/', key: 'learn', icon: <PathIcon />, end: true, also: /^\/(learn|welcome)/ },
  { to: '/glossary', key: 'glossary', icon: <BookIcon /> },
  { to: '/prompts', key: 'prompts', icon: <ChatIcon /> },
  { to: '/practice', key: 'practice', icon: <PracticeIcon /> },
  { to: '/me', key: 'me', icon: <PersonIcon /> },
];

export function TabBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <nav
      aria-label={t('nav.label')}
      className="bg-surface border-line fixed inset-x-0 bottom-0 z-20 border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-xl">
        {TABS.map((tab) => (
          <li key={tab.key} className="min-w-0 flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className="flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 font-bold"
            >
              {({ isActive: exact }) => {
                const isActive = exact || (tab.also?.test(pathname) ?? false);
                return (
                <span className={`contents ${isActive ? 'text-primary' : 'text-ink-soft'}`}>
                  {/* Active tab = colour AND a pill behind the icon (never colour alone). */}
                  <span className={`rounded-full px-4 py-0.5 ${isActive ? 'bg-primary-soft' : ''}`}>
                    {tab.icon}
                  </span>
                  {/* Capped by viewport width so 5 labels fit even at the largest text size. */}
                  <span className="max-w-full truncate text-[min(0.75rem,3.3vw)]">
                    {t(`nav.${tab.key}`)}
                  </span>
                </span>
                );
              }}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
