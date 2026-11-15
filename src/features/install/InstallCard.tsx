import { Link } from 'react-router-dom';
import { useContent } from '@/i18n';
import { useSettings } from '@/store/settings';
import { promptInstall, useInstall } from './install';

/**
 * A gentle invitation to put the app on the home screen. Shown in the browser
 * only (never inside the installed app), and gone for good after "Not now".
 * The steps stay available under Me > Install the app.
 */
export function InstallCard() {
  const text = useContent().pages.install;
  const dismissed = useSettings((s) => s.installHintDismissed);
  const { installed, canPrompt } = useInstall();
  if (installed || dismissed) return null;

  return (
    <aside className="card border-accent mt-6 border-2">
      <h2 className="text-lg leading-snug font-extrabold">{text.cardTitle}</h2>
      <p className="text-ink-soft mt-1">{text.cardText}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {canPrompt ? (
          <button type="button" className="btn btn-primary min-h-11 px-4 text-sm" onClick={() => void promptInstall()}>
            {text.installNow}
          </button>
        ) : (
          <Link to="/me/install" className="btn btn-primary min-h-11 px-4 text-sm">
            {text.showSteps}
          </Link>
        )}
        <button
          type="button"
          className="btn btn-quiet min-h-11 px-4 text-sm"
          onClick={() => useSettings.setState({ installHintDismissed: true })}
        >
          {text.dismiss}
        </button>
      </div>
    </aside>
  );
}
