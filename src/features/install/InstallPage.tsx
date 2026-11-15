import { Page } from '@/components/Page';
import { useContent } from '@/i18n';
import { type Platform, promptInstall, useInstall } from './install';

/** Step-by-step install instructions. The steps for this device come first. */
export function InstallPage() {
  const text = useContent().pages.install;
  const { installed, canPrompt, platform } = useInstall();
  const order: Platform[] = platform === 'android' ? ['android', 'ios', 'other'] : platform === 'ios' ? ['ios', 'android', 'other'] : ['other', 'ios', 'android'];

  return (
    <Page title={text.title} back="/me">
      <p className="mt-3 text-lg">{text.intro}</p>

      {installed && <p className="bg-primary-soft mt-5 rounded-2xl p-4 font-semibold">{text.installed}</p>}

      {canPrompt && (
        <button type="button" className="btn btn-primary mt-5 min-h-14 w-full text-lg" onClick={() => void promptInstall()}>
          {text.installNow}
        </button>
      )}

      {order.map((p) =>
        p === 'other' ? (
          <section key={p} className="card mt-5">
            <h2 className="text-lg font-extrabold">{text.desktop.title}</h2>
            <p className="mt-2">{text.desktop.text}</p>
          </section>
        ) : (
          <section key={p} className="card mt-5">
            <h2 className="text-lg font-extrabold">{text[p].title}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6 text-lg">
              {text[p].steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        ),
      )}

      <p className="text-ink-soft mt-5">{text.note}</p>
    </Page>
  );
}
