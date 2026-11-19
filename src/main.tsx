// Fonts are bundled with the app (no third-party requests, works offline).
import '@fontsource-variable/nunito';
import '@fontsource-variable/fraunces';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { guardAgainstTranslation } from './app/translationGuard';
import { startLocale } from './i18n';
import { watchInstall } from './features/install/install';
import { watchSettings } from './store/applySettings';

guardAgainstTranslation();
watchSettings();
watchInstall();

// Load the saved language's content first, so the first paint is already in it.
void startLocale().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
});
