import { UserProfile } from '@clerk/nextjs';
import { authBypassEnabled, localTemplateUser } from '@/lib/auth-bypass';
import { Badge } from '@/components/ui/badge';

export default function ProfileViewPage() {
  if (authBypassEnabled) {
    return (
      <div className='flex w-full flex-col p-4'>
        <div className='max-w-2xl divide-y rounded-md border'>
          <div className='flex items-center justify-between p-4'>
            <div>
              <h2 className='text-lg font-semibold'>{localTemplateUser.name}</h2>
              <p className='text-muted-foreground text-sm'>{localTemplateUser.email}</p>
            </div>
            <Badge variant='secondary'>Template mode</Badge>
          </div>
          <div className='p-4 text-sm text-muted-foreground'>
            Clerk profile management is bypassed until real auth keys are configured.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col p-4'>
      <UserProfile />
    </div>
  );
}
