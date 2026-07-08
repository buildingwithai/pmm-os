import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authBypassEnabled } from '@/lib/auth-bypass';

export default async function Page() {
  if (authBypassEnabled) {
    redirect('/dashboard/overview');
  }

  const { userId } = await auth();

  if (!userId) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  }
}
