import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getReplaySessions } from '@/lib/analytics/provider';
import { ReplayListContent } from './replay-list-content';

export const metadata: Metadata = {
  title: 'Session Replay - Analytics'
};

export default async function ReplayPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const data = await getReplaySessions(startTime);

  return (
    <PageContainer pageTitle='Session Replay' pageDescription='Recorded browsing sessions with event timelines.'>
      <ReplayListContent data={data} provider={provider} />
    </PageContainer>
  );
}
