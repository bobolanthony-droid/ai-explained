import { expect, test } from '@playwright/test';

/**
 * Performance budget on a simulated mid-range phone.
 *
 * Uses the same throttling as Lighthouse's mobile profile: slow 4G
 * (1.6 Mbps down, 150 ms latency) and a 4x slower processor, on a cold load
 * with no service worker. It measures the three numbers that drive most of the
 * Lighthouse performance score, against Google's "good" thresholds:
 *
 *   LCP  largest contentful paint  <= 2.5 s   (main content visible)
 *   TBT  total blocking time       <= 200 ms  (page stays responsive)
 *   CLS  cumulative layout shift   <= 0.1     (nothing jumps around)
 *
 * Measurements under throttling vary from run to run, so the test fails only
 * on a clear regression (LCP over 3 s, TBT over 400 ms, CLS over 0.1) and
 * prints the real numbers every time.
 *
 * This is not a Lighthouse score. To get one, run `npm run preview` and use the
 * Lighthouse tab in Chrome DevTools.
 */
test.use({ serviceWorkers: 'block' });

for (const path of ['/welcome', '/learn/not-late', '/glossary', '/prompts/builder']) {
  test(`performance budget: ${path}`, async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      // Returning user, so /learn and others do not bounce to the welcome screen.
      localStorage.setItem(
        'ai-explained:progress',
        JSON.stringify({ state: { completed: {}, lastLesson: null, bookmarks: [], notes: {}, exercises: {}, plan: [], welcome: { done: true } }, version: 1 }),
      );
      const w = window as unknown as { __perf: { lcp: number; cls: number; tbt: number } };
      w.__perf = { lcp: 0, cls: 0, tbt: 0 };
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) w.__perf.lcp = e.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) w.__perf.cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => {
        // Blocking time = the part of each long task beyond 50 ms.
        for (const e of list.getEntries()) w.__perf.tbt += Math.max(0, e.duration - 50);
      }).observe({ type: 'longtask', buffered: true });
    });

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForTimeout(1000); // let late layout shifts and tasks be recorded

    const perf = await page.evaluate(() => (window as unknown as { __perf: { lcp: number; cls: number; tbt: number } }).__perf);
    const transferred = await page.evaluate(() =>
      (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).reduce((sum, r) => sum + r.transferSize, 0),
    );
    const line = `${path}: LCP ${(perf.lcp / 1000).toFixed(2)} s, TBT ${Math.round(perf.tbt)} ms, CLS ${perf.cls.toFixed(3)}, downloaded ${Math.round(transferred / 1024)} kB`;
    console.log(line);
    testInfo.annotations.push({ type: 'performance', description: line });

    expect(perf.lcp, 'LCP (ms)').toBeLessThanOrEqual(3000);
    expect(perf.tbt, 'TBT (ms)').toBeLessThanOrEqual(400);
    expect(perf.cls, 'CLS').toBeLessThanOrEqual(0.1);
  });
}
