export type FeatureFlagKey =
  | 'template.providerHealth'
  | 'template.providerRecipes'
  | 'template.customerLifecycle';

export type FeatureFlagStage = 'core' | 'beta' | 'experimental';

export type FeatureFlagSource = 'native' | 'unleash-reference';

export type FeatureFlagDefinition = {
  key: FeatureFlagKey;
  label: string;
  description: string;
  defaultEnabled: boolean;
  owner: string;
  stage: FeatureFlagStage;
  rollout: string;
  source: FeatureFlagSource;
};

export type FeatureFlagState = {
  description: string;
  enabled: boolean;
  flagKey: FeatureFlagKey;
  isDefault: boolean;
  label: string;
  owner: string;
  rollout: string;
  stage: FeatureFlagStage;
  source: FeatureFlagSource;
};
