import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PlatformActiveUserProvider, usePlatformActiveUser } from './PlatformActiveUserProvider';

const mockUseSWR = vi.fn();

vi.mock('swr', () => ({
  default: (...args: unknown[]): object => mockUseSWR(...args) as object,
}));

function ActiveUserReadout() {
  const { activePlatformUser, refreshActivePlatformUser } = usePlatformActiveUser();
  return (
    <>
      <div data-testid="active-user">{activePlatformUser?.username ?? 'none'}</div>
      <button type="button" onClick={() => refreshActivePlatformUser?.()}>
        Refresh
      </button>
    </>
  );
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

  test('keeps the current user while a refresh is loading and clears when results are empty', async () => {
    const mutate = vi.fn();
    let swrValue: {
      data?: { results: { id: number; username: string }[] };
      error?: Error;
      isLoading: boolean;
      mutate: ReturnType<typeof vi.fn>;
    } = {
      data: { results: [{ id: 1, username: 'gateway-user' }] },
      error: undefined,
      isLoading: false,
      mutate,
    };
    mockUseSWR.mockImplementation(() => swrValue);

    const { rerender } = render(
      <PlatformActiveUserProvider>
        <ActiveUserReadout />
      </PlatformActiveUserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-user')).toHaveTextContent('gateway-user');
    });

    swrValue = {
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate,
    };
    rerender(
      <PlatformActiveUserProvider>
        <ActiveUserReadout />
      </PlatformActiveUserProvider>
    );

    expect(screen.getByTestId('active-user')).toHaveTextContent('gateway-user');

    swrValue = {
      data: { results: [] },
      error: undefined,
      isLoading: false,
      mutate,
    };
    rerender(
      <PlatformActiveUserProvider>
        <ActiveUserReadout />
      </PlatformActiveUserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-user')).toHaveTextContent('none');
    });
  });

  test('calls mutate when refreshActivePlatformUser is invoked', async () => {
    const mutate = vi.fn();
    mockUseSWR.mockReturnValue({
      data: { results: [{ id: 1, username: 'gateway-user' }] },
      error: undefined,
      isLoading: false,
      mutate,
    });

    const user = userEvent.setup();
    render(
      <PlatformActiveUserProvider>
        <ActiveUserReadout />
      </PlatformActiveUserProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(mutate).toHaveBeenCalledWith(undefined);
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
