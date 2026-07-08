import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getErrors } from '@/lib/analytics/provider';
import { ErrorsContent } from './errors-content';

export const metadata: Metadata = { title: 'Errors - Analytics' };

export default async function ErrorsPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const data = await getErrors(startTime);

  return (
    <PageContainer pageTitle='Errors' pageDescription='Tracked errors across your sites.'>
      <ErrorsContent data={data} provider={provider} />
    </PageContainer>
  );
}
