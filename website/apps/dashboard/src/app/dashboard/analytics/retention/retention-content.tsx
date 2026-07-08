'use client';

import type { RetentionResult, AnalyticsProvider } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { downloadCSV } from '@/lib/analytics/csv-export';

export function RetentionContent({
  data,
  provider
}: {
  data: RetentionResult;
  provider: AnalyticsProvider;
}) {
  const maxPct = Math.max(
    ...data.cohorts.flatMap((c) => c.retention.map((r) => r.percentage)),
    1
  );

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <div className='flex items-center justify-between'>
        <DateRangePicker />
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            downloadCSV(
              data.cohorts.flatMap((c) =>
                c.retention.map((r) => ({
                  cohort: c.cohort,
                  total: c.total,
                  weekOffset: r.weekOffset,
                  users: r.users,
                  percentage: r.percentage
                }))
              ),
              'retention'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      {data.cohorts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Weekly Cohort Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead>
                  <tr className='border-b'>
                    <th className='py-2 pr-4 text-left font-medium text-muted-foreground'>Cohort</th>
                    <th className='py-2 px-2 text-right font-medium text-muted-foreground'>Users</th>
                    {Array.from({ length: 12 }, (_, i) => (
                      <th key={i} className='w-10 py-2 px-1 text-center font-medium text-muted-foreground'>
                        W{i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.cohorts.map((cohort) => (
                    <tr key={cohort.cohort} className='border-b last:border-0 hover:bg-muted/50'>
                      <td className='py-2 pr-4 font-medium'>{cohort.cohort}</td>
                      <td className='py-2 px-2 text-right'>{cohort.total}</td>
                      {cohort.retention.map((cell, i) => (
                        <td key={i} className='p-1'>
                          <div
                            className='flex items-center justify-center rounded px-1 py-1.5 text-[10px] font-medium tabular-nums'
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${Math.max(0.1, cell.percentage / maxPct)})`,
                              color: cell.percentage > 50 ? 'hsl(var(--primary-foreground))' : undefined
                            }}
                          >
                            {cell.percentage.toFixed(0)}%
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='py-16 text-center'>
            <Icons.teams className='text-muted-foreground mx-auto mb-3 size-10' />
            <p className='text-muted-foreground text-sm'>
              Not enough data for retention analysis. More sessions over a longer period are needed.
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
