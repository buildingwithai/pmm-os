import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';
import { authBypassEnabled } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  if (authBypassEnabled) {
    redirect('/dashboard/overview');
  }

  return <SignInViewPage />;
}
