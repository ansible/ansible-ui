import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from './useAwxBulkConfirmation';

const useBulkConfirmationMock = vi.fn((_adapter: unknown) => vi.fn());

vi.mock('@ansible/ansible-ui-framework/PageDialogs/BulkConfirmationDialog', () => ({
  useBulkConfirmation: (adapter: unknown) => useBulkConfirmationMock(adapter),
}));

describe('useAwxBulkConfirmation', () => {
  it('wires awx error adapter into bulk confirmation dialog', () => {
    renderHook(() => useAwxBulkConfirmation<{ id: number }>());
    expect(useBulkConfirmationMock).toHaveBeenCalledWith(expect.any(Function));
  });
});
