export const convexFunctions = {
  featureFlags: {
    list: 'featureFlags:listFeatureFlagOverrides',
    set: 'featureFlags:setFeatureFlagOverride'
  },
  analytics: {
    trackEvent: 'analytics:trackEvent',
    getSummary: 'analytics:getAnalyticsSummary',
    getTimeSeries: 'analytics:getAnalyticsTimeSeries',
    getRecentEvents: 'analytics:getRecentEvents',
    getSessions: 'analytics:getSessions',
    getPageAnalytics: 'analytics:getPageAnalytics',
    getErrors: 'analytics:getErrors',
    getFunnelData: 'analytics:getFunnelData',
    getJourneyData: 'analytics:getJourneyData',
    getRetentionData: 'analytics:getRetentionData',
    getCountries: 'analytics:getCountries',
    getPerformanceMetrics: 'analytics:getPerformanceMetrics',
    getReplaySessions: 'analytics:getReplaySessions',
    getReplayDetail: 'analytics:getReplayDetail',
    storeReplaySnapshot: 'analytics:storeReplaySnapshot'
  }
} as const;

export function getConvexImplementationStatus(env: Record<string, string | undefined>) {
  const missingKeys = ['NEXT_PUBLIC_CONVEX_URL'].filter((key) => !env[key]);

  if (missingKeys.length > 0) {
    return {
      canCallConvex: false,
      message: `Convex is not configured. Missing ${missingKeys.join(', ')}.`,
      missingKeys
    };
  }

  return {
    canCallConvex: true,
    message: 'Convex is configured.',
    missingKeys
  };
}
