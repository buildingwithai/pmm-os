'use client';

import Link from 'next/link';
import type { ReplaySessionsResult, AnalyticsProvider } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { downloadCSV } from '@/lib/analytics/csv-export';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export function ReplayListContent({
  data,
  provider
}: {
  data: ReplaySessionsResult;
  provider: AnalyticsProvider;
}) {
  return (
    <div className='space-y-6 p-4 md:p-6'>
      <div className='flex items-center justify-between'>
        <DateRangePicker />
          <Button
          aria-label='Download CSV'
          variant='outline'
          size='sm'
          onClick={() =>
            downloadCSV(
              data.sessions.map((s) => ({
                sessionId: s.sessionId,
                pageUrl: s.pageUrl,
                duration: s.duration,
                eventCount: s.eventCount,
                timestamp: s.timestamp
              })),
              'replay-sessions'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      {data.sessions.length > 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {data.sessions.map((s) => (
            <Link
              aria-label={`Open replay session ${s.sessionId}`}
              key={s.sessionId}
              href={`/dashboard/analytics/replay/${s.sessionId}`}
            >
              <Card className='cursor-pointer transition-colors hover:bg-accent/50'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-sm font-medium'>
                      <Icons.playerPlay className='mr-1 inline size-3.5' />
                      {s.sessionId.slice(0, 12)}...
                    </CardTitle>
                    <Badge variant='outline' className='text-xs'>
                      {s.eventCount} events
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-1 text-xs text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>Page</span>
                      <span className='font-medium text-foreground'>{s.pageUrl}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Duration</span>
                      <span className='font-medium text-foreground'>{formatDuration(s.duration)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Screen</span>
                      <span className='font-medium text-foreground'>
                        {s.screenWidth}x{s.screenHeight}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Recorded</span>
                      <span className='font-medium text-foreground'>
                        {new Date(s.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='py-16 text-center'>
            <Icons.playerPlay className='text-muted-foreground mx-auto mb-3 size-10' />
            <p className='text-muted-foreground text-sm'>
              No recorded sessions yet. Sessions are recorded automatically when the replay tracker is active.
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
                <code className='rounded bg-muted px-1 py-0.5 text-xs'>
                  NEXT_PUBLIC_ANALYTICS_PROVIDER=convex
                </code>{' '}
                to use live data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
