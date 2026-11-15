import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { splitPlaceholders } from '@/content/richtext';
import type { LocaleContent } from '@/content/schema';
import { useOtherLocales } from '@/i18n';
import { CopyButton } from './CopyButton';

/** A prompt as written, with line breaks kept and [placeholders] highlighted. */
export function PromptText({ text, muted = false }: { text: string; muted?: boolean }) {
  return (
    <p className={`border-line rounded-2xl border p-4 whitespace-pre-wrap ${muted ? 'bg-soft text-ink-soft' : 'bg-bg'}`}>
      {splitPlaceholders(text).map((part, i) =>
        part.placeholder ? (
          // Bold + tinted: a placeholder is never marked by colour alone.
          <mark key={i} className="bg-accent-soft text-accent-ink rounded px-0.5 font-bold">
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </p>
  );
}

/**
 * A prompt with its copy buttons: "Copy", plus "Copy in French/English" so the
 * user can take the prompt in whichever language they use with their AI tool.
 * @param pickOther finds the same prompt in another language's content
 */
export function PromptBox(props: {
  text: string;
  pickOther?: (content: LocaleContent) => string | undefined;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const others = useOtherLocales();
  return (
    <div>
      <PromptText text={props.text} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CopyButton text={props.text} primary />
        {props.pickOther &&
          others.map(({ info, content }) => {
            const other = props.pickOther!(content);
            return other ? (
              <CopyButton key={info.code} text={other} label={t('copy.copyIn', { language: info.name })} />
            ) : null;
          })}
        {props.children}
      </div>
    </div>
  );
}
