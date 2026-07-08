'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import type { PerformanceResult, AnalyticsProvider } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { downloadCSV } from '@/lib/analytics/csv-export';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';

const metricLabels: Record<string, string> = {
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift',
  TTFB: 'Time to First Byte'
};

export function PerformanceContent({
  data,
  provider
}: {
  data: PerformanceResult;
  provider: AnalyticsProvider;
}) {
  const chartData = data.metrics.map((m) => ({
    name: m.name,
    avg: m.avg,
    p95: m.p95
  }));

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <div className='flex items-center justify-between'>
        <DateRangePicker />
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            downloadCSV(
              data.metrics.map((m) => ({
                name: m.name,
                average: m.avg,
                p50: m.p50,
                p95: m.p95,
                count: m.count
              })),
              'performance'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {data.metrics.map((m) => (
          <Card key={m.name}>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-medium'>{metricLabels[m.name] || m.name}</CardTitle>
                <Badge variant='secondary'>{m.count.toLocaleString()} samples</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-3 gap-2 text-center'>
                <div>
                  <p className='text-muted-foreground text-xs'>Avg</p>
                  <p className='text-lg font-bold'>{m.name === 'CLS' ? m.avg.toFixed(2) : m.avg.toLocaleString()}{m.name === 'CLS' ? '' : ' ms'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>P50</p>
                  <p className='text-lg font-bold'>{m.name === 'CLS' ? m.p50.toFixed(2) : m.p50.toLocaleString()}{m.name === 'CLS' ? '' : ' ms'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>P95</p>
                  <p className='text-lg font-bold'>{m.name === 'CLS' ? m.p95.toFixed(2) : m.p95.toLocaleString()}{m.name === 'CLS' ? '' : ' ms'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Avg vs P95 (ms)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      fontSize: 12
                    }}
                  />
                  <Bar dataKey='avg' name='Average' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
                  <Bar dataKey='p95' name='P95' fill='hsl(var(--primary))' fillOpacity={0.3} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
