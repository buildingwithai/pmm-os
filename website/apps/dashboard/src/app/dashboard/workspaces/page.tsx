'use client';

import PageContainer from '@/components/layout/page-container';
import { OrganizationList } from '@clerk/nextjs';
import { workspacesInfoContent } from '@/config/infoconfig';
import { authBypassEnabled, localTemplateUser } from '@/lib/auth-bypass';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WorkspacesPage() {
  if (authBypassEnabled) {
    return (
      <PageContainer
        pageTitle='Workspaces'
        pageDescription='Manage your workspaces and switch between them'
        infoContent={workspacesInfoContent}
      >
        <div className='space-y-4'>
          <div className='border-border flex items-center justify-between border-b pb-4'>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-lg font-semibold'>{localTemplateUser.workspace}</h2>
                <Badge variant='secondary'>Template mode</Badge>
              </div>
              <p className='text-muted-foreground text-sm'>
                Clerk Organizations are bypassed so the cloned dashboard can run before setup.
              </p>
            </div>
            <Button asChild variant='outline'>
              <Link href='/dashboard/workspaces/team'>Open team settings</Link>
            </Button>
          </div>
          <div className='text-muted-foreground text-sm'>
            Connect Clerk later to replace this local workspace with real organizations, roles and
            memberships.
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <OrganizationList
        appearance={{
          elements: {
            organizationListBox: 'space-y-2',
            organizationPreview: 'rounded-lg border p-4 hover:bg-accent',
            organizationPreviewMainIdentifier: 'text-lg font-semibold',
            organizationPreviewSecondaryIdentifier: 'text-sm text-muted-foreground'
          }
        }}
        afterSelectOrganizationUrl='/dashboard/workspaces/team'
        afterCreateOrganizationUrl='/dashboard/workspaces/team'
      />
    </PageContainer>
  );
}
