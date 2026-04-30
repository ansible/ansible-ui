import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('swr', async () => {
  const actual = await vi.importActual<typeof import('swr')>('swr');
  return {
    ...actual,
    mutate: vi.fn(),
  };
});

import { mutate } from 'swr';
import { PageRefreshIcon } from './PageRefreshIcon';

describe('PageRefreshIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mutate).mockResolvedValue(undefined);
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0);
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should render the refresh button', () => {
    render(<PageRefreshIcon />);
    expect(screen.getByTestId('refresh')).toBeInTheDocument();
  });

  test('should call mutate with a string-key filter function when clicked', async () => {
    const user = userEvent.setup();
    render(<PageRefreshIcon />);

    await user.click(screen.getByTestId('refresh'));

    expect(mutate).toHaveBeenCalledWith(expect.any(Function));
    const filterFn = vi.mocked(mutate).mock.calls[0][0] as (key: unknown) => boolean;
    expect(filterFn('some-string')).toBe(true);
    expect(filterFn(42)).toBe(false);
    expect(filterFn(null)).toBe(false);
  });

  test('should run the stop animation loop on mount and cancel when rotation crosses 360°', () => {
    let stopCallback: FrameRequestCallback | undefined;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      stopCallback = cb;
      return 1;
    });

    render(<PageRefreshIcon />);

    // First call initializes the start timestamp
    const t0 = performance.now();
    stopCallback?.(t0);
    // Second call with elapsed > 360 * 3ms crosses the full rotation boundary
    stopCallback?.(t0 + 1081);

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });

  test('should run the rotate animation loop while refreshing', async () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });

    // Keep mutate pending so refreshing stays true while we capture the rotate callback
    let resolveMutate!: () => void;
    vi.mocked(mutate).mockReturnValue(
      new Promise<undefined>((resolve) => {
        resolveMutate = () => resolve(undefined);
      })
    );

    render(<PageRefreshIcon />);
    const mountCallbackCount = callbacks.length;

    // Click without awaiting so the pending promise keeps refreshing=true
    await act(() => {
      screen.getByTestId('refresh').click();
      return Promise.resolve();
    });

    expect(callbacks.length).toBeGreaterThan(mountCallbackCount);

    const rotateCallback = callbacks.at(-1) ?? (() => void 0);
    const now = performance.now();
    act(() => {
      rotateCallback(now); // first call: start = undefined → start = now
    });
    act(() => {
      rotateCallback(now + 16); // second call: exercises rotation update
    });

    await act(() => {
      resolveMutate();
      return Promise.resolve();
    });
    expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
  });

  test('should cancel animation frame on unmount', () => {
    const { unmount } = render(<PageRefreshIcon />);
    unmount();
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });
});
