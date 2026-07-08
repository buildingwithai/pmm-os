import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { getAnalyticsProvider, getCountries } from '@/lib/analytics/provider';
import { CountriesContent } from './countries-content';

export const metadata: Metadata = {
  title: 'Countries - Analytics'
};

export default async function CountriesPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseInt(range || '30');
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const provider = getAnalyticsProvider();
  const data = await getCountries(startTime);

  return (
    <PageContainer pageTitle='Countries' pageDescription='Visitor geography and distribution.'>
      <CountriesContent data={data} provider={provider} />
    </PageContainer>
  );
}
