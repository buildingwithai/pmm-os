import Link from 'next/link';
import type { Metadata } from 'next';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateFeatureFlagOverride } from './actions';
import { getFeatureFlagAccess } from '@/lib/feature-flags/access';
import { listFeatureFlagState } from '@/lib/feature-flags/repository';
import { checkFeatureFlagNamesAgainstPattern } from '@/lib/vendor/unleash/feature-naming';

export const metadata: Metadata = {
  title: 'Dashboard: Feature Flags'
};

const namingPattern = '[a-z]+\\.[a-zA-Z]+';

const sourceLabels = {
  native: 'Native template',
  'unleash-reference': 'Unleash reference'
};

export default async function FeatureFlagsPage() {
  const access = await getFeatureFlagAccess();
  const state = access.canRead
    ? await listFeatureFlagState(access.organizationId)
    : await listFeatureFlagState();
  const namingCheck = checkFeatureFlagNamesAgainstPattern(
    state.flags.map((flag) => flag.flagKey),
    namingPattern
  );
  const enabledCount = state.flags.filter((flag) => flag.enabled).length;
  const defaultCount = state.flags.filter((flag) => flag.isDefault).length;
  const selectedFlag = state.flags[0];

  return (
    <PageContainer
      pageTitle='Feature Flags'
      pageDescription='Control optional template capabilities before real Convex storage is connected.'
      pageHeaderAction={
        <Button asChild variant='outline'>
          <Link href='https://github.com/Unleash/unleash' target='_blank'>
            <Icons.github />
            Unleash source
          </Link>
        </Button>
      }
    >
      <div className='grid min-h-[calc(100vh-12rem)] gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
        <section className='border-border bg-background overflow-hidden rounded-md border'>
          <div className='border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
            <div>
              <h2 className='text-sm font-semibold'>Template flag registry</h2>
              <p className='text-muted-foreground text-sm'>
                {access.canRead ? state.message : access.message}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={access.canWrite ? 'default' : 'outline'}>
                {access.canWrite ? 'Writes available' : 'Writes locked'}
              </Badge>
              <Badge variant='secondary'>{enabledCount} enabled</Badge>
              <Badge variant='outline'>{defaultCount} defaults</Badge>
            </div>
          </div>

          <div className='divide-border divide-y'>
            {state.flags.map((flag) => {
              const isInvalid =
                namingCheck.state === 'invalid' && namingCheck.invalidNames.has(flag.flagKey);

              return (
                <div
                  className='grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_180px_120px]'
                  key={flag.flagKey}
                >
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='font-mono text-sm font-medium'>{flag.flagKey}</span>
                      {isInvalid ? (
                        <Badge variant='destructive'>Naming issue</Badge>
                      ) : (
                        <Badge variant='outline'>Valid name</Badge>
                      )}
                    </div>
                    <p className='text-muted-foreground mt-1 text-sm'>{flag.description}</p>
                  </div>
                  <div className='text-sm'>
                    <div className='text-muted-foreground'>Owner</div>
                    <div className='font-medium'>{flag.owner}</div>
                  </div>
                  <div className='flex items-center justify-start md:justify-end'>
                    <form action={updateFeatureFlagOverride} className='flex items-center gap-2'>
                      <input name='flagKey' type='hidden' value={flag.flagKey} />
                      <input name='enabled' type='hidden' value={String(!flag.enabled)} />
                      <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                        {flag.enabled ? 'On' : 'Off'}
                      </Badge>
                      <Button disabled={!access.canWrite} size='sm' type='submit' variant='outline'>
                        {flag.enabled ? 'Turn off' : 'Turn on'}
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className='border-border bg-background rounded-md border'>
          <div className='border-border border-b px-4 py-3'>
            <h2 className='text-sm font-semibold'>Inspector</h2>
            <p className='text-muted-foreground text-sm'>What is wired right now.</p>
          </div>
          <div className='divide-border divide-y text-sm'>
            <div className='px-4 py-3'>
              <div className='text-muted-foreground'>Mode</div>
              <div className='mt-1 flex items-center gap-2 font-medium'>
                <Icons.circleCheck className='size-4 text-emerald-600' />
                {state.mode}
              </div>
            </div>
            <div className='px-4 py-3'>
              <div className='text-muted-foreground'>Access boundary</div>
              <div className='mt-1 flex flex-wrap items-center gap-2'>
                <Badge variant={access.canRead ? 'outline' : 'destructive'}>{access.label}</Badge>
                <Badge variant={access.canWrite ? 'default' : 'secondary'}>{access.mode}</Badge>
              </div>
              <p className='text-muted-foreground mt-2'>{access.message}</p>
            </div>
            <div className='px-4 py-3'>
              <div className='text-muted-foreground'>Organization scope</div>
              <div className='mt-1 font-mono text-xs'>
                {access.organizationId || 'No Clerk organization'}
              </div>
            </div>
            <div className='px-4 py-3'>
              <div className='text-muted-foreground'>Convex function boundary</div>
              <div className='mt-1 font-mono text-xs'>{state.functionName}</div>
            </div>
            <div className='px-4 py-3'>
              <div className='text-muted-foreground'>Naming rule</div>
              <div className='mt-1 font-mono text-xs'>{namingPattern}</div>
              <div className='mt-2'>
                {namingCheck.state === 'valid' ? (
                  <Badge variant='outline'>All current keys pass</Badge>
                ) : (
                  <Badge variant='destructive'>Fix naming before release</Badge>
                )}
              </div>
            </div>
            {selectedFlag && (
              <div className='px-4 py-3'>
                <div className='text-muted-foreground'>Selected flag</div>
                <div className='mt-1 font-medium'>{selectedFlag.label}</div>
                <p className='text-muted-foreground mt-2'>{selectedFlag.rollout}</p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  <Badge variant='secondary'>{selectedFlag.stage}</Badge>
                  <Badge variant='outline'>{sourceLabels[selectedFlag.source]}</Badge>
                </div>
              </div>
            )}
            <div className='px-4 py-3'>
              <div className='text-muted-foreground'>Next storage step</div>
              <p className='mt-1'>
                Admin-only writes now go through a guarded server action. They only reach Convex
                after a real template owner adds their own Convex project and Clerk organization
                setup.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
