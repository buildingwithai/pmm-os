import type { FeatureFlagDefinition, FeatureFlagKey } from './types';

export const nativeFeatureFlags: FeatureFlagDefinition[] = [
  {
    key: 'template.providerHealth',
    label: 'Provider health',
    description: 'Shows whether optional lifecycle providers have the required setup keys.',
    defaultEnabled: true,
    owner: 'Template OS',
    stage: 'core',
    rollout: 'Enabled for every workspace because it is a setup safety feature.',
    source: 'native'
  },
  {
    key: 'template.providerRecipes',
    label: 'Provider recipes',
    description:
      'Exposes setup instructions for tools like Formbricks, Chatwoot, Twenty, Cal.com and Dub.',
    defaultEnabled: true,
    owner: 'Integrations',
    stage: 'core',
    rollout: 'Enabled by default so a fresh template can explain optional providers.',
    source: 'native'
  },
  {
    key: 'template.customerLifecycle',
    label: 'Customer lifecycle workspace',
    description:
      'Controls early lifecycle surfaces for feedback, support, CRM, scheduling and attribution.',
    defaultEnabled: true,
    owner: 'Product',
    stage: 'beta',
    rollout: 'Default on for local template review; can be turned off per organization later.',
    source: 'unleash-reference'
  }
];

export function getNativeFeatureFlagDefaults() {
  return Object.fromEntries(
    nativeFeatureFlags.map((flag) => [flag.key, flag.defaultEnabled])
  ) as Record<FeatureFlagKey, boolean>;
}
