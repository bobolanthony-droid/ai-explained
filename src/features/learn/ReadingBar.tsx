import { useEffect, useRef } from 'react';

/**
 * Thin bar at the very top showing how far down the lesson you are.
 * Decorative (hidden from screen readers). It writes straight to the DOM on
 * scroll, so scrolling never re-renders the lesson.
 */
export function ReadingBar() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${ratio})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return (
    <div aria-hidden="true" className="bg-line fixed inset-x-0 top-0 z-30 h-1.5">
      <div ref={bar} className="bg-accent h-full origin-left" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
