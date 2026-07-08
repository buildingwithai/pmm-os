'use client';

import type { CountriesResult, AnalyticsProvider } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { downloadCSV } from '@/lib/analytics/csv-export';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';

export function CountriesContent({
  data,
  provider
}: {
  data: CountriesResult;
  provider: AnalyticsProvider;
}) {
  const totalPageviews = data.countries.reduce((s, c) => s + c.pageviews, 0);
  const maxPageviews = Math.max(...data.countries.map((c) => c.pageviews), 1);

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <div className='flex items-center justify-between'>
        <DateRangePicker />
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            downloadCSV(
              data.countries.map((c) => ({
                country: c.country,
                visitors: c.visitors,
                pageviews: c.pageviews
              })),
              'countries'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Countries / Regions</CardTitle>
        </CardHeader>
        <CardContent>
          {data.countries.length > 0 ? (
            <div className='space-y-4'>
              {data.countries.map((c) => (
                <div key={c.country} className='space-y-1.5'>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <Icons.world className='size-4 text-muted-foreground' />
                      <span className='font-medium'>{c.country}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-muted-foreground text-xs'>
                        {c.visitors.toLocaleString()} visitors
                      </span>
                      <Badge variant='secondary' className='min-w-[60px] justify-center'>
                        {c.pageviews.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                  <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full rounded-full bg-primary transition-all'
                      style={{ width: `${(c.pageviews / maxPageviews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex items-center justify-center py-16 text-center'>
              <div>
                <Icons.world className='text-muted-foreground mx-auto mb-3 size-10' />
                <p className='text-muted-foreground text-sm'>No country data yet.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data.countries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5'>
              {data.countries.slice(0, 10).map((c) => (
                <div key={c.country} className='rounded-lg border p-3 text-center'>
                  <p className='text-lg font-bold'>{c.country}</p>
                  <p className='text-muted-foreground text-xs'>
                    {((c.pageviews / totalPageviews) * 100).toFixed(1)}%
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {c.pageviews.toLocaleString()} views
                  </p>
                </div>
              ))}
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
