/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { describe, expect, it } from 'vitest';
import { useClearCache } from './useInvalidateCache';

function ClearAllComponent() {
  const { clearAllCache } = useClearCache();
  return (
    <div>
      <button onClick={clearAllCache}>Clear Cache</button>
    </div>
  );
}

function ClearByKeyComponent({ cacheKey }: { cacheKey: string }) {
  const { clearCacheByKey } = useClearCache();
  return (
    <div>
      <button onClick={() => clearCacheByKey(cacheKey)}>Clear Cache By Key</button>
    </div>
  );
}

describe('useClearCache', () => {
  it('should clear all cache when button is clicked', async () => {
    const user = userEvent.setup();
    const mockCache = new Map();
    mockCache.set('key1', 'value1');
    mockCache.set('key2', 'value2');
    expect(mockCache.size).toBe(2);

    render(
      <SWRConfig value={{ provider: () => mockCache }}>
        <ClearAllComponent />
      </SWRConfig>
    );

    await user.click(screen.getByRole('button', { name: 'Clear Cache' }));

    await waitFor(() => {
      expect(mockCache.size).toBe(0);
    });
  });

  it('should clear cache by key when button is clicked', async () => {
    const user = userEvent.setup();
    const mockCache = new Map();
    mockCache.set('key1', 'value1');
    mockCache.set('key2', 'value2');
    mockCache.set('key3?query=string', 'value3');

    render(
      <SWRConfig value={{ provider: () => mockCache }}>
        <ClearByKeyComponent cacheKey={'key3'} />
      </SWRConfig>
    );

    await user.click(screen.getByRole('button', { name: 'Clear Cache By Key' }));

    await waitFor(() => {
      expect(mockCache.size).toBe(2);
      expect(mockCache.has('key1')).toBe(true);
      expect(mockCache.has('key2')).toBe(true);
      expect(mockCache.has('key3?query=string')).toBe(false);
    });
  });
});
