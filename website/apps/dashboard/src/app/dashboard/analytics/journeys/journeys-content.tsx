'use client';

import type { JourneyResult, AnalyticsProvider } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { downloadCSV } from '@/lib/analytics/csv-export';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { JourneySankey } from './journey-sankey';

export function JourneysContent({
  data,
  provider
}: {
  data: JourneyResult;
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
              data.transitions.map((t) => ({
                from: t.from,
                to: t.to,
                count: t.count
              })),
              'journeys'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      {data.transitions.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Flow Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <JourneySankey transitions={data.transitions} />
            </CardContent>
          </Card>

          <div>
            <p className='mb-3 text-sm text-muted-foreground'>
              Top {data.transitions.length} page-to-page transitions
            </p>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {data.transitions.map((t, _i) => (
                <Card key={`${t.from}->${t.to}`}>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Badge variant='secondary' className='max-w-[120px] truncate text-[10px]'>
                        {t.from}
                      </Badge>
                      <Icons.arrowRight className='size-3 shrink-0 text-muted-foreground' />
                      <Badge variant='secondary' className='max-w-[120px] truncate text-[10px]'>
                        {t.to}
                      </Badge>
                    </div>
                    <p className='mt-2 text-right text-lg font-bold'>{t.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className='py-16 text-center'>
            <Icons.gitBranch className='text-muted-foreground mx-auto mb-3 size-10' />
            <p className='text-muted-foreground text-sm'>
              Not enough data for journey analysis. Visit multiple pages to see how users navigate between them.
            </p>
          </CardContent>
        </Card>
      )}

      {provider === 'local-template' && (
        <Card className='border-dashed'>
          <CardContent className='py-6'>
            <div className='text-center'>
              <Icons.info className='text-muted-foreground mx-auto mb-2 size-8' />
              <p className='text-muted-foreground text-sm'>
                Running in template mode. Set{' '}
                <code className='rounded bg-muted px-1 py-0.5 text-xs'>NEXT_PUBLIC_ANALYTICS_PROVIDER=convex</code>{' '}
                to use live data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
