import { afterEach, describe, expect, it, vi } from 'vitest';
import { poll } from './poll';

describe('poll', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the response when check passes on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue({ status: 'ready' });
    const check = vi.fn().mockReturnValue(true);

    await expect(poll(fn, check, 10, 3)).resolves.toEqual({ status: 'ready' });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenCalledWith({ status: 'ready' });
  });

  it('should retry until check passes', async () => {
    vi.useFakeTimers();
    const fn = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'ready' });
    const check = vi.fn((response: { status: string }) => response.status === 'ready');

    const resultPromise = poll(fn, check, 100, 5);
    await vi.runAllTimersAsync();
    await expect(resultPromise).resolves.toEqual({ status: 'ready' });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw when max attempts are exhausted', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockResolvedValue({ status: 'pending' });
    const check = vi.fn().mockReturnValue(false);

    const resultPromise = poll(fn, check, 50, 2);
    const assertion = expect(resultPromise).rejects.toThrow(
      'Failed to get expected response after 2 attempts'
    );
    await vi.runAllTimersAsync();
    await assertion;
  });
});
