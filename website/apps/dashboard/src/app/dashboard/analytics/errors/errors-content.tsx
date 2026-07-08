'use client';

import type { ErrorsResult, AnalyticsProvider } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { downloadCSV } from '@/lib/analytics/csv-export';

export function ErrorsContent({
  data,
  provider
}: {
  data: ErrorsResult;
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
              data.errors.map((e) => ({
                message: e.message,
                occurrences: e.count,
                sessions: e.uniqueSessions,
                lastSeen: new Date(e.lastSeen).toISOString()
              })),
              'errors'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      <div className='space-y-3'>
        {data.errors.length > 0 ? (
          data.errors.map((error) => (
            <Card key={error.message}>
              <CardHeader className='pb-2'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0 flex-1'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Icons.alertCircle className='size-4 shrink-0 text-destructive' />
                      <span className='truncate font-mono text-xs'>{error.message}</span>
                    </CardTitle>
                  </div>
                  <div className='flex shrink-0 items-center gap-3 text-right text-sm'>
                    <div>
                      <p className='font-medium'>{error.count.toLocaleString()}</p>
                      <p className='text-muted-foreground text-xs'>occurrences</p>
                    </div>
                    <div>
                      <p className='font-medium'>{error.uniqueSessions.toLocaleString()}</p>
                      <p className='text-muted-foreground text-xs'>sessions</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-x-6 gap-y-2 text-xs'>
                  {error.topPaths.length > 0 && (
                    <div>
                      <span className='text-muted-foreground'>Affected pages: </span>
                      {error.topPaths.map((p) => (
                        <Badge key={p.path} variant='outline' className='mr-1 text-[10px]'>
                          {p.path} ({p.count})
                        </Badge>
                      ))}
                    </div>
                  )}
                  {error.browsers.length > 0 && (
                    <div>
                      <span className='text-muted-foreground'>Browsers: </span>
                      {error.browsers.map((b) => (
                        <span key={b.browser} className='font-medium'>
                          {b.browser} ({b.count})
                          {b.browser !== error.browsers[error.browsers.length - 1]?.browser ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  <div>
                    <span className='text-muted-foreground'>Last seen: </span>
                    <span className='font-medium'>{new Date(error.lastSeen).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className='flex items-center justify-center py-20 text-center'>
            <div>
              <Icons.check className='text-muted-foreground mx-auto mb-3 size-10' />
              <p className='text-muted-foreground text-sm'>No errors tracked. Send events with type &quot;error&quot; to see them here.</p>
            </div>
          </div>
        )}
      </div>

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
