import type { OtherName } from './useGlossary';

/** The term's name in the other language(s), e.g. "FR  IA générative". */
export function OtherNames({ names }: { names: OtherName[] }) {
  if (!names.length) return null;
  return (
    <span className="text-ink-soft mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm">
      {names.map((o) => (
        <span key={o.code}>
          <span className="border-line-strong mr-1.5 rounded border px-1 text-xs font-bold">{o.label}</span>{" "}
          {/* lang makes screen readers pronounce it in the right language */}
          <span lang={o.code}>{o.name}</span>
        </span>
      ))}
    </span>
  );
}
