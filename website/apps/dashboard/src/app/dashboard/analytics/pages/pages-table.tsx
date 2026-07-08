'use client';

import { useState } from 'react';
import type { PageAnalyticsInfo, PageAnalyticsResult } from '@/lib/analytics/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

function PageDetailCard({ page }: { page: PageAnalyticsInfo }) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <div className='min-w-0 flex-1'>
            <CardTitle className='truncate text-sm'>{page.title}</CardTitle>
            <p className='truncate text-xs text-muted-foreground'>{page.path}</p>
          </div>
          <div className='flex items-center gap-3 text-right text-sm'>
            <div>
              <p className='font-medium'>{page.views.toLocaleString()}</p>
              <p className='text-muted-foreground text-xs'>views</p>
            </div>
            <div>
              <p className='font-medium'>{page.uniqueVisitors.toLocaleString()}</p>
              <p className='text-muted-foreground text-xs'>unique</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap gap-x-6 gap-y-2 text-xs'>
          {page.browsers.length > 0 && (
            <div>
              <span className='text-muted-foreground'>Browsers: </span>
              {page.browsers.slice(0, 3).map((b) => (
                <span key={b.browser} className='font-medium'>
                  {b.browser}{b.browser !== page.browsers[page.browsers.length - 1]?.browser ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
          <div>
            <span className='text-muted-foreground'>Devices: </span>
            {page.devices.map((d) => (
              <span key={d.device} className='font-medium'>
                {d.device} ({d.count}){d.device !== page.devices[page.devices.length - 1]?.device ? ', ' : ''}
              </span>
            ))}
          </div>
          {page.referrers.length > 0 && (
            <div>
              <span className='text-muted-foreground'>Top referrer: </span>
              <span className='font-medium'>{page.referrers[0].source}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PagesTable({ initialData }: { initialData: PageAnalyticsResult }) {
  const [data] = useState(initialData);

  if (data.pages.length === 0) {
    return (
      <div className='flex items-center justify-center py-20 text-center'>
        <div>
          <Icons.page className='text-muted-foreground mx-auto mb-3 size-10' />
          <p className='text-muted-foreground text-sm'>
            No page data yet. Visit one of your sites to generate analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <p className='text-muted-foreground text-sm'>{data.total} page{data.total !== 1 ? 's' : ''}</p>
      <div className='space-y-3'>
        {data.pages.map((page) => (
          <PageDetailCard key={page.path} page={page} />
        ))}
      </div>
    </div>
  );
}
