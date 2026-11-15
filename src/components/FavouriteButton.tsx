import { useTranslation } from 'react-i18next';
import { toggleFavourite, usePrompts } from '@/store/prompts';
import { type FavouriteKind, favouriteKey } from '@/store/promptsLogic';
import { HeartIcon } from './icons';

/** Adds a template, tip or example to the favourites shown under "My prompts". */
export function FavouriteButton({ kind, id }: { kind: FavouriteKind; id: string }) {
  const { t } = useTranslation();
  const key = favouriteKey(kind, id);
  const on = usePrompts((s) => s.favourites.includes(key));
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggleFavourite(key)}
      className={`btn min-h-11 px-4 text-sm ${on ? 'bg-primary-soft text-primary' : 'btn-quiet'}`}
    >
      <HeartIcon filled={on} />
      {on ? t('favourite.added') : t('favourite.add')}
    </button>
  );
}
