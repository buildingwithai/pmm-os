export type AnalyticsProvider = 'local-template' | 'umami' | 'rybbit' | 'openpanel' | 'plausible' | 'convex';

export interface AnalyticsSummary {
  provider: AnalyticsProvider;
  modeLabel: string;
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  conversionRate: string;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    visitors: number;
  }>;
  referrers: Array<{
    source: string;
    visitors: number;
  }>;
  events: Array<{
    name: string;
    count: number;
    owner: string;
  }>;
  recentActivity: Array<{
    time: string;
    label: string;
    detail: string;
  }>;
  devices: Array<{ device: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
}

export interface SessionInfo {
  sessionId: string;
  pageviews: number;
  pages: string[];
  startTime: number;
  endTime: number;
  duration: number;
  referrer: string;
  browser: string;
  os: string;
  deviceType: string;
  country: string;
}

export interface SessionsResult {
  sessions: SessionInfo[];
  total: number;
  offset: number;
  limit: number;
}

export interface PageAnalyticsInfo {
  path: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  referrers: Array<{ source: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
}

export interface PageAnalyticsResult {
  pages: PageAnalyticsInfo[];
  total: number;
}

export interface TimeSeriesPoint {
  timestamp: number;
  pageviews: number;
  visitors: number;
}

export interface ErrorInfo {
  message: string;
  count: number;
  uniqueSessions: number;
  topPaths: Array<{ path: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  lastSeen: number;
}

export interface ErrorsResult {
  errors: ErrorInfo[];
  total: number;
}

export interface FunnelStep {
  path: string;
  sessions: number;
  dropoff: number;
  conversionRate: number;
}

export interface FunnelResult {
  steps: FunnelStep[];
  totalSessions: number;
}

export interface JourneyTransition {
  from: string;
  to: string;
  count: number;
}

export interface JourneyResult {
  transitions: JourneyTransition[];
  paths: string[];
  totalTransitions: number;
}

export interface RetentionCell {
  weekOffset: number;
  users: number;
  percentage: number;
}

export interface CohortData {
  cohort: string;
  total: number;
  retention: RetentionCell[];
}

export interface RetentionResult {
  cohorts: CohortData[];
}

export interface CountryStat {
  country: string;
  visitors: number;
  pageviews: number;
}

export interface CountriesResult {
  countries: CountryStat[];
  total: number;
}

export interface PerformanceStat {
  name: string;
  avg: number;
  p50: number;
  p95: number;
  count: number;
}

export interface PerformanceResult {
  metrics: PerformanceStat[];
  totalEvents: number;
}

export interface ReplaySession {
  sessionId: string;
  pageUrl: string;
  screenWidth: number;
  screenHeight: number;
  duration: number;
  eventCount: number;
  timestamp: number;
}

export interface ReplaySessionsResult {
  sessions: ReplaySession[];
  total: number;
}

export interface ReplayEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface ReplayDetailResult {
  sessionId: string;
  events: ReplayEvent[];
  pageUrl: string;
  screenWidth: number;
  screenHeight: number;
  duration: number;
}
