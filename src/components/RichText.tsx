import { parseRichText } from '@/content/richtext';
import { openTerm } from '@/features/glossary/sheetStore';
import { useGlossary } from '@/features/glossary/useGlossary';

/**
 * Renders content text. A [[term]] link becomes a button that opens the
 * definition in a bottom sheet, so the reader never loses their place.
 */
export function RichText({ text }: { text: string }) {
  const { nameOf } = useGlossary();
  return (
    <>
      {parseRichText(text).map((seg, i) =>
        'text' in seg ? (
          seg.text
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => openTerm(seg.termId)}
            // Dotted underline = "tap for a definition" (not marked by colour alone).
            className="text-primary font-bold underline decoration-dotted decoration-2 underline-offset-4"
          >
            {seg.label ?? nameOf(seg.termId)}
          </button>
        ),
      )}
    </>
  );
}
