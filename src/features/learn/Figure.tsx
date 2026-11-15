import type { FullLesson } from '@/content/lessons';

type FigureData = NonNullable<FullLesson['sections'][number]['figure']>;

/**
 * Small diagrams for lessons. The drawing is code; the words inside it come
 * from the lesson file (`labels`), so they are translated like any other text.
 * Screen readers get the `alt` text instead of the picture.
 */
export function Figure({ figure }: { figure: FigureData }) {
  return (
    <figure className="mt-4">
      {figure.id === 'nested-circles' && <Nested labels={figure.labels} alt={figure.alt} />}
      {figure.caption && <figcaption className="text-ink-soft mt-2 text-center text-sm">{figure.caption}</figcaption>}
    </figure>
  );
}

/** Three boxes, one inside the other: "this is part of that". */
function Nested({ labels, alt }: { labels: string[]; alt: string }) {
  const boxes = [
    { x: 4, y: 4, w: 312, h: 196, fill: 'var(--primary-soft)', stroke: 'var(--primary)' },
    { x: 20, y: 44, w: 280, h: 140, fill: 'var(--accent-soft)', stroke: 'var(--accent)' },
    { x: 36, y: 84, w: 248, h: 84, fill: 'var(--surface)', stroke: 'var(--line-strong)' },
  ];
  return (
    <svg viewBox="0 0 320 204" role="img" aria-label={alt} className="mx-auto w-full max-w-sm">
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="18" fill={b.fill} stroke={b.stroke} strokeWidth="2" />
          <text x={b.x + 16} y={b.y + 27} fontSize="16" fontWeight="800" fill="var(--ink)">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}
