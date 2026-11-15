import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Registers the service worker (which makes the app work offline, silently)
 * and shows one notice: "A new version is ready".
 * We never reload on our own; the user chooses when to update.
 */
export function UpdatePrompt() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <div role="status" className="fixed inset-x-4 bottom-24 z-30 mx-auto max-w-md">
      {needRefresh && (
        <div className="card flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <p className="font-semibold">{t('update.available')}</p>
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={() => void updateServiceWorker(true)}>
              {t('update.reload')}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setNeedRefresh(false)}>
              {t('update.later')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
