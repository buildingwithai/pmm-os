import { fetchMutation } from 'convex/nextjs';
import { makeFunctionReference } from 'convex/server';
import { NextRequest, NextResponse } from 'next/server';

function parseUserAgent(ua: string): { browser: string; os: string; deviceType: string } {
  let browser = 'unknown';
  let os = 'unknown';
  let deviceType = 'desktop';

  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  if (/Mobile|Android|iPhone|iPad/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

  return { browser, os, deviceType };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, path, title, referrer, sessionId, userId, properties, hostname } = body;
    const provider = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'local-template').toLowerCase();

    if (!type || !path) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (provider !== 'convex') {
      return NextResponse.json({ ok: true, mode: 'local-template' });
    }

    const ua = request.headers.get('user-agent') || '';
    const { browser, os, deviceType } = parseUserAgent(ua);

    const EVENT_TYPES = ['pageview', 'custom_event', 'performance', 'outbound', 'error'];
    const validType = EVENT_TYPES.includes(type) ? type : 'custom_event';

    await fetchMutation(
      makeFunctionReference<'mutation'>('analytics:trackEvent'),
      {
        type: validType,
        siteId: body.siteId || process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
        path: String(path).slice(0, 500),
        title: title ? String(title).slice(0, 200) : '',
        referrer: referrer ? String(referrer).slice(0, 500) : '',
        hostname: hostname ? String(hostname).slice(0, 200) : request.headers.get('host') || '',
        sessionId: sessionId || crypto.randomUUID(),
        userId: userId || undefined,
        properties: properties ? JSON.stringify(properties).slice(0, 10000) : undefined,
        browser,
        os,
        deviceType,
        language: body.language || undefined,
        screenWidth: body.screenWidth ? Number(body.screenWidth) : undefined,
        screenHeight: body.screenHeight ? Number(body.screenHeight) : undefined
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      {
        ok: false,
        mode: 'provider-unavailable',
        error: 'Analytics provider is not reachable.'
      },
      { status: 503 }
    );
  }
}
