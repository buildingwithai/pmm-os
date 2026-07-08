export function clerkSecretKeyConfigured() {
  return (
    !!process.env.CLERK_SECRET_KEY?.trim() &&
    process.env.CLERK_SECRET_KEY.trim().startsWith('sk_')
  );
}

export function serverClerkAuthEnabled() {
  return (
    process.env.NEXT_PUBLIC_AUTH_BYPASS !== 'true' &&
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.trim().startsWith('pk_') &&
    clerkSecretKeyConfigured()
  );
}

export function authSetupRequired() {
  return process.env.NEXT_PUBLIC_AUTH_BYPASS !== 'true' && !serverClerkAuthEnabled();
}
