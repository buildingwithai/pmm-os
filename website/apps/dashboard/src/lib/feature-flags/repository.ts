import { getNativeFeatureFlagDefaults, nativeFeatureFlags } from './registry';
import type { FeatureFlagKey, FeatureFlagSource, FeatureFlagState } from './types';
import { convexFunctions, getConvexImplementationStatus } from '@/lib/convex/contract';
import { callConvexMutation, callConvexQuery } from '@/lib/convex/server';

export type FeatureFlagOverride = {
  enabled: boolean;
  flagKey: FeatureFlagKey;
  organizationId: string;
  source: FeatureFlagSource;
  updatedAt: number;
  updatedByUserId: string;
};

export function getSeedFeatureFlagState(overrides: FeatureFlagOverride[] = []): FeatureFlagState[] {
  const defaults = getNativeFeatureFlagDefaults();
  const overrideByKey = new Map(overrides.map((override) => [override.flagKey, override]));

  return nativeFeatureFlags.map((flag) => {
    const override = overrideByKey.get(flag.key);

    return {
      description: flag.description,
      enabled: override?.enabled ?? defaults[flag.key],
      flagKey: flag.key,
      isDefault: !override,
      label: flag.label,
      owner: flag.owner,
      rollout: flag.rollout,
      stage: flag.stage,
      source: override?.source ?? flag.source
    };
  });
}

export async function listFeatureFlagState(
  organizationId = 'template-org',
  env: Record<string, string | undefined> = process.env
) {
  const status = getConvexImplementationStatus(env);

  if (!status.canCallConvex) {
    return {
      flags: getSeedFeatureFlagState(),
      functionName: convexFunctions.featureFlags.list,
      mode: 'seed' as const,
      message: status.message
    };
  }

  const result = await callConvexQuery<FeatureFlagOverride[]>(
    convexFunctions.featureFlags.list,
    { organizationId },
    env
  );

  if (!result.ok) {
    return {
      flags: getSeedFeatureFlagState(),
      functionName: convexFunctions.featureFlags.list,
      mode: 'seed' as const,
      message: result.error
    };
  }

  return {
    flags: getSeedFeatureFlagState(result.value),
    functionName: convexFunctions.featureFlags.list,
    mode: 'convex' as const,
    message: 'Feature flag overrides loaded from Convex.'
  };
}

export async function setFeatureFlagState(
  input: {
    enabled: boolean;
    flagKey: FeatureFlagKey;
    organizationId?: string;
    updatedByUserId?: string;
  },
  env: Record<string, string | undefined> = process.env
) {
  const flag = nativeFeatureFlags.find((item) => item.key === input.flagKey);

  if (!flag) {
    return {
      functionName: convexFunctions.featureFlags.set,
      ok: false,
      reason: 'unknown_flag' as const
    };
  }

  const result = await callConvexMutation<string>(
    convexFunctions.featureFlags.set,
    {
      enabled: input.enabled,
      flagKey: input.flagKey,
      organizationId: input.organizationId ?? 'template-org',
      source: flag.source,
      updatedByUserId: input.updatedByUserId ?? 'template-user'
    },
    env
  );

  if (!result.ok) {
    return {
      functionName: convexFunctions.featureFlags.set,
      ok: false,
      reason: result.reason
    };
  }

  return {
    functionName: convexFunctions.featureFlags.set,
    ok: true,
    value: result.value
  };
}
