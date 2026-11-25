import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageAlertToasterProvider } from '../PageAlertToaster';
import { useClipboard } from './useClipboard';

const mockWriteText = vi.fn();

function wrapper({ children }: { children: React.ReactNode }) {
  return <PageAlertToasterProvider>{children}</PageAlertToasterProvider>;
}

describe('useClipboard', () => {
  beforeEach(() => {
    mockWriteText.mockReset();
    mockWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: mockWriteText },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies text and sets copySuccess', async () => {
    const { result } = renderHook(() => useClipboard(), { wrapper });

    act(() => {
      result.current.writeToClipboard('hello');
    });

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('hello');
      expect(result.current.copySuccess).toBe(true);
    });
  });

  it('shows warning when clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useClipboard(), { wrapper });

    act(() => {
      result.current.writeToClipboard('hello');
    });

    await waitFor(() => {
      expect(screen.getByText('Clipboard is not supported in this browser.')).toBeInTheDocument();
    });
  });

  it('shows danger alert when writeText rejects', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('denied'));

    const { result } = renderHook(() => useClipboard(), { wrapper });

    act(() => {
      result.current.writeToClipboard('secret');
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to copy to clipboard')).toBeInTheDocument();
    });
  });
});
