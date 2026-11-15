import { Page } from '@/components/Page';
import { PlanChecklist } from '@/features/learn/PlanChecklist';
import { useContent } from '@/i18n';

/** The 30-day plan on its own page, reached from the Me tab. */
export function PlanPage() {
  const { plan } = useContent().pages;
  return (
    <Page title={plan.title} back="/me">
      <p className="text-ink-soft mt-2 text-lg">{plan.intro}</p>
      <PlanChecklist />
    </Page>
  );
}
