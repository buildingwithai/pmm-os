import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  featureFlagOverrides: defineTable({
    enabled: v.boolean(),
    flagKey: v.string(),
    organizationId: v.string(),
    source: v.union(v.literal('native'), v.literal('unleash-reference')),
    updatedAt: v.number(),
    updatedByUserId: v.string()
  })
    .index('by_organization', ['organizationId'])
    .index('by_flag', ['organizationId', 'flagKey']),

  analyticsEvents: defineTable({
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
    country: v.optional(v.string()),
    timestamp: v.number()
  })
    .index('by_site_timestamp', ['siteId', 'timestamp'])
    .index('by_site_type', ['siteId', 'type'])
    .index('by_session', ['sessionId']),

  replaySnapshots: defineTable({
    siteId: v.string(),
    sessionId: v.string(),
    events: v.string(),
    pageUrl: v.string(),
    screenWidth: v.number(),
    screenHeight: v.number(),
    duration: v.number(),
    eventCount: v.number(),
    timestamp: v.number()
  })
    .index('by_site_session', ['siteId', 'sessionId'])
    .index('by_session', ['sessionId'])
    .index('by_site_timestamp', ['siteId', 'timestamp'])
});
