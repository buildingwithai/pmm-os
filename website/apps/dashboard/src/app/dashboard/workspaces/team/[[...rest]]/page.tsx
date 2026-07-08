'use client';

import PageContainer from '@/components/layout/page-container';
import { OrganizationProfile } from '@clerk/nextjs';
import { teamInfoContent } from '@/config/infoconfig';
import { authBypassEnabled } from '@/lib/auth-bypass';
import { Badge } from '@/components/ui/badge';

export default function TeamPage() {
  if (authBypassEnabled) {
    return (
      <PageContainer
        pageTitle='Team Management'
        pageDescription='Manage your workspace team, members, roles, security and more.'
        infoContent={teamInfoContent}
      >
        <div className='space-y-4'>
          {[
            ['Owner', 'local@template.dev', 'Full access'],
            ['Admin', 'admin@example.com', 'Invite pending'],
            ['Member', 'member@example.com', 'Sample user']
          ].map(([role, email, status]) => (
            <div
              key={email}
              className='border-border flex items-center justify-between border-b py-3 last:border-b-0'
            >
              <div>
                <div className='font-medium'>{email}</div>
                <div className='text-muted-foreground text-sm'>{role}</div>
              </div>
              <Badge variant='secondary'>{status}</Badge>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
      infoContent={teamInfoContent}
    >
      <OrganizationProfile />
    </PageContainer>
  );
}
