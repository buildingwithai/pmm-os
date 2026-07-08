import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getPageAnalytics } from '@/lib/analytics/provider';
import { PagesContent } from './pages-content';

export const metadata: Metadata = { title: 'Pages - Analytics' };

export default async function PagesPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const data = await getPageAnalytics(startTime);

  return (
    <PageContainer pageTitle='Pages' pageDescription='Top pages and their performance metrics.'>
      <PagesContent data={data} provider={provider} />
    </PageContainer>
  );
}
