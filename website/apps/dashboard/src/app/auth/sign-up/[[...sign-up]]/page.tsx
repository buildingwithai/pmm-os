import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';
import { authBypassEnabled } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default async function Page() {
  if (authBypassEnabled) {
    redirect('/dashboard/overview');
  }

  let stars = 3000; // Default value

  try {
    const response = await fetch(
      'https://api.github.com/repos/kiranism/next-shadcn-dashboard-starter',
      {
        next: { revalidate: 86400 }
      }
    );

    if (response.ok) {
      const data = await response.json();
      stars = data.stargazers_count || stars; // Update stars if API response is valid
    }
  } catch {
    // Error fetching GitHub stars, using default value
  }
  return <SignUpViewPage stars={stars} />;
}
