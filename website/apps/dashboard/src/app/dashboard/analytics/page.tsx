import type { Metadata } from 'next';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAnalyticsProvider, getAnalyticsSummary, getTimeSeries } from '@/lib/analytics/provider';
import { OverviewContent } from './overview-content';

export const metadata: Metadata = {
  title: 'Overview - Analytics'
};

export default async function AnalyticsOverviewPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const summary = await getAnalyticsSummary(startTime);
  const provider = getAnalyticsProvider();
  const timeSeries = await getTimeSeries(startTime);

  return (
    <PageContainer
      pageTitle='Overview'
      pageDescription='Website traffic and events across your sites.'
      pageHeaderAction={
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>{provider}</Badge>
          <Button asChild variant='outline' size='sm'>
            <Link href='/dashboard/feature-flags'>
              <Icons.settings className='size-4' />
              Configure
            </Link>
          </Button>
        </div>
      }
    >
      <OverviewContent summary={summary} timeSeries={timeSeries} provider={provider} />
    </PageContainer>
  );
}
