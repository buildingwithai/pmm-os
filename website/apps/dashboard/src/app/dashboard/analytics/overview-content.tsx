'use client';

import type { AnalyticsSummary, TimeSeriesPoint, AnalyticsProvider } from '@/lib/analytics/types';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { downloadCSV } from '@/lib/analytics/csv-export';
import { OverviewChart } from './overview-chart';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='text-muted-foreground size-4' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-muted-foreground text-xs'>{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function pagesPerSession(summary: { pageViews: number; uniqueVisitors: number }) {
  if (summary.uniqueVisitors === 0) return '0.0';
  return (summary.pageViews / summary.uniqueVisitors).toFixed(1);
}

export function OverviewContent({
  summary,
  timeSeries,
  provider
}: {
  summary: AnalyticsSummary;
  timeSeries: TimeSeriesPoint[];
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
              [
                ...summary.topPages.map((p) => ({
                  type: 'page' as const,
                  path: p.path,
                  views: p.views,
                  visitors: p.visitors
                })),
                ...summary.referrers.map((r) => ({
                  type: 'referrer' as const,
                  source: r.source,
                  visitors: r.visitors,
                  views: 0
                })),
                ...summary.events.map((e) => ({
                  type: 'event' as const,
                  name: e.name,
                  count: e.count,
                  visitors: 0
                }))
              ],
              'overview'
            )
          }
        >
          <Icons.download className='size-4' />
          CSV
        </Button>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        <StatCard
          title='Unique Visitors'
          value={summary.uniqueVisitors.toLocaleString()}
          subtitle='Unique sessions'
          icon={Icons.teams}
        />
        <StatCard
          title='Total Visits'
          value={summary.totalVisitors.toLocaleString()}
          subtitle='All visits'
          icon={Icons.trendingUp}
        />
        <StatCard
          title='Page Views'
          value={summary.pageViews.toLocaleString()}
          subtitle='Total pageviews'
          icon={Icons.eye}
        />
        <StatCard
          title='Pages / Visit'
          value={pagesPerSession(summary)}
          subtitle='Avg pages per session'
          icon={Icons.page}
        />
        <StatCard
          title='Bounce Rate'
          value='--'
          subtitle='Single-page sessions'
          icon={Icons.arrowRight}
        />
        <StatCard
          title='Conversion'
          value={summary.conversionRate}
          subtitle='Event conversion rate'
          icon={Icons.check}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Traffic Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <OverviewChart data={timeSeries} />
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle className='text-base'>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topPages.length > 0 ? (
              <div className='space-y-3'>
                {summary.topPages.map((page) => (
                  <div key={page.path} className='flex items-center gap-4'>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>{page.title}</p>
                      <p className='text-muted-foreground truncate text-xs'>{page.path}</p>
                    </div>
                    <div className='text-right text-sm'>
                      <p className='font-medium'>{page.views.toLocaleString()}</p>
                      <p className='text-muted-foreground text-xs'>{page.visitors.toLocaleString()} unique</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex items-center justify-center py-16 text-center'>
                <div>
                  <Icons.eye className='text-muted-foreground mx-auto mb-3 size-10' />
                  <p className='text-muted-foreground text-sm'>
                    No data yet for this period. Visit one of your sites to generate analytics.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle className='text-base'>Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.referrers.length > 0 ? (
              <div className='space-y-3'>
                {summary.referrers.map((ref) => (
                  <div key={ref.source} className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>{ref.source}</span>
                    <Badge variant='secondary'>{ref.visitors.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex items-center justify-center py-8 text-center'>
                <p className='text-muted-foreground text-sm'>No referrer data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {summary.devices && summary.devices.length > 0 && (
          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle className='text-base'>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {summary.devices.map((d) => (
                  <div key={d.device} className='flex items-center justify-between'>
                    <span className='text-sm font-medium capitalize'>{d.device}</span>
                    <Badge variant='secondary'>{d.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {summary.browsers && summary.browsers.length > 0 && (
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle className='text-base'>Browsers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {summary.browsers.map((b) => (
                  <div key={b.browser} className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>{b.browser}</span>
                    <Badge variant='secondary'>{b.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {summary.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Tracked Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {summary.events.map((event) => (
                <div key={event.name} className='flex items-center justify-between'>
                  <code className='rounded bg-muted px-2 py-0.5 text-xs'>{event.name}</code>
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-medium'>{event.count.toLocaleString()}</span>
                    {'owner' in event && event.owner && (
                      <span className='text-muted-foreground text-xs'>{event.owner}</span>
                    )}
                  </div>
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
                <code className='rounded bg-muted px-1 py-0.5 text-xs'>NEXT_PUBLIC_ANALYTICS_PROVIDER=convex</code>{' '}
                to use live data from Convex.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
