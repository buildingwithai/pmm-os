'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { clientClerkAuthEnabled } from '@/lib/auth-bypass';

const ClerkProviderBoundary = dynamic(
  () => import('./clerk-provider-boundary').then((mod) => mod.ClerkProviderBoundary),
  { ssr: false }
);

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        {clientClerkAuthEnabled ? (
          <ClerkProviderBoundary>
            <QueryProvider>
              {children}
              <AnalyticsTracker />
            </QueryProvider>
          </ClerkProviderBoundary>
        ) : (
          <QueryProvider>
            {children}
            <AnalyticsTracker />
          </QueryProvider>
        )}
      </ActiveThemeProvider>
    </>
  );
}
