import type { AnalyticsProvider, AnalyticsSummary, SessionsResult, PageAnalyticsResult, TimeSeriesPoint, ErrorsResult, FunnelResult, JourneyResult, RetentionResult, CountriesResult, PerformanceResult, ReplaySessionsResult, ReplayDetailResult } from './types';
import { callConvexQuery } from '@/lib/convex/server';
import { convexFunctions } from '@/lib/convex/contract';

const provider = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'local-template').toLowerCase();

export function getAnalyticsProvider(): AnalyticsProvider {
  if (provider === 'umami' || provider === 'rybbit' || provider === 'openpanel' || provider === 'plausible' || provider === 'convex') {
    return provider;
  }
  return 'local-template';
}

export async function getAnalyticsSummary(
  startTime?: number,
  endTime?: number
): Promise<AnalyticsSummary> {
  const selectedProvider = getAnalyticsProvider();

  if (selectedProvider === 'convex') {
    const result = await callConvexQuery<{
      totalVisitors: number;
      uniqueVisitors: number;
      pageViews: number;
      topPages: { path: string; title: string; views: number; visitors: number }[];
      referrers: { source: string; visitors: number }[];
      events: { name: string; count: number }[];
      devices: { device: string; count: number }[];
      browsers: { browser: string; count: number }[];
    }>(convexFunctions.analytics.getSummary, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime ?? Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime ?? Date.now()
    });

    if (result.ok) {
      const data = result.value;
      return {
        provider: selectedProvider,
        modeLabel: 'Convex analytics',
        totalVisitors: data.totalVisitors,
        uniqueVisitors: data.uniqueVisitors,
        pageViews: data.pageViews,
        conversionRate: data.uniqueVisitors > 0
          ? `${((data.events.length / data.pageViews) * 100).toFixed(1)}%`
          : '0%',
        topPages: data.topPages,
        referrers: data.referrers,
        events: data.events.map((e) => ({
          name: e.name,
          count: e.count,
          owner: 'Custom event'
        })),
        recentActivity: [],
        devices: data.devices || [],
        browsers: data.browsers || []
      };
    }

    return {
      provider: 'local-template',
      modeLabel: 'Convex not connected - showing template data',
      totalVisitors: 12840,
      uniqueVisitors: 7421,
      pageViews: 31876,
      conversionRate: '8.4%',
      topPages: [
        { path: '/', title: 'Homepage', views: 8234, visitors: 4910 },
        { path: '/pricing', title: 'Pricing', views: 4318, visitors: 2780 },
        { path: '/blog', title: 'Blog index', views: 3891, visitors: 2412 },
        { path: '/blog/event-driven-user-onboarding', title: 'Event-driven onboarding article', views: 2764, visitors: 1901 },
        { path: '/docs', title: 'Docs', views: 2189, visitors: 1442 }
      ],
      referrers: [
        { source: 'Direct', visitors: 2441 },
        { source: 'Google', visitors: 2197 },
        { source: 'GitHub', visitors: 1024 },
        { source: 'Product Hunt', visitors: 739 },
        { source: 'Twitter / X', visitors: 604 }
      ],
      events: [
        { name: 'open_dashboard_clicked', count: 814, owner: 'Marketing CTA' },
        { name: 'pricing_plan_viewed', count: 521, owner: 'Billing funnel' },
        { name: 'docs_started', count: 308, owner: 'Activation' },
        { name: 'blog_article_shared', count: 97, owner: 'Content' }
      ],
        recentActivity: [
          { time: '09:42', label: 'Homepage spike', detail: 'GitHub referral traffic increased after a template link was shared.' },
          { time: '08:15', label: 'Pricing intent', detail: 'Most pricing visitors compared Pro and Team plans before opening docs.' },
          { time: 'Yesterday', label: 'Content path', detail: 'The onboarding article drove readers into docs and support.' }
        ],
        devices: [
          { device: 'desktop', count: 8542 },
          { device: 'mobile', count: 3210 },
          { device: 'tablet', count: 456 }
        ],
        browsers: [
          { browser: 'Chrome', count: 7210 },
          { browser: 'Safari', count: 2840 },
          { browser: 'Firefox', count: 1230 },
          { browser: 'Edge', count: 612 },
          { browser: 'Other', count: 316 }
        ]
      };
    }

    return {
      provider: selectedProvider,
      modeLabel:
        selectedProvider === 'local-template'
        ? 'Local template data'
        : `${selectedProvider} adapter boundary`,
    totalVisitors: 12840,
    uniqueVisitors: 7421,
    pageViews: 31876,
    conversionRate: '8.4%',
    topPages: [
      { path: '/', title: 'Homepage', views: 8234, visitors: 4910 },
      { path: '/pricing', title: 'Pricing', views: 4318, visitors: 2780 },
      { path: '/blog', title: 'Blog index', views: 3891, visitors: 2412 },
      { path: '/blog/event-driven-user-onboarding', title: 'Event-driven onboarding article', views: 2764, visitors: 1901 },
      { path: '/docs', title: 'Docs', views: 2189, visitors: 1442 }
    ],
    referrers: [
      { source: 'Direct', visitors: 2441 },
      { source: 'Google', visitors: 2197 },
      { source: 'GitHub', visitors: 1024 },
      { source: 'Product Hunt', visitors: 739 },
      { source: 'Twitter / X', visitors: 604 }
    ],
    events: [
      { name: 'open_dashboard_clicked', count: 814, owner: 'Marketing CTA' },
      { name: 'pricing_plan_viewed', count: 521, owner: 'Billing funnel' },
      { name: 'docs_started', count: 308, owner: 'Activation' },
      { name: 'blog_article_shared', count: 97, owner: 'Content' }
    ],
    recentActivity: [
      { time: '09:42', label: 'Homepage spike', detail: 'GitHub referral traffic increased after a template link was shared.' },
      { time: '08:15', label: 'Pricing intent', detail: 'Most pricing visitors compared Pro and Team plans before opening docs.' },
      { time: 'Yesterday', label: 'Content path', detail: 'The onboarding article drove readers into docs and support.' }
    ],
    devices: [
      { device: 'desktop', count: 8542 },
      { device: 'mobile', count: 3210 },
      { device: 'tablet', count: 456 }
    ],
    browsers: [
      { browser: 'Chrome', count: 7210 },
      { browser: 'Safari', count: 2840 },
      { browser: 'Firefox', count: 1230 },
      { browser: 'Edge', count: 612 },
      { browser: 'Other', count: 316 }
    ]
  };
}

export async function getSessions(
  startTime?: number,
  endTime?: number,
  limit?: number,
  offset?: number
): Promise<SessionsResult> {
  const selectedProvider = getAnalyticsProvider();

  if (selectedProvider === 'convex') {
    const result = await callConvexQuery<SessionsResult>(convexFunctions.analytics.getSessions, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now(),
      limit: limit || 20,
      offset: offset || 0
    });

    if (result.ok) return result.value;
  }

  return {
    sessions: [
      {
        sessionId: 'tmpl-session-001',
        pageviews: 7,
        pages: ['/', '/pricing', '/blog', '/docs', '/blog/event-driven-user-onboarding', '/pricing', '/dashboard/overview'],
        startTime: Date.now() - 3600000,
        endTime: Date.now() - 1800000,
        duration: 1800000,
        referrer: 'https://google.com',
        browser: 'Chrome',
        os: 'macOS',
        deviceType: 'desktop',
        country: 'US'
      },
      {
        sessionId: 'tmpl-session-002',
        pageviews: 3,
        pages: ['/', '/pricing', '/signup'],
        startTime: Date.now() - 7200000,
        endTime: Date.now() - 6300000,
        duration: 900000,
        referrer: 'https://twitter.com',
        browser: 'Safari',
        os: 'iOS',
        deviceType: 'mobile',
        country: 'GB'
      },
      {
        sessionId: 'tmpl-session-003',
        pageviews: 1,
        pages: ['/'],
        startTime: Date.now() - 10800000,
        endTime: Date.now() - 10800000,
        duration: 0,
        referrer: '',
        browser: 'Firefox',
        os: 'Windows',
        deviceType: 'desktop',
        country: 'DE'
      },
      {
        sessionId: 'tmpl-session-004',
        pageviews: 12,
        pages: ['/blog', '/blog/event-driven-user-onboarding', '/docs', '/blog/scaling-analytics', '/pricing', '/dashboard/overview', '/dashboard/analytics'],
        startTime: Date.now() - 14400000,
        endTime: Date.now() - 7200000,
        duration: 7200000,
        referrer: 'https://github.com',
        browser: 'Chrome',
        os: 'Linux',
        deviceType: 'desktop',
        country: 'IN'
      },
      {
        sessionId: 'tmpl-session-005',
        pageviews: 2,
        pages: ['/product-hunt-launch', '/pricing'],
        startTime: Date.now() - 18000000,
        endTime: Date.now() - 17400000,
        duration: 600000,
        referrer: 'https://producthunt.com',
        browser: 'Edge',
        os: 'Windows',
        deviceType: 'desktop',
        country: 'US'
      }
    ],
    total: 5,
    offset: offset || 0,
    limit: limit || 20
  };
}

export async function getPageAnalytics(
  startTime?: number,
  endTime?: number
): Promise<PageAnalyticsResult> {
  const selectedProvider = getAnalyticsProvider();

  if (selectedProvider === 'convex') {
    const result = await callConvexQuery<PageAnalyticsResult>(
      convexFunctions.analytics.getPageAnalytics,
      {
        siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
        startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
        endTime: endTime || Date.now()
      }
    );

    if (result.ok) return result.value;
  }

  return {
    pages: [
      {
        path: '/',
        title: 'Homepage',
        views: 8234,
        uniqueVisitors: 4910,
        referrers: [
          { source: 'Direct', count: 1840 },
          { source: 'Google', count: 1512 },
          { source: 'GitHub', count: 740 }
        ],
        browsers: [
          { browser: 'Chrome', count: 4210 },
          { browser: 'Safari', count: 1604 },
          { browser: 'Firefox', count: 891 }
        ],
        devices: [
          { device: 'desktop', count: 5832 },
          { device: 'mobile', count: 1980 },
          { device: 'tablet', count: 422 }
        ]
      },
      {
        path: '/pricing',
        title: 'Pricing',
        views: 4318,
        uniqueVisitors: 2780,
        referrers: [
          { source: 'Homepage', count: 1162 },
          { source: 'Google', count: 842 },
          { source: 'Product Hunt', count: 502 }
        ],
        browsers: [
          { browser: 'Chrome', count: 2390 },
          { browser: 'Safari', count: 1104 },
          { browser: 'Edge', count: 402 }
        ],
        devices: [
          { device: 'desktop', count: 3020 },
          { device: 'mobile', count: 1120 },
          { device: 'tablet', count: 178 }
        ]
      },
      {
        path: '/blog',
        title: 'Blog index',
        views: 3891,
        uniqueVisitors: 2412,
        referrers: [
          { source: 'Google', count: 1102 },
          { source: 'Twitter / X', count: 512 },
          { source: 'Direct', count: 430 }
        ],
        browsers: [
          { browser: 'Chrome', count: 2204 },
          { browser: 'Safari', count: 990 },
          { browser: 'Firefox', count: 420 }
        ],
        devices: [
          { device: 'desktop', count: 2490 },
          { device: 'mobile', count: 1220 },
          { device: 'tablet', count: 181 }
        ]
      },
      {
        path: '/blog/event-driven-user-onboarding',
        title: 'Event-driven onboarding article',
        views: 2764,
        uniqueVisitors: 1901,
        referrers: [
          { source: 'Blog index', count: 901 },
          { source: 'Google', count: 640 },
          { source: 'GitHub', count: 360 }
        ],
        browsers: [
          { browser: 'Chrome', count: 1704 },
          { browser: 'Safari', count: 612 },
          { browser: 'Firefox', count: 260 }
        ],
        devices: [
          { device: 'desktop', count: 1880 },
          { device: 'mobile', count: 760 },
          { device: 'tablet', count: 124 }
        ]
      },
      {
        path: '/docs',
        title: 'Docs',
        views: 2189,
        uniqueVisitors: 1442,
        referrers: [
          { source: 'Pricing', count: 512 },
          { source: 'Blog', count: 380 },
          { source: 'Direct', count: 294 }
        ],
        browsers: [
          { browser: 'Chrome', count: 1320 },
          { browser: 'Safari', count: 460 },
          { browser: 'Firefox', count: 240 }
        ],
        devices: [
          { device: 'desktop', count: 1710 },
          { device: 'mobile', count: 392 },
          { device: 'tablet', count: 87 }
        ]
      }
    ],
    total: 5
  };
}

export async function getTimeSeries(
  startTime?: number,
  endTime?: number
): Promise<TimeSeriesPoint[]> {
  const selectedProvider = getAnalyticsProvider();

  if (selectedProvider === 'convex') {
    const result = await callConvexQuery<TimeSeriesPoint[]>(
      convexFunctions.analytics.getTimeSeries,
      {
        siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
        startTime: startTime ?? Date.now() - 30 * 24 * 60 * 60 * 1000,
        endTime: endTime ?? Date.now(),
        intervalMs: 24 * 60 * 60 * 1000
      }
    );

    if (result.ok) return result.value;
  }

  const end = endTime ?? Date.now();
  const start = startTime ?? end - 30 * 24 * 60 * 60 * 1000;
  const day = 24 * 60 * 60 * 1000;
  const points = Math.max(7, Math.min(30, Math.ceil((end - start) / day)));

  return Array.from({ length: points }, (_, index) => {
    const progress = index / Math.max(points - 1, 1);
    const wave = Math.sin(index / 2.8) * 220;
    const pageviews = Math.round(720 + progress * 520 + wave);
    return {
      timestamp: start + index * day,
      pageviews,
      visitors: Math.round(pageviews * 0.58)
    };
  });
}

export async function getErrors(startTime?: number, endTime?: number): Promise<ErrorsResult> {
  if (getAnalyticsProvider() === 'convex') {
    const result = await callConvexQuery<ErrorsResult>(convexFunctions.analytics.getErrors, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now()
    });
    if (result.ok) return result.value;
  }
  return {
    errors: [
      {
        message: 'TypeError: Cannot read properties of null (reading \'map\')',
        count: 47,
        uniqueSessions: 23,
        topPaths: [{ path: '/dashboard/analytics', count: 31 }, { path: '/pricing', count: 12 }, { path: '/blog', count: 4 }],
        browsers: [{ browser: 'Chrome', count: 32 }, { browser: 'Firefox', count: 10 }, { browser: 'Safari', count: 5 }],
        lastSeen: Date.now() - 120000
      },
      {
        message: 'Failed to fetch /api/users: 500 Internal Server Error',
        count: 23,
        uniqueSessions: 18,
        topPaths: [{ path: '/dashboard/users', count: 18 }, { path: '/dashboard/workspaces', count: 5 }],
        browsers: [{ browser: 'Chrome', count: 15 }, { browser: 'Edge', count: 5 }, { browser: 'Safari', count: 3 }],
        lastSeen: Date.now() - 600000
      },
      {
        message: 'Error: Network request failed (timeout: 10s)',
        count: 12,
        uniqueSessions: 9,
        topPaths: [{ path: '/api/products', count: 7 }, { path: '/api/users', count: 5 }],
        browsers: [{ browser: 'Chrome', count: 8 }, { browser: 'Firefox', count: 4 }],
        lastSeen: Date.now() - 3600000
      },
      {
        message: 'ReferenceError: cookies is not defined',
        count: 8,
        uniqueSessions: 6,
        topPaths: [{ path: '/dashboard/overview', count: 6 }, { path: '/pricing', count: 2 }],
        browsers: [{ browser: 'Safari', count: 5 }, { browser: 'Chrome', count: 3 }],
        lastSeen: Date.now() - 7200000
      }
    ],
    total: 4
  };
}

export async function getFunnelData(
  steps: string[],
  startTime?: number,
  endTime?: number
): Promise<FunnelResult> {
  if (getAnalyticsProvider() === 'convex') {
    const result = await callConvexQuery<FunnelResult>(convexFunctions.analytics.getFunnelData, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now(),
      steps
    });
    if (result.ok) return result.value;
  }
  return {
    steps: [
      { path: '/', sessions: 840, dropoff: 0, conversionRate: 100 },
      { path: '/pricing', sessions: 431, dropoff: 409, conversionRate: 51.3 },
      { path: '/signup', sessions: 187, dropoff: 244, conversionRate: 22.3 },
      { path: '/dashboard/overview', sessions: 98, dropoff: 89, conversionRate: 11.7 }
    ],
    totalSessions: 840
  };
}

export async function getJourneyData(startTime?: number, endTime?: number): Promise<JourneyResult> {
  if (getAnalyticsProvider() === 'convex') {
    const result = await callConvexQuery<JourneyResult>(convexFunctions.analytics.getJourneyData, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now()
    });
    if (result.ok) return result.value;
  }
  return {
    transitions: [
      { from: '/', to: '/pricing', count: 342 },
      { from: '/pricing', to: '/signup', count: 187 },
      { from: '/', to: '/blog', count: 156 },
      { from: '/blog', to: '/blog/event-driven-user-onboarding', count: 98 },
      { from: '/pricing', to: '/docs', count: 87 },
      { from: '/', to: '/docs', count: 76 },
      { from: '/blog/event-driven-user-onboarding', to: '/docs', count: 64 },
      { from: '/signup', to: '/dashboard/overview', count: 56 },
      { from: '/docs', to: '/pricing', count: 45 },
      { from: '/', to: '/product-hunt-launch', count: 32 }
    ],
    paths: ['/', '/pricing', '/signup', '/blog', '/blog/event-driven-user-onboarding', '/docs', '/dashboard/overview', '/product-hunt-launch'],
    totalTransitions: 10
  };
}

export async function getCountries(startTime?: number, endTime?: number): Promise<CountriesResult> {
  if (getAnalyticsProvider() === 'convex') {
    const result = await callConvexQuery<CountriesResult>(convexFunctions.analytics.getCountries, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now()
    });
    if (result.ok) return result.value;
  }
  return {
    countries: [
      { country: 'US', visitors: 3241, pageviews: 12840 },
      { country: 'GB', visitors: 892, pageviews: 3451 },
      { country: 'DE', visitors: 654, pageviews: 2198 },
      { country: 'IN', visitors: 521, pageviews: 1876 },
      { country: 'CA', visitors: 487, pageviews: 1654 },
      { country: 'AU', visitors: 312, pageviews: 987 },
      { country: 'FR', visitors: 298, pageviews: 876 },
      { country: 'BR', visitors: 245, pageviews: 743 },
      { country: 'NL', visitors: 198, pageviews: 612 },
      { country: 'ES', visitors: 167, pageviews: 543 }
    ],
    total: 10
  };
}

export async function getPerformanceMetrics(startTime?: number, endTime?: number): Promise<PerformanceResult> {
  if (getAnalyticsProvider() === 'convex') {
    const result = await callConvexQuery<PerformanceResult>(convexFunctions.analytics.getPerformanceMetrics, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now()
    });
    if (result.ok) return result.value;
  }
  return {
    metrics: [
      { name: 'LCP', avg: 1842, p50: 1200, p95: 4500, count: 4321 },
      { name: 'FID', avg: 24, p50: 12, p95: 85, count: 3987 },
      { name: 'CLS', avg: 0.08, p50: 0.04, p95: 0.25, count: 4123 },
      { name: 'TTFB', avg: 342, p50: 210, p95: 890, count: 4567 },
      { name: 'DOM Content Loaded', avg: 1240, p50: 890, p95: 3200, count: 4098 },
      { name: 'Page Load', avg: 2450, p50: 1800, p95: 6200, count: 4567 }
    ],
    totalEvents: 4567
  };
}

export async function getReplaySessions(startTime?: number, endTime?: number): Promise<ReplaySessionsResult> {
  if (getAnalyticsProvider() === 'convex') {
    const result = await callConvexQuery<ReplaySessionsResult>(convexFunctions.analytics.getReplaySessions, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now()
    });
    if (result.ok) return result.value;
  }
  return {
    sessions: [
      {
        sessionId: 'replay-tmpl-001',
        pageUrl: '/',
        screenWidth: 1440,
        screenHeight: 900,
        duration: 45000,
        eventCount: 87,
        timestamp: Date.now() - 3600000
      },
      {
        sessionId: 'replay-tmpl-002',
        pageUrl: '/',
        screenWidth: 390,
        screenHeight: 844,
        duration: 32000,
        eventCount: 54,
        timestamp: Date.now() - 7200000
      },
      {
        sessionId: 'replay-tmpl-003',
        pageUrl: '/pricing',
        screenWidth: 1920,
        screenHeight: 1080,
        duration: 61000,
        eventCount: 112,
        timestamp: Date.now() - 14400000
      },
      {
        sessionId: 'replay-tmpl-004',
        pageUrl: '/blog/event-driven-user-onboarding',
        screenWidth: 1440,
        screenHeight: 900,
        duration: 120000,
        eventCount: 203,
        timestamp: Date.now() - 28800000
      }
    ],
    total: 4
  };
}

export async function getReplayDetail(sessionId: string): Promise<ReplayDetailResult | null> {
  if (getAnalyticsProvider() === 'convex') {
    const result = await callConvexQuery<ReplayDetailResult | null>(convexFunctions.analytics.getReplayDetail, { sessionId });
    if (result.ok && result.value) return result.value;
  }
  return {
    sessionId,
    events: [
      { type: 'pageview', timestamp: 0, data: { path: '/' } },
      { type: 'scroll', timestamp: 2000, data: { scrollY: 250, scrollX: 0 } },
      { type: 'click', timestamp: 3500, data: { target: 'nav-link-pricing', x: 320, y: 45 } },
      { type: 'pageview', timestamp: 4000, data: { path: '/pricing' } },
      { type: 'scroll', timestamp: 6000, data: { scrollY: 600, scrollX: 0 } },
      { type: 'click', timestamp: 8500, data: { target: 'cta-button', x: 512, y: 380 } },
      { type: 'pageview', timestamp: 9000, data: { path: '/signup' } },
      { type: 'input', timestamp: 11000, data: { field: 'email', valueLength: 24 } },
      { type: 'input', timestamp: 13000, data: { field: 'password', valueLength: 12 } },
      { type: 'click', timestamp: 14500, data: { target: 'submit-button', x: 512, y: 520 } },
      { type: 'pageview', timestamp: 15000, data: { path: '/dashboard/overview' } },
      { type: 'resize', timestamp: 20000, data: { width: 1024, height: 768 } },
      { type: 'error', timestamp: 25000, data: { message: 'API request failed, retrying...' } }
    ],
    pageUrl: '/',
    screenWidth: 1440,
    screenHeight: 900,
    duration: 25000
  };
}

export async function getRetentionData(startTime?: number, endTime?: number): Promise<RetentionResult> {
  if (getAnalyticsProvider() === 'convex') {
    const result = await callConvexQuery<RetentionResult>(convexFunctions.analytics.getRetentionData, {
      siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || 'default',
      startTime: startTime || Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: endTime || Date.now()
    });
    if (result.ok) return result.value;
  }
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  return {
    cohorts: Array.from({ length: 6 }, (_, i) => {
      const cohortDate = new Date(now - (5 - i) * week);
      const total = Math.floor(Math.random() * 100) + 50;
      return {
        cohort: cohortDate.toISOString().slice(0, 10),
        total,
        retention: Array.from({ length: 12 }, (_, j) => {
          const decay = Math.max(0, 1 - j * 0.15);
          const noise = Math.random() * 0.1 + 0.95;
          return {
            weekOffset: j,
            users: Math.floor(total * decay * noise),
            percentage: parseFloat((decay * noise * 100).toFixed(1))
          };
        })
      };
    })
  };
}
