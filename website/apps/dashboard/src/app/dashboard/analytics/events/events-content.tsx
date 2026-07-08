'use client';

import type { AnalyticsSummary, AnalyticsProvider } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { downloadCSV } from '@/lib/analytics/csv-export';

export function EventsContent({
  summary,
  provider
}: {
  summary: AnalyticsSummary;
  provider: AnalyticsProvider;
}) {
  const maxCount = Math.max(...summary.events.map((e) => e.count), 1);

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <div className='flex items-center justify-between'>
        <DateRangePicker />
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            downloadCSV(
              summary.events.map((e) => ({
                name: e.name,
                count: e.count,
                owner: e.owner
              })),
              'events'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Event Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.events.length > 0 ? (
            <div className='space-y-3'>
              {summary.events.map((event) => (
                <div key={event.name} className='flex items-center gap-3'>
                  <code className='w-36 shrink-0 truncate rounded bg-muted px-2 py-0.5 text-xs'>
                    {event.name}
                  </code>
                  <div className='flex flex-1 items-center gap-2'>
                    <div
                      className='h-6 rounded bg-primary/20 transition-all'
                      style={{ width: `${(event.count / maxCount) * 100}%` }}
                    />
                    <span className='w-12 shrink-0 text-right text-sm font-medium'>
                      {event.count.toLocaleString()}
                    </span>
                  </div>
                  <Badge variant='secondary' className='hidden sm:inline-flex'>
                    {event.owner}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex items-center justify-center py-12 text-center'>
              <div>
                <Icons.calendar className='text-muted-foreground mx-auto mb-3 size-10' />
                <p className='text-muted-foreground text-sm'>
                  No custom events tracked yet. Events appear here when your apps send custom_event types.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Recent Pageviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {summary.topPages.map((page) => (
              <div key={page.path} className='rounded-lg border p-3'>
                <p className='truncate text-sm font-medium'>{page.title}</p>
                <p className='truncate text-xs text-muted-foreground'>{page.path}</p>
                <div className='mt-2 flex gap-3 text-xs'>
                  <span>{page.views} views</span>
                  <span className='text-muted-foreground'>{page.visitors} unique</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
