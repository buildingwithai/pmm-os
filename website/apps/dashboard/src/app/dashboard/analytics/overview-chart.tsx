'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface TimePoint {
  timestamp: number;
  pageviews: number;
  visitors: number;
}

export function OverviewChart({ data }: { data: TimePoint[] }) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: new Date(d.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        pageviews: d.pageviews,
        visitors: d.visitors
      })),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <div className='flex h-48 items-center justify-center rounded-lg border border-dashed'>
        <p className='text-muted-foreground text-sm'>No data for this period</p>
      </div>
    );
  }

  return (
    <div className='h-48 w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id='pvGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='hsl(var(--primary))' stopOpacity={0.3} />
              <stop offset='95%' stopColor='hsl(var(--primary))' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
          <XAxis
            dataKey='date'
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 12
            }}
          />
          <Area
            type='monotone'
            dataKey='pageviews'
            stroke='hsl(var(--primary))'
            fill='url(#pvGrad)'
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
