'use server';

import { revalidatePath } from 'next/cache';

import { getFeatureFlagAccess } from '@/lib/feature-flags/access';
import { setFeatureFlagState } from '@/lib/feature-flags/repository';
import { prepareFeatureFlagWrite } from '@/lib/feature-flags/write-boundary';

export async function updateFeatureFlagOverride(formData: FormData): Promise<void> {
  const flagKey = String(formData.get('flagKey') ?? '');
  const enabled = String(formData.get('enabled') ?? '') === 'true';
  const access = await getFeatureFlagAccess();
  const decision = prepareFeatureFlagWrite({ enabled, flagKey }, access);

  if (!decision.ok) return;

  const result = await setFeatureFlagState(decision.input);

  if (!result.ok) {
    return;
  }

  revalidatePath('/dashboard/feature-flags');
}
