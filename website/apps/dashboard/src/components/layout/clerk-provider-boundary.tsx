'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

export function ClerkProviderBoundary({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: 'var(--primary)',
          colorPrimaryForeground: 'var(--primary-foreground)',
          colorDanger: 'var(--destructive)',
          colorBackground: 'var(--card)',
          colorForeground: 'var(--foreground)',
          colorMuted: 'var(--muted)',
          colorMutedForeground: 'var(--muted-foreground)',
          colorInput: 'var(--input)',
          colorInputForeground: 'var(--foreground)',
          colorRing: 'var(--ring)',
          fontFamily: 'var(--font-sans)'
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}
