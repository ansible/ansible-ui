import { ReactNode } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

let testSwrCache = new Map();

/** Reset the shared SWR cache at the start of each test case. */
export function resetTestSwrCache() {
  testSwrCache = new Map();
}

export const swrTestConfig: SWRConfiguration = {
  provider: () => testSwrCache,
  dedupingInterval: 0,
  shouldRetryOnError: false,
};

export function SwrTestWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <SWRConfig value={swrTestConfig}>{children}</SWRConfig>;
}
