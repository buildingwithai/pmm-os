import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getSessions } from '@/lib/analytics/provider';
import { SessionsContent } from './sessions-content';

export const metadata: Metadata = { title: 'Sessions - Analytics' };

export default async function SessionsPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const data = await getSessions(startTime);

  return (
    <PageContainer pageTitle='Sessions' pageDescription='Browse individual user sessions.'>
      <SessionsContent data={data} provider={provider} />
    </PageContainer>
  );
}
