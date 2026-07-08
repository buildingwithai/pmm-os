'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganization } from '@clerk/nextjs';
import { PricingTable } from '@clerk/nextjs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { billingInfoContent } from '@/config/infoconfig';
import { authBypassEnabled, localTemplateUser } from '@/lib/auth-bypass';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  if (authBypassEnabled) {
    return <LocalBillingPage />;
  }

  return <ClerkBillingPage />;
}

function ClerkBillingPage() {
  const { organization, isLoaded } = useOrganization();

  return (
    <PageContainer
      isLoading={!isLoaded}
      access={!!organization}
      accessFallback={
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='space-y-2 text-center'>
            <h2 className='text-2xl font-semibold'>No Organization Selected</h2>
            <p className='text-muted-foreground'>
              Please select or create an organization to view billing information.
            </p>
          </div>
        </div>
      }
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription={`Manage your subscription and usage limits for ${organization?.name}`}
    >
      <div className='space-y-6'>
        {/* Info Alert */}
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            Plans and subscriptions are managed through Clerk Billing. Subscribe to a plan to unlock
            features and higher limits.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose a plan that fits your organization's needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='mx-auto max-w-4xl'>
              <PricingTable for='organization' />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function LocalBillingPage() {
  return (
    <PageContainer
      access
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription={`Manage your subscription and usage limits for ${localTemplateUser.workspace}`}
    >
      <div className='space-y-6'>
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            Template mode is showing starter plans without connecting Clerk Billing yet.
          </AlertDescription>
        </Alert>

        <div className='divide-border rounded-md border'>
          {['Free', 'Pro', 'Enterprise'].map((plan, index) => (
            <div
              key={plan}
              className='flex items-center justify-between border-b p-4 last:border-b-0'
            >
              <div>
                <div className='flex items-center gap-2 font-medium'>
                  {plan}
                  {index === 1 && <Badge>Recommended</Badge>}
                </div>
                <div className='text-muted-foreground text-sm'>
                  {index === 0
                    ? 'Starter workspace for local development.'
                    : index === 1
                      ? 'Team features, higher limits and billing-ready upgrade path.'
                      : 'Custom support, SSO and advanced governance.'}
                </div>
              </div>
              <Button variant={index === 1 ? 'default' : 'outline'} disabled>
                Configure later
              </Button>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
