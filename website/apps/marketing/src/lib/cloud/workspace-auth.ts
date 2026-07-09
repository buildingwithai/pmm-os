/**
 * Browser-session auth for the cloud workspace pages + APIs.
 * Clerk when configured; PMM_OS_DEV_USER bypass in non-production only
 * (local verification without keys). One place — the pages and routes
 * all call this instead of carrying their own copy.
 */
export async function resolveUserId(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const { auth } = await import("@clerk/nextjs/server");
    return (await auth()).userId;
  }
  if (process.env.NODE_ENV !== "production" && process.env.PMM_OS_DEV_USER) {
    return process.env.PMM_OS_DEV_USER;
  }
  return null;
}

export async function resolveWorkspaceUser(): Promise<{ userId: string; email: string } | null> {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return null;
    const user = await currentUser();
    return { userId, email: user?.emailAddresses?.[0]?.emailAddress || "" };
  }
  if (process.env.NODE_ENV !== "production" && process.env.PMM_OS_DEV_USER) {
    return { userId: process.env.PMM_OS_DEV_USER, email: "dev@local" };
  }
  return null;
}
