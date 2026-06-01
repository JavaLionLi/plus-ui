import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { appEnv } from '@/utils/env';
import { queryClient } from '@/utils/queryClient';

export async function getInitialState() {
  return {
    name: appEnv.logoTitle
  };
}

export function rootContainer(container: ReactNode) {
  return <QueryClientProvider client={queryClient}>{container}</QueryClientProvider>;
}
