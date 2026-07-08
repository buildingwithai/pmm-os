import { mutationGeneric, queryGeneric } from 'convex/server';
import { v } from 'convex/values';

export const trackEvent = mutationGeneric({
  args: {
    type: v.string(),
    siteId: v.string(),
    path: v.string(),
    title: v.optional(v.string()),
    referrer: v.optional(v.string()),
    hostname: v.optional(v.string()),
    sessionId: v.string(),
    userId: v.optional(v.string()),
    properties: v.optional(v.string()),
    screenWidth: v.optional(v.number()),
    screenHeight: v.optional(v.number()),
    language: v.optional(v.string()),
    browser: v.optional(v.string()),
    os: v.optional(v.string()),
    deviceType: v.optional(v.string()),
    country: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    await ctx.db.insert('analyticsEvents', { ...args, timestamp });
    return { success: true };
  }
});

export const storeReplaySnapshot = mutationGeneric({
  args: {
    siteId: v.string(),
    sessionId: v.string(),
    events: v.string(),
    pageUrl: v.string(),
    screenWidth: v.number(),
    screenHeight: v.number(),
    duration: v.number(),
    eventCount: v.number()
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const existing = await ctx.db
      .query('replaySnapshots')
      .withIndex('by_site_session', (q: any) =>
        q.eq('siteId', args.siteId).eq('sessionId', args.sessionId)
      )
      .first();

    const snapshot = { ...args, timestamp };

    if (existing) {
      await ctx.db.patch(existing._id, snapshot);
      return { success: true, mode: 'updated' };
    }

    await ctx.db.insert('replaySnapshots', snapshot);
    return { success: true, mode: 'created' };
  }
});

export const getAnalyticsSummary = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number()
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const pageviews = events.filter((e) => e.type === 'pageview');
    const totalVisitors = pageviews.length;
    const uniqueSessions = new Set(pageviews.map((e) => e.sessionId)).size;

    const pageCount = new Map<string, { title: string; path: string; views: number; visitors: Set<string> }>();
    const referrerCount = new Map<string, Set<string>>();
    const eventCount = new Map<string, number>();
    const deviceCount = new Map<string, number>();
    const browserCount = new Map<string, number>();

    for (const event of pageviews) {
      deviceCount.set(event.deviceType || 'desktop', (deviceCount.get(event.deviceType || 'desktop') || 0) + 1);
      browserCount.set(event.browser || 'Unknown', (browserCount.get(event.browser || 'Unknown') || 0) + 1);
      const path = event.path || '/';
      const existing = pageCount.get(path) || { title: event.title || path, path, views: 0, visitors: new Set() };
      existing.views++;
      existing.visitors.add(event.sessionId);
      pageCount.set(path, existing);

      if (event.referrer) {
        const refVisitors = referrerCount.get(event.referrer) || new Set();
        refVisitors.add(event.sessionId);
        referrerCount.set(event.referrer, refVisitors);
      }
    }

    const customEvents = events.filter((e) => e.type === 'custom_event');
    for (const event of customEvents) {
      if (event.properties) {
        try {
          const props = JSON.parse(event.properties);
          const name = props.eventName || 'unknown';
          eventCount.set(name, (eventCount.get(name) || 0) + 1);
        } catch {}
      }
    }

    const topPages = Array.from(pageCount.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map((p) => ({ path: p.path, title: p.title, views: p.views, visitors: p.visitors.size }));

    const referrers = Array.from(referrerCount.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10)
      .map(([source, visitors]) => ({ source, visitors: visitors.size }));

    const eventsList = Array.from(eventCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    const devices = Array.from(deviceCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([device, count]) => ({ device, count }));
    const browsers = Array.from(browserCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([browser, count]) => ({ browser, count }));

    return {
      totalVisitors,
      uniqueVisitors: uniqueSessions,
      pageViews: pageviews.length,
      topPages,
      referrers,
      events: eventsList,
      devices,
      browsers
    };
  }
});

export const getAnalyticsTimeSeries = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    intervalMs: v.number()
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const buckets = new Map<number, { pageviews: number; visitors: Set<string> }>();

    for (const event of events) {
      if (event.type !== 'pageview') continue;
      const bucket = Math.floor(event.timestamp / args.intervalMs) * args.intervalMs;
      const existing = buckets.get(bucket) || { pageviews: 0, visitors: new Set() };
      existing.pageviews++;
      existing.visitors.add(event.sessionId);
      buckets.set(bucket, existing);
    }

    const points = Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([timestamp, data]) => ({
        timestamp,
        pageviews: data.pageviews,
        visitors: data.visitors.size
      }));

    return points;
  }
});

export const getRecentEvents = queryGeneric({
  args: {
    siteId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q) => q.eq('siteId', args.siteId))
      .order('desc')
      .take(args.limit || 50);

    return events.map((e) => ({
      type: e.type,
      path: e.path,
      title: e.title,
      referrer: e.referrer,
      hostname: e.hostname,
      timestamp: e.timestamp,
      sessionId: e.sessionId
    }));
  }
});

export const getSessions = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .order('desc')
      .collect();

    const sessionMap = new Map<
      string,
      {
        sessionId: string;
        pageviews: number;
        pages: string[];
        startTime: number;
        endTime: number;
        referrer: string;
        browser: string;
        os: string;
        deviceType: string;
        country: string;
      }
    >();

    for (const event of events) {
      if (event.type !== 'pageview') continue;
      const existing = sessionMap.get(event.sessionId);
      if (existing) {
        existing.pageviews++;
        if (!existing.pages.includes(event.path)) existing.pages.push(event.path);
        if (event.timestamp < existing.startTime) existing.startTime = event.timestamp;
        if (event.timestamp > existing.endTime) existing.endTime = event.timestamp;
      } else {
        sessionMap.set(event.sessionId, {
          sessionId: event.sessionId,
          pageviews: 1,
          pages: [event.path],
          startTime: event.timestamp,
          endTime: event.timestamp,
          referrer: event.referrer || '',
          browser: event.browser || '',
          os: event.os || '',
          deviceType: event.deviceType || '',
          country: event.country || ''
        });
      }
    }

    const sessionsList = Array.from(sessionMap.values())
      .sort((a, b) => b.startTime - a.startTime);

    const total = sessionsList.length;
    const offset = args.offset || 0;
    const limit = args.limit || 20;
    const paged = sessionsList.slice(offset, offset + limit);

    return {
      sessions: paged.map((s) => ({
        ...s,
        duration: s.endTime - s.startTime
      })),
      total,
      offset,
      limit
    };
  }
});

export const getPageAnalytics = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number()
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const pageMap = new Map<
      string,
      {
        path: string;
        title: string;
        views: number;
        uniqueVisitors: Set<string>;
        referrers: Map<string, number>;
        browsers: Map<string, number>;
        devices: Map<string, number>;
      }
    >();

    for (const event of events) {
      if (event.type !== 'pageview') continue;
      const path = event.path || '/';
      const existing = pageMap.get(path) || {
        path,
        title: event.title || path,
        views: 0,
        uniqueVisitors: new Set(),
        referrers: new Map(),
        browsers: new Map(),
        devices: new Map()
      };
      existing.views++;
      existing.uniqueVisitors.add(event.sessionId);
      if (event.referrer) existing.referrers.set(event.referrer, (existing.referrers.get(event.referrer) || 0) + 1);
      if (event.browser) existing.browsers.set(event.browser, (existing.browsers.get(event.browser) || 0) + 1);
      if (event.deviceType) existing.devices.set(event.deviceType, (existing.devices.get(event.deviceType) || 0) + 1);
      pageMap.set(path, existing);
    }

    const pages = Array.from(pageMap.values())
      .sort((a, b) => b.views - a.views)
      .map((p) => ({
        path: p.path,
        title: p.title,
        views: p.views,
        uniqueVisitors: p.uniqueVisitors.size,
        referrers: Array.from(p.referrers.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([source, count]) => ({ source, count })),
        browsers: Array.from(p.browsers.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([browser, count]) => ({ browser, count })),
        devices: Array.from(p.devices.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([device, count]) => ({ device, count }))
      }));

    return { pages, total: pages.length };
  }
});

export const getErrors = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const errorMap = new Map<
      string,
      {
        message: string;
        count: number;
        paths: Map<string, number>;
        sessions: Set<string>;
        browsers: Map<string, number>;
        lastSeen: number;
      }
    >();

    for (const event of events) {
      if (event.type !== 'error') continue;
      let message = 'Unknown error';
      if (event.properties) {
        try {
          const props = JSON.parse(event.properties);
          message = props.errorMessage || props.message || 'Unknown error';
        } catch {}
      }
      const existing = errorMap.get(message) || {
        message,
        count: 0,
        paths: new Map(),
        sessions: new Set(),
        browsers: new Map(),
        lastSeen: 0
      };
      existing.count++;
      existing.paths.set(event.path, (existing.paths.get(event.path) || 0) + 1);
      existing.sessions.add(event.sessionId);
      if (event.browser) existing.browsers.set(event.browser, (existing.browsers.get(event.browser) || 0) + 1);
      if (event.timestamp > existing.lastSeen) existing.lastSeen = event.timestamp;
      errorMap.set(message, existing);
    }

    const errors = Array.from(errorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, args.limit || 50)
      .map((e) => ({
        message: e.message,
        count: e.count,
        uniqueSessions: e.sessions.size,
        topPaths: Array.from(e.paths.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([path, count]) => ({ path, count })),
        browsers: Array.from(e.browsers.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([browser, count]) => ({ browser, count })),
        lastSeen: e.lastSeen
      }));

    return { errors, total: errors.length };
  }
});

export const getFunnelData = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    steps: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const sessionPaths = new Map<string, { path: string; timestamp: number }[]>();

    for (const event of events) {
      if (event.type !== 'pageview') continue;
      const list = sessionPaths.get(event.sessionId) || [];
      list.push({ path: event.path, timestamp: event.timestamp });
      sessionPaths.set(event.sessionId, list);
    }

    for (const [, paths] of sessionPaths) {
      paths.sort((a, b) => a.timestamp - b.timestamp);
    }

    const steps = args.steps;
    const stepCounts = Array.from({ length: steps.length }, () => 0);
    const totalSessions = sessionPaths.size;

    for (const [, paths] of sessionPaths) {
      let stepIndex = 0;
      for (const visit of paths) {
        if (stepIndex < steps.length && visit.path === steps[stepIndex]) {
          stepIndex++;
        }
      }
      for (let i = 0; i < stepIndex; i++) {
        stepCounts[i]++;
      }
    }

    return {
      steps: steps.map((step, i) => ({
        path: step,
        sessions: stepCounts[i],
        dropoff: i > 0 ? stepCounts[i - 1] - stepCounts[i] : 0,
        conversionRate: totalSessions > 0 ? (stepCounts[i] / totalSessions) * 100 : 0
      })),
      totalSessions
    };
  }
});

export const getJourneyData = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    maxTransitions: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const sessionPaths = new Map<string, { path: string; timestamp: number }[]>();

    for (const event of events) {
      if (event.type !== 'pageview') continue;
      const list = sessionPaths.get(event.sessionId) || [];
      list.push({ path: event.path, timestamp: event.timestamp });
      sessionPaths.set(event.sessionId, list);
    }

    const transitions = new Map<string, number>();

    for (const [, paths] of sessionPaths) {
      paths.sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 0; i < paths.length - 1; i++) {
        const key = `${paths[i].path}||${paths[i + 1].path}`;
        transitions.set(key, (transitions.get(key) || 0) + 1);
      }
    }

    const maxT = args.maxTransitions || 30;
    const topTransitions = Array.from(transitions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxT)
      .map(([key, count]) => {
        const [from, to] = key.split('||');
        return { from, to, count };
      });

    const allPaths = new Set<string>();
    for (const t of topTransitions) {
      allPaths.add(t.from);
      allPaths.add(t.to);
    }

    return {
      transitions: topTransitions,
      paths: Array.from(allPaths),
      totalTransitions: transitions.size
    };
  }
});

export const getRetentionData = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number()
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const sessionFirstSeen = new Map<string, number>();
    const sessionActivity = new Map<string, number[]>();

    for (const event of events) {
      if (event.type !== 'pageview') continue;
      const existing = sessionFirstSeen.get(event.sessionId);
      if (!existing || event.timestamp < existing) {
        sessionFirstSeen.set(event.sessionId, event.timestamp);
      }
      const weeks = sessionActivity.get(event.sessionId) || [];
      const weekNum = Math.floor(event.timestamp / (7 * 24 * 60 * 60 * 1000));
      if (!weeks.includes(weekNum)) weeks.push(weekNum);
      sessionActivity.set(event.sessionId, weeks);
    }

    const cohortMap = new Map<number, { total: number; weeks: Map<number, number> }>();

    for (const [sessionId, firstSeen] of sessionFirstSeen) {
      const cohortWeek = Math.floor(firstSeen / (7 * 24 * 60 * 60 * 1000));
      const existing = cohortMap.get(cohortWeek) || { total: 0, weeks: new Map() };
      existing.total++;
      const activityWeeks = sessionActivity.get(sessionId) || [];
      for (const week of activityWeeks) {
        if (week >= cohortWeek) {
          const weekOffset = week - cohortWeek;
          existing.weeks.set(weekOffset, (existing.weeks.get(weekOffset) || 0) + 1);
        }
      }
      cohortMap.set(cohortWeek, existing);
    }

    const cohorts = Array.from(cohortMap.entries())
      .sort((a, b) => b[0] - a[0])
      .slice(0, 12)
      .map(([cohortWeek, data]) => {
        const cohortDate = new Date(cohortWeek * 7 * 24 * 60 * 60 * 1000);
        const retention: { weekOffset: number; users: number; percentage: number }[] = [];
        for (let i = 0; i <= 11; i++) {
          const users = data.weeks.get(i) || 0;
          retention.push({
            weekOffset: i,
            users,
            percentage: data.total > 0 ? (users / data.total) * 100 : 0
          });
        }
        return {
          cohort: cohortDate.toISOString().slice(0, 10),
          total: data.total,
          retention
        };
      });

    return { cohorts };
  }
});

export const getCountries = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number()
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const pageviews = events.filter((e) => e.type === 'pageview');
    const countryMap = new Map<string, { visitors: Set<string>; pageviews: number }>();

    for (const event of pageviews) {
      const country = event.country || 'Unknown';
      const entry = countryMap.get(country) || { visitors: new Set(), pageviews: 0 };
      entry.visitors.add(event.sessionId);
      entry.pageviews++;
      countryMap.set(country, entry);
    }

    const countries = Array.from(countryMap.entries())
      .sort((a, b) => b[1].pageviews - a[1].pageviews)
      .map(([country, data]) => ({
        country,
        visitors: data.visitors.size,
        pageviews: data.pageviews
      }));

    return { countries, total: countries.length };
  }
});

export const getPerformanceMetrics = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number()
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_site_type', (q: any) => q.eq('siteId', args.siteId).eq('type', 'performance'))
      .collect();
    const rangedEvents = events.filter(
      (event) => event.timestamp >= args.startTime && event.timestamp <= args.endTime
    );

    const metrics = new Map<string, number[]>();

    for (const event of rangedEvents) {
      if (!event.properties) continue;
      try {
        const props = JSON.parse(event.properties);
        for (const [key, value] of Object.entries(props)) {
          if (typeof value === 'number') {
            const list = metrics.get(key) || [];
            list.push(value);
            metrics.set(key, list);
          }
        }
      } catch {}
    }

    const result = Array.from(metrics.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([name, values]) => {
        const sorted = values.sort((a, b) => a - b);
        const sum = sorted.reduce((a, b) => a + b, 0);
        const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
        const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
        return {
          name,
          avg: Math.round(sum / sorted.length),
          p50,
          p95,
          count: sorted.length
        };
      });

    return { metrics: result, totalEvents: events.length };
  }
});

export const getReplaySessions = queryGeneric({
  args: {
    siteId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query('replaySnapshots')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .order('desc')
      .take(args.limit || 20);

    const totalSnapshots = await ctx.db
      .query('replaySnapshots')
      .withIndex('by_site_timestamp', (q: any) =>
        q.eq('siteId', args.siteId).gte('timestamp', args.startTime).lte('timestamp', args.endTime)
      )
      .collect();

    const sessions = snapshots.map((s) => ({
      sessionId: s.sessionId,
      pageUrl: s.pageUrl,
      screenWidth: s.screenWidth,
      screenHeight: s.screenHeight,
      duration: s.duration,
      eventCount: s.eventCount,
      timestamp: s.timestamp
    }));

    return { sessions, total: totalSnapshots.length };
  }
});

export const getReplayDetail = queryGeneric({
  args: {
    sessionId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db
      .query('replaySnapshots')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!snapshot) return null;

    let events: { type: string; timestamp: number; data: Record<string, unknown> }[] = [];
    try {
      events = JSON.parse(snapshot.events);
    } catch {}

    return {
      sessionId: snapshot.sessionId,
      events,
      pageUrl: snapshot.pageUrl,
      screenWidth: snapshot.screenWidth,
      screenHeight: snapshot.screenHeight,
      duration: snapshot.duration
    };
  }
});
