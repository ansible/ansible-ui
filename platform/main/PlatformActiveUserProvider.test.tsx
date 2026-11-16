import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PlatformActiveUserProvider, usePlatformActiveUser } from './PlatformActiveUserProvider';

const mockUseSWR = vi.fn();

vi.mock('swr', () => ({
  default: (...args: unknown[]): object => mockUseSWR(...args) as object,
}));

function ActiveUserReadout() {
  const { activePlatformUser } = usePlatformActiveUser();
  return <div data-testid="active-user">{activePlatformUser?.username ?? 'none'}</div>;
}

describe('PlatformActiveUserProvider', () => {
  test('provides the first gateway user from /me/', async () => {
    const mutate = vi.fn();
    mockUseSWR.mockReturnValue({
      data: { results: [{ id: 1, username: 'gateway-user' }] },
      error: undefined,
      isLoading: false,
      mutate,
    });

    render(
      <PlatformActiveUserProvider>
        <ActiveUserReadout />
      </PlatformActiveUserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-user')).toHaveTextContent('gateway-user');
    });
  });

  test('clears active user when SWR returns an error', async () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('failed'),
      isLoading: false,
      mutate: vi.fn(),
    });

    render(
      <PlatformActiveUserProvider>
        <ActiveUserReadout />
      </PlatformActiveUserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-user')).toHaveTextContent('none');
    });
  });
});
