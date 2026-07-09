import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk guards only the cloud workspace (/app). Marketing pages and the
 * token-authenticated cloud APIs are untouched. With no Clerk keys configured
 * (e.g. before the owner creates the Clerk app), everything passes through —
 * the live site can never break on a missing key.
 */
const clerk = clerkMiddleware();

export default function middleware(request: NextRequest, event: never) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return NextResponse.next();
  return clerk(request, event);
}

export const config = {
  matcher: ["/app/:path*"],
};
