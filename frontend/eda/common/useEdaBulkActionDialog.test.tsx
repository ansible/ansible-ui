import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { edaErrorAdapter } from './edaErrorAdapter';
import { useEdaBulkActionDialog } from './useEdaBulkActionDialog';

const { useBulkActionDialog } = vi.hoisted(() => ({
  useBulkActionDialog: vi.fn(() => 'bulk-dialog'),
}));

vi.mock('@ansible/ansible-ui-framework/PageDialogs/BulkActionDialog', () => ({
  useBulkActionDialog,
}));

describe('useEdaBulkActionDialog', () => {
  it('should pass edaErrorAdapter to useBulkActionDialog', () => {
    const { result } = renderHook(() => useEdaBulkActionDialog());

    expect(useBulkActionDialog).toHaveBeenCalledWith(edaErrorAdapter);
    expect(result.current).toBe('bulk-dialog');
  });
});
