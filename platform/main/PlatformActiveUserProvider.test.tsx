import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import useSWR from 'swr';
import { PlatformActiveUserProvider, usePlatformActiveUser } from './PlatformActiveUserProvider';

vi.mock('swr', () => ({
  default: vi.fn(),
}));

function Consumer() {
  const { activePlatformUser, refreshActivePlatformUser } = usePlatformActiveUser();
  return (
    <div>
      <span data-testid="username">{activePlatformUser?.username ?? 'none'}</span>
      <button type="button" onClick={() => refreshActivePlatformUser?.()}>
        Refresh
      </button>
    </div>
  );
}

describe('PlatformActiveUserProvider', () => {
  beforeEach(() => {
    vi.mocked(useSWR).mockReturnValue({
      data: { results: [{ id: 1, username: 'admin' }], count: 1 },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    } as ReturnType<typeof useSWR>);
  });

  test('should expose the active platform user from /me/', async () => {
    render(
      <PlatformActiveUserProvider>
        <Consumer />
      </PlatformActiveUserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('admin');
    });
  });

  test('should clear the active user when the request fails', async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: new Error('401'),
      isLoading: false,
      mutate: vi.fn(),
    } as ReturnType<typeof useSWR>);

    render(
      <PlatformActiveUserProvider>
        <Consumer />
      </PlatformActiveUserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('none');
    });
  });
});
