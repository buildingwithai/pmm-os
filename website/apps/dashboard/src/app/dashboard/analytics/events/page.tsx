import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getAnalyticsSummary } from '@/lib/analytics/provider';
import { EventsContent } from './events-content';

export const metadata: Metadata = { title: 'Events - Analytics' };

export default async function EventsPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const summary = await getAnalyticsSummary(startTime);

  return (
    <PageContainer pageTitle='Events' pageDescription='Custom events and event types.'>
      <EventsContent summary={summary} provider={provider} />
    </PageContainer>
  );
}
