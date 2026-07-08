import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { getTemplateEnvStatus } = require('./check-template-env.js');

describe('getTemplateEnvStatus', () => {
  it('keeps local template mode active without provider credentials', () => {
    const status = getTemplateEnvStatus(
      {
        NEXT_PUBLIC_AUTH_BYPASS: 'true',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: '',
        CLERK_SECRET_KEY: '',
        NEXT_PUBLIC_CONVEX_URL: '',
        CONVEX_DEPLOYMENT: ''
      },
      true
    );

    expect(status.mode).toBe('template');
    expect(status.hasClerk).toBe(false);
    expect(status.hasConvex).toBe(false);
    expect(status.rows).toContainEqual(['Auth bypass', 'on']);
  });

  it('marks real-provider mode only when auth bypass is off and both providers are complete', () => {
    const status = getTemplateEnvStatus(
      {
        NEXT_PUBLIC_AUTH_BYPASS: 'false',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_disposable',
        CLERK_SECRET_KEY: 'sk_test_disposable',
        NEXT_PUBLIC_CONVEX_URL: 'https://example.convex.cloud',
        CONVEX_DEPLOYMENT: 'dev:example'
      },
      true
    );

    expect(status.mode).toBe('real-provider');
    expect(status.hasClerk).toBe(true);
    expect(status.hasConvex).toBe(true);
  });

  it('flags partial provider mode when setup is incomplete', () => {
    const status = getTemplateEnvStatus(
      {
        NEXT_PUBLIC_AUTH_BYPASS: 'false',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_disposable',
        CLERK_SECRET_KEY: '',
        NEXT_PUBLIC_CONVEX_URL: 'https://example.convex.cloud',
        CONVEX_DEPLOYMENT: 'dev:example'
      },
      false
    );

    expect(status.mode).toBe('partial-provider');
    expect(status.rows).toContainEqual(['Local env file', 'not present']);
  });
});
