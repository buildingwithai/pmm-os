import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getPerformanceMetrics } from '@/lib/analytics/provider';
import { PerformanceContent } from './performance-content';

export const metadata: Metadata = {
  title: 'Performance - Analytics'
};

export default async function PerformancePage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const data = await getPerformanceMetrics(startTime);

  return (
    <PageContainer pageTitle='Performance' pageDescription='Web vitals and performance metrics.'>
      <PerformanceContent data={data} provider={provider} />
    </PageContainer>
  );
}
