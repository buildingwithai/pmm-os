import { fetchMutation } from 'convex/nextjs';
import { makeFunctionReference } from 'convex/server';
import { NextRequest, NextResponse } from 'next/server';

const MAX_EVENTS = 500;
const MAX_EVENT_BYTES = 200_000;

type ReplayEvent = {
  data?: Record<string, unknown>;
  timestamp?: number;
  type?: string;
};

function sanitizeReplayEvents(events: unknown): ReplayEvent[] {
  if (!Array.isArray(events)) return [];

  return events.slice(-MAX_EVENTS).map((event) => {
    const input = event && typeof event === 'object' ? (event as ReplayEvent) : {};
    return {
      type: typeof input.type === 'string' ? input.type.slice(0, 40) : 'unknown',
      timestamp: typeof input.timestamp === 'number' ? input.timestamp : 0,
      data: input.data && typeof input.data === 'object' ? input.data : {}
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'local-template').toLowerCase();

    if (provider !== 'convex') {
      return NextResponse.json({ ok: true, mode: 'local-template' });
    }

    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl.slice(0, 500) : '/';
    const events = sanitizeReplayEvents(body.events);
    const serializedEvents = JSON.stringify(events);

    if (!sessionId || events.length === 0) {
      return NextResponse.json({ ok: false, error: 'Missing replay session or events' }, { status: 400 });
    }

    if (serializedEvents.length > MAX_EVENT_BYTES) {
      return NextResponse.json({ ok: false, error: 'Replay payload is too large' }, { status: 413 });
    }

    await fetchMutation(
      makeFunctionReference<'mutation'>('analytics:storeReplaySnapshot'),
      {
        siteId: body.siteId || process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
        sessionId,
        events: serializedEvents,
        pageUrl,
        screenWidth: Number(body.screenWidth || 0),
        screenHeight: Number(body.screenHeight || 0),
        duration: Number(body.duration || 0),
        eventCount: events.length
      }
    );

    return NextResponse.json({ ok: true, eventCount: events.length });
  } catch (error) {
    console.error('Replay persistence error:', error);
    return NextResponse.json(
      { ok: false, mode: 'provider-unavailable', error: 'Replay provider is not reachable.' },
      { status: 503 }
    );
  }
}
