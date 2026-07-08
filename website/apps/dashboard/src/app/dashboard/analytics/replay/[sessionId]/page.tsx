import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { getReplayDetail } from '@/lib/analytics/provider';
import { ReplayPlayerContent } from './replay-player-content';

export const metadata: Metadata = {
  title: 'Session Replay - Analytics'
};

export default async function ReplaySessionPage({
  params
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const data = await getReplayDetail(sessionId);

  if (!data) notFound();

  return (
    <PageContainer pageTitle='Session Replay' pageDescription={`Replaying session ${sessionId.slice(0, 12)}...`}>
      <ReplayPlayerContent data={data} />
    </PageContainer>
  );
}
