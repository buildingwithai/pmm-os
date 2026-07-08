import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getFunnelData, getAnalyticsSummary } from '@/lib/analytics/provider';
import { FunnelsContent } from './funnels-content';

export const metadata: Metadata = { title: 'Funnels - Analytics' };

export default async function FunnelsPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const summary = await getAnalyticsSummary(startTime);
  const topPaths = summary.topPages.map((p) => p.path);
  const defaultSteps = topPaths.length >= 2 ? topPaths.slice(0, 4) : ['/', '/pricing', '/signup', '/dashboard/overview'];
  const data = await getFunnelData(defaultSteps, startTime);

  return (
    <PageContainer pageTitle='Funnels' pageDescription='Conversion funnel analysis.'>
      <FunnelsContent data={data} provider={provider} />
    </PageContainer>
  );
}
