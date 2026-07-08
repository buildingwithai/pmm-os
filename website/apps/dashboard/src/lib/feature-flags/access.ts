import { auth } from '@clerk/nextjs/server';

import { authBypassEnabled, localTemplateUser } from '@/lib/auth-bypass';

export type FeatureFlagAccessMode =
  | 'admin'
  | 'missing-auth'
  | 'missing-organization'
  | 'read-only'
  | 'template';

export type FeatureFlagAccess = {
  canRead: boolean;
  canWrite: boolean;
  label: string;
  message: string;
  mode: FeatureFlagAccessMode;
  organizationId: string;
  userId: string;
};

const adminRoles = new Set(['admin', 'org:admin']);

export async function getFeatureFlagAccess(): Promise<FeatureFlagAccess> {
  if (authBypassEnabled) {
    return {
      canRead: true,
      canWrite: false,
      label: localTemplateUser.workspace,
      message:
        'Local template mode is using seed data. Writes stay locked until a real Clerk organization and Convex project are connected.',
      mode: 'template',
      organizationId: 'template-org',
      userId: 'template-user'
    };
  }

  const authState = await auth();
  const userId = authState.userId ?? '';
  const organizationId = authState.orgId ?? '';
  const organizationRole = authState.orgRole ?? '';
  const hasManagePermission =
    authState.has?.({ permission: 'org:feature_flags:manage' }) ?? false;
  const isAdmin = adminRoles.has(organizationRole) || hasManagePermission;

  if (!userId) {
    return {
      canRead: false,
      canWrite: false,
      label: 'Signed out',
      message: 'Sign in with Clerk before reading or changing organization feature flags.',
      mode: 'missing-auth',
      organizationId: '',
      userId: ''
    };
  }

  if (!organizationId) {
    return {
      canRead: false,
      canWrite: false,
      label: 'No organization selected',
      message: 'Select or create a Clerk organization before reading organization feature flags.',
      mode: 'missing-organization',
      organizationId: '',
      userId
    };
  }

  return {
    canRead: true,
    canWrite: isAdmin,
    label: isAdmin ? 'Organization admin' : 'Organization member',
    message: isAdmin
      ? 'This Clerk user can manage feature flag overrides once Convex writes are enabled.'
      : 'This Clerk user can read organization feature flags, but writes are locked for non-admin members.',
    mode: isAdmin ? 'admin' : 'read-only',
    organizationId,
    userId
  };
}
