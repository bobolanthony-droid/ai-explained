import { Page } from '@/components/Page';
import { useContent } from '@/i18n';

export function WhyPage() {
  const { why } = useContent().pages;
  return (
    <Page title={why.title} back="/me">
      <div className="mt-5 space-y-4 text-lg">
        {why.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </Page>
  );
}
