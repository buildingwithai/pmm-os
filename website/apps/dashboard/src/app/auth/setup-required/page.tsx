import Link from 'next/link';

export const metadata = {
  title: 'Authentication Setup Required',
  robots: {
    index: false,
    follow: false
  }
};

export default function AuthSetupRequiredPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-6'>
      <section className='w-full max-w-xl space-y-6'>
        <div className='space-y-2'>
          <p className='text-muted-foreground text-sm font-medium uppercase tracking-wide'>
            Template setup
          </p>
          <h1 className='text-3xl font-semibold tracking-tight'>Authentication is not configured</h1>
          <p className='text-muted-foreground text-base leading-7'>
            The dashboard is protected in production mode, but Clerk keys are missing. Add real
            Clerk keys, or turn local template bypass back on while developing.
          </p>
        </div>

        <div className='divide-border rounded-md border text-sm'>
          <div className='space-y-2 p-4'>
            <div className='font-medium'>Local template mode</div>
            <code className='block rounded bg-muted px-3 py-2'>
              NEXT_PUBLIC_AUTH_BYPASS=true
            </code>
          </div>
          <div className='space-y-2 border-t p-4'>
            <div className='font-medium'>Production Clerk mode</div>
            <code className='block rounded bg-muted px-3 py-2'>
              NEXT_PUBLIC_AUTH_BYPASS=false
              {'\n'}NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
              {'\n'}CLERK_SECRET_KEY=sk_...
            </code>
          </div>
        </div>

        <Link className='text-primary text-sm font-medium underline-offset-4 hover:underline' href='/'>
          Back to app
        </Link>
      </section>
    </main>
  );
}
