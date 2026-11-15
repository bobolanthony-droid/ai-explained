import { createBrowserRouter } from 'react-router-dom';
import { NotFound } from '@/features/NotFound';
import { LearnPage } from '@/features/learn/LearnPage';
import { WelcomePage } from '@/features/welcome/WelcomePage';
import { AppShell } from './AppShell';

/**
 * Routes.
 *
 * The first screens (Learn, Welcome) are in the main file so the app opens
 * fast. Every other screen is loaded the first time it is opened ("lazy"),
 * which keeps the first download small. The service worker has already
 * stored all of them, so this also works offline.
 *
 * The language is NOT part of the URL: switching language keeps the same
 * route, so the user stays exactly where they were.
 */
// When the app is hosted under a sub-path (GitHub Pages), routes sit below it.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const router = createBrowserRouter(
  [
  {
    element: <AppShell />,
    // Shown for an instant while the first lazy screen loads.
    hydrateFallbackElement: <></>,
    children: [
      { index: true, element: <LearnPage /> },
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'learn/:id', lazy: () => import('@/features/learn/LessonPage').then((m) => ({ Component: m.LessonPage })) },

      { path: 'glossary', lazy: () => import('@/features/glossary/GlossaryPage').then((m) => ({ Component: m.GlossaryPage })) },
      { path: 'glossary/:id', lazy: () => import('@/features/glossary/TermPage').then((m) => ({ Component: m.TermPage })) },

      { path: 'prompts', lazy: () => import('@/features/toolkit/ToolkitHome').then((m) => ({ Component: m.ToolkitHome })) },
      { path: 'prompts/recipe', lazy: () => import('@/features/toolkit/RecipePage').then((m) => ({ Component: m.RecipePage })) },
      { path: 'prompts/builder', lazy: () => import('@/features/toolkit/BuilderPage').then((m) => ({ Component: m.BuilderPage })) },
      { path: 'prompts/checklist', lazy: () => import('@/features/toolkit/ChecklistPage').then((m) => ({ Component: m.ChecklistPage })) },
      { path: 'prompts/gallery', lazy: () => import('@/features/toolkit/GalleryPage').then((m) => ({ Component: m.GalleryPage })) },
      { path: 'prompts/templates', lazy: () => import('@/features/toolkit/TemplatesPage').then((m) => ({ Component: m.TemplatesPage })) },
      { path: 'prompts/tips', lazy: () => import('@/features/toolkit/TipsPage').then((m) => ({ Component: m.TipsPage })) },
      { path: 'prompts/mine', lazy: () => import('@/features/toolkit/MyPromptsPage').then((m) => ({ Component: m.MyPromptsPage })) },

      { path: 'practice', lazy: () => import('@/features/practice/PracticePage').then((m) => ({ Component: m.PracticePage })) },
      { path: 'practice/:id', lazy: () => import('@/features/practice/ExercisePage').then((m) => ({ Component: m.ExercisePage })) },

      { path: 'me', lazy: () => import('@/features/me/MePage').then((m) => ({ Component: m.MePage })) },
      { path: 'me/settings', lazy: () => import('@/features/me/SettingsPage').then((m) => ({ Component: m.SettingsPage })) },
      { path: 'me/plan', lazy: () => import('@/features/me/PlanPage').then((m) => ({ Component: m.PlanPage })) },
      { path: 'me/why', lazy: () => import('@/features/me/WhyPage').then((m) => ({ Component: m.WhyPage })) },

      { path: '*', element: <NotFound /> },
    ],
  },
  ],
  { basename },
);
