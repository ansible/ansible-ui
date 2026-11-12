/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockExecutionEnvironmentImage } from '../../test/mockExecutionEnvironment';
import { useDeleteImages } from './useDeleteImages';

let capturedBulkActionConfig: {
  title?: string;
  actionFn?: (image: typeof mockExecutionEnvironmentImage, signal: AbortSignal) => Promise<unknown>;
} = {};

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedBulkActionConfig) => {
    capturedBulkActionConfig = config;
  },
}));

vi.mock('../../../common/api/hub-api-utils', () => ({
  hubAPIDelete: vi.fn().mockResolvedValue(undefined),
}));

describe('useDeleteImages', () => {
  it('opens bulk confirmation with delete title', () => {
    const { result } = renderHook(() => useDeleteImages({ id: 'test-ee' }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    result.current([mockExecutionEnvironmentImage]);

    expect(capturedBulkActionConfig.title).toBe('Permanently delete execution environment images');
  });

  it('returns a callback function', () => {
    const { result } = renderHook(() => useDeleteImages({ id: 'test-ee' }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    expect(typeof result.current).toBe('function');
  });

  it('calls hubAPIDelete from bulk actionFn', async () => {
    const { hubAPIDelete } = await import('../../../common/api/hub-api-utils');
    const { result } = renderHook(() => useDeleteImages({ id: 'test-ee' }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    result.current([mockExecutionEnvironmentImage]);
    await capturedBulkActionConfig.actionFn?.(
      mockExecutionEnvironmentImage,
      new AbortController().signal
    );

    expect(hubAPIDelete).toHaveBeenCalled();
  });
});
