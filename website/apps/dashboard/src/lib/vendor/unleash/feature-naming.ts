/*
 * Adapted from Unleash feature naming validation.
 * Source: https://github.com/Unleash/unleash
 * License: Apache-2.0. See docs/vendor/unleash/LICENSE.
 *
 * Changes for this template:
 * - Removed Unleash internal model imports.
 * - Kept the validation behavior small and framework independent.
 * - Added plain result types used by the local dashboard feature-flag module.
 */

export type FeatureNamingRule = {
  description?: string;
  example?: string;
  pattern?: string;
};

export type FeatureNamingValidation =
  | { state: 'valid' }
  | { reasons: [string, ...string[]]; state: 'invalid' };

const disallowedStrings = [' ', '\\t', '\\s', '\\n', '\\r', '\\f', '\\v'];

function compileRegex(pattern: string) {
  return new RegExp(`^${pattern}$`);
}

function whitespaceError(pattern: string) {
  return `Feature flag names cannot contain whitespace. The pattern "${pattern}" includes whitespace.`;
}

function exampleMismatchError(example: string, pattern: string) {
  return `The example "${example}" does not match the feature flag naming pattern "${pattern}".`;
}

function invalidValueError(valueName: string) {
  return `A feature flag naming ${valueName} was provided without a pattern.`;
}

export function validateFeatureNamingRule(rule: FeatureNamingRule): FeatureNamingValidation {
  const { description, example, pattern } = rule;
  const errors: string[] = [];

  if (disallowedStrings.some((value) => pattern?.includes(value))) {
    errors.push(whitespaceError(pattern as string));
  } else if (pattern && example && !compileRegex(pattern).test(example)) {
    errors.push(exampleMismatchError(example, pattern));
  }

  if (!pattern && example) {
    errors.push(invalidValueError('example'));
  }

  if (!pattern && description) {
    errors.push(invalidValueError('description'));
  }

  const [first, ...rest] = errors;
  if (first) {
    return { reasons: [first, ...rest], state: 'invalid' };
  }

  return { state: 'valid' };
}

export type FeatureNameCheckResult =
  | { state: 'valid' }
  | { invalidNames: Set<string>; state: 'invalid' };

export function checkFeatureFlagNamesAgainstPattern(
  featureNames: string[],
  pattern: string | null | undefined
): FeatureNameCheckResult {
  if (!pattern) {
    return { state: 'valid' };
  }

  const regex = compileRegex(pattern);
  const mismatchedNames = featureNames.filter((name) => !regex.test(name));

  if (mismatchedNames.length > 0) {
    return {
      invalidNames: new Set(mismatchedNames),
      state: 'invalid'
    };
  }

  return { state: 'valid' };
}
