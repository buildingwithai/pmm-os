import { describe, expect, it } from 'vitest';

import type { FeatureFlagAccess } from './access';
import { prepareFeatureFlagWrite } from './write-boundary';

const baseAccess: FeatureFlagAccess = {
  canRead: true,
  canWrite: false,
  label: 'Local Workspace',
  message: 'Writes are locked.',
  mode: 'template',
  organizationId: 'template-org',
  userId: 'template-user'
};

describe('prepareFeatureFlagWrite', () => {
  it('refuses unknown feature flags before storage can be called', () => {
    const decision = prepareFeatureFlagWrite(
      { enabled: true, flagKey: 'template.unknownFlag' },
      { ...baseAccess, canWrite: true, mode: 'admin' }
    );

    expect(decision).toEqual({
      message: 'This feature flag key is not part of the template registry.',
      ok: false,
      reason: 'unknown_flag'
    });
  });

  it('refuses template mode and read-only users', () => {
    const decision = prepareFeatureFlagWrite(
      { enabled: false, flagKey: 'template.providerHealth' },
      baseAccess
    );

    expect(decision).toEqual({
      message: 'Writes are locked.',
      ok: false,
      reason: 'forbidden'
    });
  });

  it('prepares exact storage input for an allowed organization admin', () => {
    const decision = prepareFeatureFlagWrite(
      { enabled: false, flagKey: 'template.providerHealth' },
      {
        ...baseAccess,
        canWrite: true,
        label: 'Organization admin',
        mode: 'admin',
        organizationId: 'org_123',
        userId: 'user_123'
      }
    );

    expect(decision).toEqual({
      input: {
        enabled: false,
        flagKey: 'template.providerHealth',
        organizationId: 'org_123',
        updatedByUserId: 'user_123'
      },
      ok: true
    });
  });
});
