export const authBypassEnabled = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';

export const clerkPublishableKeyConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.trim().startsWith('pk_');

export const clientClerkAuthEnabled = !authBypassEnabled && clerkPublishableKeyConfigured;

export const localTemplateUser = {
  name: 'Local Template User',
  email: 'local@template.dev',
  workspace: 'Local Workspace'
};
