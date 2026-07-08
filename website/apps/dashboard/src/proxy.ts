import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { authSetupRequired, serverClerkAuthEnabled } from '@/lib/auth-server';

function protectedPath(pathname: string) {
  return pathname.startsWith('/dashboard');
}

function apiPath(pathname: string) {
  return pathname.startsWith('/api');
}

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  if (serverClerkAuthEnabled()) {
    const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
    const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
    return clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) await auth.protect();
    })(req, event);
  }

  if (authSetupRequired() && protectedPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/setup-required';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (authSetupRequired() && apiPath(pathname)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Authentication is not configured. Set Clerk keys or enable local template auth bypass.'
      },
      { status: 503 }
    );
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
