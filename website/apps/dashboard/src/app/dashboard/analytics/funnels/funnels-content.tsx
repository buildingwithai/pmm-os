'use client';

import type { FunnelResult, AnalyticsProvider } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { downloadCSV } from '@/lib/analytics/csv-export';

function FunnelBar({ label, value, total, max, index }: {
  label: string;
  value: number;
  total: number;
  max: number;
  index: number;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const widthPct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between text-sm'>
        <span className='font-mono text-xs text-muted-foreground'>{label}</span>
        <span className='font-medium'>{value.toLocaleString()} ({pct.toFixed(1)}%)</span>
      </div>
      <div className='relative h-10 w-full'>
        <div
          className='absolute inset-y-0 left-0 rounded bg-primary/20 transition-all'
          style={{ width: `${widthPct}%` }}
        />
        <div className='absolute inset-y-0 left-0 flex w-full items-center px-3'>
          <span className='text-sm font-medium'>Step {index + 1}</span>
        </div>
      </div>
    </div>
  );
}

export function FunnelsContent({
  data,
  provider
}: {
  data: FunnelResult;
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
              data.steps.map((s) => ({
                path: s.path,
                sessions: s.sessions,
                dropoff: s.dropoff,
                conversionRate: s.conversionRate
              })),
              'funnels'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      {data.steps.length > 0 && data.totalSessions > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Page Flow Funnel
              <span className='ml-2 text-sm font-normal text-muted-foreground'>
                ({data.totalSessions} total sessions)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {data.steps.map((step, i) => (
              <FunnelBar
                key={step.path}
                label={step.path}
                value={step.sessions}
                total={data.totalSessions}
                max={data.steps[0].sessions}
                index={i}
              />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='py-16 text-center'>
            <Icons.adjustments className='text-muted-foreground mx-auto mb-3 size-10' />
            <p className='text-muted-foreground text-sm'>
              Not enough data for funnel analysis. Visit more pages across your sites to generate funnel data.
            </p>
          </CardContent>
        </Card>
      )}

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
