import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FavouriteButton } from '@/components/FavouriteButton';
import { Page } from '@/components/Page';
import { BackIcon, ChevronIcon } from '@/components/icons';
import { useContent } from '@/i18n';
import { prefersReducedMotion } from '@/store/applySettings';

/**
 * Tips as swipeable cards. Swipe sideways on a phone, or use the Previous /
 * Next buttons (keyboard and screen-reader friendly). The swiping itself is
 * plain CSS "scroll snap": no animation library.
 */
export function TipsPage() {
  const { t } = useTranslation();
  const { tips } = useContent().toolkit;
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const cards = () => Array.from(track.current?.children ?? []) as HTMLElement[];

  // Which card is showing: the one whose left edge is nearest the track's.
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const left = el.getBoundingClientRect().left;
    const distances = cards().map((card) => Math.abs(card.getBoundingClientRect().left - left));
    setIndex(distances.indexOf(Math.min(...distances)));
  };

  const go = (to: number) => {
    cards()[to]?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  return (
    <Page title={t('toolkit.tools.tips.title')} back="/prompts">
      <p className="text-ink-soft mt-2 text-lg">{t('toolkit.tips.intro')}</p>

      <ul
        ref={track}
        onScroll={onScroll}
        className="-mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3"
      >
        {tips.map((tip, i) => (
          <li
            key={tip.id}
            aria-label={t('toolkit.tips.count', { n: i + 1, total: tips.length })}
            className="card flex w-[85%] shrink-0 snap-center flex-col"
          >
            <p className="eyebrow text-accent-ink">{t('toolkit.tips.count', { n: i + 1, total: tips.length })}</p>
            <h2 className="font-display mt-1 text-2xl leading-tight font-semibold">{tip.title}</h2>
            <p className="mt-3 text-lg">{tip.text}</p>
            <p className="eyebrow text-primary mt-4">{t('toolkit.tips.example')}</p>
            <p className="bg-soft mt-1 mb-4 rounded-2xl p-3">{tip.example}</p>
            <div className="mt-auto">
              <FavouriteButton kind="tip" id={tip.id} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button type="button" className="btn btn-quiet px-4" disabled={index === 0} onClick={() => go(index - 1)}>
          <BackIcon />
          <span className="sr-only">{t('toolkit.tips.prev')}</span>
        </button>
        <p role="status" className="text-ink-soft text-sm font-bold">
          {t('toolkit.tips.count', { n: index + 1, total: tips.length })}
        </p>
        <button
          type="button"
          className="btn btn-quiet px-4"
          disabled={index === tips.length - 1}
          onClick={() => go(index + 1)}
        >
          <span className="sr-only">{t('toolkit.tips.next')}</span>
          <ChevronIcon />
        </button>
      </div>
    </Page>
  );
}
