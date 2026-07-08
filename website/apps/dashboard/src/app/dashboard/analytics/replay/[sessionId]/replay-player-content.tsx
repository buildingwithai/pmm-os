'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReplayDetailResult } from '@/lib/analytics/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Slider } from '@/components/ui/slider';

const eventIcons: Record<string, keyof typeof Icons> = {
  pageview: 'eye',
  click: 'adjustments',
  scroll: 'chevronsUpDown',
  input: 'edit',
  resize: 'externalLink',
  error: 'alertCircle'
};

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function EventIcon({ type }: { type: string }) {
  const iconKey = eventIcons[type] || 'circle';
  const Icon = Icons[iconKey] || Icons.circle;
  return <Icon className='size-3.5' />;
}

export function ReplayPlayerContent({ data }: { data: ReplayDetailResult }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeEventIdx, setActiveEventIdx] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxTime = data.events.length > 0 ? data.events[data.events.length - 1].timestamp : 0;

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentTime((t) => {
        const next = t + 50;
        if (next >= maxTime) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, maxTime]);

  useEffect(() => {
    const idx = data.events.findLastIndex((e) => e.timestamp <= currentTime);
    setActiveEventIdx(idx);
  }, [currentTime, data.events]);

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const jumpToEvent = (idx: number) => {
    setCurrentTime(data.events[idx].timestamp);
  };

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <CardTitle className='text-base'>Player</CardTitle>
              <Badge variant='outline' className='text-xs'>
                {data.screenWidth}x{data.screenHeight}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {data.events.length} events
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {formatTime(data.duration)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Button
              aria-label='Restart replay'
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => setCurrentTime(0)}
            >
              <Icons.playerSkipBack className='size-4' />
            </Button>
            <Button
              aria-label={playing ? 'Pause replay' : 'Play replay'}
              variant='outline'
              size='icon'
              className='size-8'
              onClick={togglePlay}
            >
              {playing ? <Icons.playerPause className='size-4' /> : <Icons.playerPlay className='size-4' />}
            </Button>
            <span className='min-w-[60px] text-xs tabular-nums text-muted-foreground'>
              {formatTime(currentTime)} / {formatTime(maxTime)}
            </span>
            <div className='flex-1'>
              <Slider
                value={[currentTime]}
                max={maxTime || 1}
                step={50}
                onValueChange={handleSeek}
                className='cursor-pointer'
              />
            </div>
          </div>

          <div
            className='relative mx-auto overflow-hidden rounded-lg border bg-background'
            style={{
              width: Math.min(data.screenWidth / 2, 600),
              height: Math.min(data.screenHeight / 2, 400),
              maxWidth: '100%'
            }}
          >
            <div className='flex h-full items-center justify-center'>
              <div className='text-center'>
                <Icons.playerPlay className='mx-auto mb-2 size-8 text-muted-foreground' />
                <p className='text-xs text-muted-foreground'>{data.pageUrl}</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {activeEventIdx >= 0
                    ? `${data.events[activeEventIdx].type} at ${formatTime(data.events[activeEventIdx].timestamp)}`
                    : 'Ready'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='max-h-80 space-y-0.5 overflow-y-auto'>
            {data.events.map((event, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => jumpToEvent(idx)}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                  idx === activeEventIdx ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                <EventIcon type={event.type} />
                <span className='min-w-[32px] tabular-nums'>{formatTime(event.timestamp)}</span>
                <code className='rounded bg-muted px-1 py-0.5 text-[10px]'>{event.type}</code>
                <span className='truncate'>
                  {event.type === 'pageview' && String(event.data.path || '')}
                  {event.type === 'click' && String(event.data.target || '')}
                  {event.type === 'scroll' && `y=${String(event.data.scrollY || 0)}`}
                  {event.type === 'input' && `${String(event.data.field || '')} (${String(event.data.valueLength || 0)} chars)`}
                  {event.type === 'resize' && `${String(event.data.width || 0)}x${String(event.data.height || 0)}`}
                  {event.type === 'error' && String(event.data.message || '')}
                  {!['pageview', 'click', 'scroll', 'input', 'resize', 'error'].includes(event.type) &&
                    JSON.stringify(event.data).slice(0, 40)}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
