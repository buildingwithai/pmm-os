import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getJourneyData } from '@/lib/analytics/provider';
import { JourneysContent } from './journeys-content';

export const metadata: Metadata = { title: 'Journeys - Analytics' };

export default async function JourneysPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const data = await getJourneyData(startTime);

  return (
    <PageContainer pageTitle='Journeys' pageDescription='User path analysis and flow.'>
      <JourneysContent data={data} provider={provider} />
    </PageContainer>
  );
}
