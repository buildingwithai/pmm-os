'use client';

import type { PageAnalyticsResult, AnalyticsProvider } from '@/lib/analytics/types';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateRangePicker } from '@/components/date-range-picker';
import { downloadCSV } from '@/lib/analytics/csv-export';
import { PagesTable } from './pages-table';

export function PagesContent({
  data,
  provider
}: {
  data: PageAnalyticsResult;
  provider: AnalyticsProvider;
}) {
  return (
    <div className='space-y-6 p-4 md:p-6'>
      <div className='flex items-center justify-between'>
        <DateRangePicker />
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            downloadCSV(
              data.pages.map((p) => ({
                path: p.path,
                title: p.title,
                views: p.views,
                visitors: p.uniqueVisitors
              })),
              'pages'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>
      <PagesTable initialData={data} />
      {provider === 'local-template' && (
        <Card className='border-dashed'>
          <CardContent className='py-6 text-center'>
            <Icons.info className='text-muted-foreground mx-auto mb-2 size-8' />
            <p className='text-muted-foreground text-sm'>
              Running in template mode. Set{' '}
              <code className='rounded bg-muted px-1 py-0.5 text-xs'>NEXT_PUBLIC_ANALYTICS_PROVIDER=convex</code>{' '}
              to use live data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
