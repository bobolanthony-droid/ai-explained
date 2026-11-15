import { useTranslation } from 'react-i18next';
import { useContent } from '@/i18n';
import { togglePlanStep, useProgress } from '@/store/progress';

/**
 * The personal "next 30 days" plan: one small step a week, ticked off as you go.
 * Saved on the device. Shown in Lesson 8 and under the Me tab.
 * There are no dates and no reminders: it is a plan, not a deadline.
 */
export function PlanChecklist() {
  const { t } = useTranslation();
  const { plan } = useContent().pages;
  const done = useProgress((s) => s.plan);
  const count = plan.steps.filter((step) => done.includes(step.id)).length;

  return (
    <div className="mt-4">
      <ul className="card divide-line divide-y p-0">
        {plan.steps.map((step) => (
          <li key={step.id}>
            <label className="flex min-h-14 cursor-pointer items-start gap-3 px-5 py-4">
              <input
                type="checkbox"
                className="accent-primary mt-1 size-6 shrink-0"
                checked={done.includes(step.id)}
                onChange={() => togglePlanStep(step.id)}
              />
              <span>
                <span className="block font-extrabold">{step.title}</span>
                <span className="text-ink-soft block">{step.text}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p role="status" className="text-ink-soft mt-2 text-sm">
        {count === plan.steps.length ? plan.done : t('plan.count', { done: count, total: plan.steps.length })}
      </p>
    </div>
  );
}
