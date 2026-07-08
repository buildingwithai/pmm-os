import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getRetentionData } from '@/lib/analytics/provider';
import { RetentionContent } from './retention-content';

export const metadata: Metadata = { title: 'Retention - Analytics' };

export default async function RetentionPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const data = await getRetentionData(startTime);

  return (
    <PageContainer pageTitle='Retention' pageDescription='Cohort retention analysis.'>
      <RetentionContent data={data} provider={provider} />
    </PageContainer>
  );
}
