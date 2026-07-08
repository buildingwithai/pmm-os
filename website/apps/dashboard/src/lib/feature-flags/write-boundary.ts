import { nativeFeatureFlags } from './registry';
import type { FeatureFlagKey } from './types';
import type { FeatureFlagAccess } from './access';

export type FeatureFlagWriteInput = {
  enabled: boolean;
  flagKey: string;
};

export type FeatureFlagWriteDecision =
  | {
      input: {
        enabled: boolean;
        flagKey: FeatureFlagKey;
        organizationId: string;
        updatedByUserId: string;
      };
      ok: true;
    }
  | {
      message: string;
      ok: false;
      reason: 'forbidden' | 'unknown_flag';
    };

const featureFlagKeys = new Set(nativeFeatureFlags.map((flag) => flag.key));

export function prepareFeatureFlagWrite(
  input: FeatureFlagWriteInput,
  access: FeatureFlagAccess
): FeatureFlagWriteDecision {
  if (!featureFlagKeys.has(input.flagKey as FeatureFlagKey)) {
    return {
      message: 'This feature flag key is not part of the template registry.',
      ok: false,
      reason: 'unknown_flag'
    };
  }

  if (!access.canWrite) {
    return {
      message: access.message,
      ok: false,
      reason: 'forbidden'
    };
  }

  return {
    input: {
      enabled: input.enabled,
      flagKey: input.flagKey as FeatureFlagKey,
      organizationId: access.organizationId,
      updatedByUserId: access.userId
    },
    ok: true
  };
}
