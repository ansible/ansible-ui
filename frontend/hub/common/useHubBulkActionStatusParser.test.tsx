/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useHubBulkActionStatusParser } from './useHubBulkActionStatusParser';

describe('useHubBulkActionStatusParser', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('returns null when the response has no background task', () => {
    const { result } = renderHook(() => useHubBulkActionStatusParser(), { wrapper });
    expect(result.current({})).toBeNull();
  });

  it('returns translated status with task page url when backgroundTask is set', () => {
    const { result } = renderHook(() => useHubBulkActionStatusParser(), { wrapper });
    const status = result.current({
      backgroundTask: true,
      route: 'TaskDetails',
      id: 'task-42',
    });

    expect(status?.message).toBe(
      'The progress of this task can be tracked on the Task Management page.'
    );
    expect(status).toEqual(
      expect.objectContaining({
        message: 'The progress of this task can be tracked on the Task Management page.',
      })
    );
  });
});
