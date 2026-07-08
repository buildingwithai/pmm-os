'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type ReplayEvent = {
  data: Record<string, unknown>;
  timestamp: number;
  type: string;
};

const REPLAY_FLUSH_MS = 5000;
const REPLAY_MAX_EVENTS = 250;
const REPLAY_SCROLL_THROTTLE_MS = 1000;

function generateSessionId(): string {
  if (typeof sessionStorage === 'undefined') return crypto.randomUUID();
  const existing = sessionStorage.getItem('analytics_session_id');
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem('analytics_session_id', id);
  return id;
}

function targetLabel(target: EventTarget | null): string {
  if (!(target instanceof Element)) return 'unknown';
  const id = target.id ? `#${target.id}` : '';
  const testId = target.getAttribute('data-testid');
  const aria = target.getAttribute('aria-label');
  const text = target.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80);
  const label = testId || aria || text || target.tagName.toLowerCase();
  return `${target.tagName.toLowerCase()}${id} ${label}`.trim().slice(0, 160);
}

function sendJson(url: string, payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
    return;
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {});
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = useRef<string | null>(null);
  const replayEvents = useRef<ReplayEvent[]>([]);
  const replayStartedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!sessionId.current) sessionId.current = generateSessionId();
    const search = searchParams.toString();
    const path = search ? `${pathname}?${search}` : pathname;
    const payload: Record<string, unknown> = {
      type: 'pageview',
      path,
      title: document.title,
      referrer: document.referrer || null,
      sessionId: sessionId.current,
      hostname: window.location.hostname,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language
    };

    const siteId = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID;
    if (siteId) payload.siteId = siteId;

    sendJson('/api/analytics/events', payload);

    replayEvents.current.push({
      type: 'pageview',
      timestamp: Date.now() - replayStartedAt.current,
      data: { path, title: document.title }
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!sessionId.current) sessionId.current = generateSessionId();
    const siteId = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID;
    let lastScroll = 0;

    const pushReplayEvent = (type: string, data: Record<string, unknown>) => {
      replayEvents.current.push({
        type,
        timestamp: Date.now() - replayStartedAt.current,
        data
      });

      if (replayEvents.current.length > REPLAY_MAX_EVENTS) {
        replayEvents.current = replayEvents.current.slice(-REPLAY_MAX_EVENTS);
      }
    };

    const flushReplay = () => {
      if (!sessionId.current || replayEvents.current.length === 0) return;
      const payload: Record<string, unknown> = {
        sessionId: sessionId.current,
        events: replayEvents.current,
        pageUrl: window.location.pathname + window.location.search,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        duration: Date.now() - replayStartedAt.current
      };
      if (siteId) payload.siteId = siteId;
      sendJson('/api/analytics/replay', payload);
    };

    const onScroll = () => {
      const now = Date.now();
      if (now - lastScroll < REPLAY_SCROLL_THROTTLE_MS) return;
      lastScroll = now;
      pushReplayEvent('scroll', { scrollX: window.scrollX, scrollY: window.scrollY });
    };

    const onClick = (event: MouseEvent) => {
      const target = targetLabel(event.target);
      pushReplayEvent('click', {
        target,
        x: event.clientX,
        y: event.clientY
      });

      if (event.target instanceof Element && event.target.closest('a,button')) {
        sendJson('/api/analytics/events', {
          type: 'custom_event',
          path: window.location.pathname + window.location.search,
          title: document.title,
          sessionId: sessionId.current,
          properties: {
            eventName: 'interaction_clicked',
            target
          }
        });
      }
    };

    const onInput = (event: Event) => {
      const target = event.target;
      const value = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
        ? target.value
        : '';
      pushReplayEvent('input', {
        field: targetLabel(target),
        valueLength: value.length
      });
    };

    const onResize = () => {
      pushReplayEvent('resize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const onError = (event: ErrorEvent) => {
      pushReplayEvent('error', {
        message: event.message.slice(0, 300),
        source: event.filename?.slice(0, 300) || ''
      });
      sendJson('/api/analytics/events', {
        type: 'error',
        path: window.location.pathname + window.location.search,
        title: document.title,
        sessionId: sessionId.current,
        properties: { errorMessage: event.message.slice(0, 300) }
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushReplay();
    };

    const sendPerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      const paint = performance.getEntriesByType('paint');
      const lcp = performance.getEntriesByType('largest-contentful-paint').at(-1) as
        | PerformanceEntry
        | undefined;
      const clsEntries = performance.getEntriesByType('layout-shift') as Array<
        PerformanceEntry & { hadRecentInput?: boolean; value?: number }
      >;
      const cls = clsEntries
        .filter((entry) => !entry.hadRecentInput)
        .reduce((sum, entry) => sum + (entry.value || 0), 0);

      const metrics: Record<string, number> = {};
      if (navigation) {
        metrics.TTFB = Math.round(navigation.responseStart - navigation.requestStart);
        metrics['DOM Content Loaded'] = Math.round(
          navigation.domContentLoadedEventEnd - navigation.startTime
        );
        metrics['Page Load'] = Math.round(navigation.loadEventEnd - navigation.startTime);
      }
      const firstContentfulPaint = paint.find((entry) => entry.name === 'first-contentful-paint');
      if (firstContentfulPaint) metrics.FCP = Math.round(firstContentfulPaint.startTime);
      if (lcp) metrics.LCP = Math.round(lcp.startTime);
      if (cls > 0) metrics.CLS = Number(cls.toFixed(3));

      if (Object.keys(metrics).length > 0) {
        sendJson('/api/analytics/events', {
          type: 'performance',
          path: window.location.pathname + window.location.search,
          title: document.title,
          sessionId: sessionId.current,
          properties: metrics
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('input', onInput, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('error', onError);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const flushInterval = window.setInterval(flushReplay, REPLAY_FLUSH_MS);
    const performanceTimeout = window.setTimeout(sendPerformance, 3000);

    return () => {
      flushReplay();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onClick);
      window.removeEventListener('input', onInput, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('error', onError);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearInterval(flushInterval);
      window.clearTimeout(performanceTimeout);
    };
  }, []);

  return null;
}
