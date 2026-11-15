import { useTranslation } from 'react-i18next';
import { FavouriteButton } from '@/components/FavouriteButton';
import { Page } from '@/components/Page';
import { PromptBox, PromptText } from '@/components/PromptBox';
import { useContent } from '@/i18n';

/** Before/after gallery: a weak prompt, its strong rewrite, and why it works. */
export function GalleryPage() {
  const { t } = useTranslation();
  const { gallery } = useContent().toolkit;
  return (
    <Page title={t('toolkit.tools.gallery.title')} back="/prompts">
      <p className="text-ink-soft mt-2 text-lg">{t('toolkit.gallery.intro')}</p>
      <ul className="mt-5 space-y-4">
        {gallery.map((item) => (
          <li key={item.id} className="card">
            <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
            <h3 className="eyebrow text-ink-soft mt-3 mb-1">{t('toolkit.before')}</h3>
            <PromptText text={item.weak} muted />
            <h3 className="eyebrow text-primary mt-4 mb-1">{t('toolkit.after')}</h3>
            <PromptBox text={item.strong} pickOther={(c) => c.toolkit.gallery.find((g) => g.id === item.id)?.strong}>
              <FavouriteButton kind="gallery" id={item.id} />
            </PromptBox>
            <h3 className="eyebrow text-accent-ink mt-4">{t('toolkit.gallery.why')}</h3>
            <p className="mt-1">{item.why}</p>
          </li>
        ))}
      </ul>
    </Page>
  );
}
