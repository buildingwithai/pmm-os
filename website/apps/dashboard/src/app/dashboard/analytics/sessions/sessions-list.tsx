'use client';

import { useState } from 'react';
import type { SessionInfo, SessionsResult } from '@/lib/analytics/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

function DeviceIcon({ type }: { type: string }) {
  if (type === 'mobile') return <Icons.phone className='size-3.5' />;
  if (type === 'tablet') return <Icons.laptop className='size-3.5' />;
  return <Icons.laptop className='size-3.5' />;
}

function SessionCard({ session }: { session: SessionInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className='overflow-hidden'>
      <button
        onClick={() => setExpanded(!expanded)}
        className='flex w-full items-center gap-4 p-3 text-left transition-colors hover:bg-muted/50'
      >
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <DeviceIcon type={session.deviceType} />
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className='truncate text-sm font-medium'>{session.sessionId.slice(0, 8)}...</span>
              <Badge variant='secondary' className='text-[10px]'>
                {session.pageviews} pages
              </Badge>
            </div>
            <p className='text-muted-foreground text-xs'>
              {session.browser && `${session.browser} · `}
              {session.os && `${session.os} · `}
              {formatDuration(session.duration)}
            </p>
          </div>
        </div>
        <div className='hidden text-right text-xs text-muted-foreground sm:block'>
          {formatTime(session.startTime)}
        </div>
        <Icons.chevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <CardContent className='border-t px-3 py-3'>
          <div className='grid gap-2 text-sm sm:grid-cols-2'>
            <div>
              <p className='text-muted-foreground text-xs'>Session ID</p>
              <p className='font-mono text-xs'>{session.sessionId}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>Duration</p>
              <p className='text-xs font-medium'>{formatDuration(session.duration)}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>Browser</p>
              <p className='text-xs'>{session.browser || 'Unknown'}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>OS</p>
              <p className='text-xs'>{session.os || 'Unknown'}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>Device</p>
              <p className='text-xs'>{session.deviceType || 'Unknown'}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>Referrer</p>
              <p className='truncate text-xs'>{session.referrer || 'Direct'}</p>
            </div>
            <div className='sm:col-span-2'>
              <p className='text-muted-foreground text-xs'>Pages visited</p>
              <div className='mt-1 flex flex-wrap gap-1'>
                {session.pages.slice(0, 10).map((p) => (
                  <Badge key={p} variant='outline' className='text-[10px]'>
                    {p}
                  </Badge>
                ))}
                {session.pages.length > 10 && (
                  <span className='text-muted-foreground text-xs'>+{session.pages.length - 10} more</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function SessionsList({ initialData }: { initialData: SessionsResult }) {
  const [data] = useState(initialData);

  if (data.sessions.length === 0) {
    return (
      <div className='flex items-center justify-center py-20 text-center'>
        <div>
          <Icons.clock className='text-muted-foreground mx-auto mb-3 size-10' />
          <p className='text-muted-foreground text-sm'>No sessions found for this period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>{data.total} session{data.total !== 1 ? 's' : ''}</p>
      </div>
      <div className='space-y-2'>
        {data.sessions.map((session) => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
      </div>
    </div>
  );
}
