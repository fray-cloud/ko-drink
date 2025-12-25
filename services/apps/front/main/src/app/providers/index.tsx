import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from '../../domains/common/providers/ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}

