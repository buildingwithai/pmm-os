import { mutationGeneric, queryGeneric } from 'convex/server';
import { v } from 'convex/values';

export const listFeatureFlagOverrides = queryGeneric({
  args: {
    organizationId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('featureFlagOverrides')
      .withIndex('by_organization', (q: any) => q.eq('organizationId', args.organizationId))
      .collect();
  }
});

export const setFeatureFlagOverride = mutationGeneric({
  args: {
    enabled: v.boolean(),
    flagKey: v.string(),
    organizationId: v.string(),
    source: v.union(v.literal('native'), v.literal('unleash-reference')),
    updatedByUserId: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('featureFlagOverrides')
      .withIndex('by_flag', (q: any) =>
        q.eq('organizationId', args.organizationId).eq('flagKey', args.flagKey)
      )
      .unique();
    const value = {
      ...args,
      updatedAt: Date.now()
    };

    if (existing) {
      // Convex document ids use the `_id` field name.
      // eslint-disable-next-line no-underscore-dangle
      const existingId = existing._id;
      await ctx.db.patch(existingId, value);
      return existingId;
    }

    return await ctx.db.insert('featureFlagOverrides', value);
  }
});
