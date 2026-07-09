import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk guards only the cloud workspace (/app). Marketing pages and the
 * token-authenticated cloud APIs are untouched. With no Clerk keys configured
 * (e.g. before the owner creates the Clerk app), everything passes through —
 * the live site can never break on a missing key.
 */
// Pages: signed-out visitors to /app are sent to Clerk's hosted sign-in and
// come back. APIs: middleware must RUN (auth() needs its context) but never
// redirect — routes return their own 401s, and /api/cloud/sync stays open to
// the plugin's Bearer-token auth.
const clerk = clerkMiddleware(async (auth, request) => {
  if (!request.nextUrl.pathname.startsWith("/api/")) await auth.protect();
});

export default function middleware(request: NextRequest, event: never) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return NextResponse.next();
  return clerk(request, event);
}

export const config = {
  matcher: ["/app/:path*", "/api/cloud/:path*"],
};
