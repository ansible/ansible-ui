import { render } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { describe, expect, it, vi } from 'vitest';
import { useInvalidateCacheOnUnmount } from './useInvalidateCache';

const mutate = vi.fn().mockResolvedValue(undefined);

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    useSWRConfig: () => ({
      cache: new Map(),
      mutate,
      fallback: {},
    }),
  };
});

function UnmountTestComponent() {
  useInvalidateCacheOnUnmount();
  return null;
}

describe('useInvalidateCacheOnUnmount', () => {
  it('should revalidate cache when the component unmounts', () => {
    mutate.mockClear();
    const { unmount } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <UnmountTestComponent />
      </SWRConfig>
    );

    unmount();
    expect(mutate).toHaveBeenCalled();
  });
});
