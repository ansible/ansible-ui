import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageActionType, useGetPageUrl, usePageNavigate } from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { CredentialType } from '../../../interfaces/CredentialType';
import { useDeleteCredentialTypes } from './useDeleteCredentialTypes';
import {
  useCredentialTypeRowActions,
  useCredentialTypeToolbarActions,
} from './useCredentialTypeActions';

vi.mock('./useDeleteCredentialTypes');
vi.mock('@ansible/common-ui/crud/useOptions');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  useGetPageUrl: vi.fn(),
  usePageNavigate: vi.fn(),
}));

describe('useCredentialTypeActions', () => {
  const deleteTypes = vi.fn();
  const pageNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteCredentialTypes).mockReturnValue(deleteTypes);
    vi.mocked(useGetPageUrl).mockReturnValue(() => '/credential-types/create');
    vi.mocked(usePageNavigate).mockReturnValue(pageNavigate);
    vi.mocked(useOptions).mockReturnValue({ data: { actions: { POST: {} } } } as never);
  });

  it('returns toolbar actions including create and delete', () => {
    const { result } = renderHook(() => useCredentialTypeToolbarActions(vi.fn()));
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Link,
      label: 'Create credential type',
    });
    const deleteAction = result.current[2];
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      deleteAction.onClick([]);
    }
    expect(deleteTypes).toHaveBeenCalled();
  });

  it('disables create when POST is not allowed', () => {
    vi.mocked(useOptions).mockReturnValue({ data: { actions: {} } } as never);
    const { result } = renderHook(() => useCredentialTypeToolbarActions(vi.fn()));
    expect(result.current[0].isDisabled).toMatch(/permission/i);
  });

  it('returns row actions with edit and delete handlers', () => {
    const type = {
      id: 1,
      name: 'Custom',
      managed: false,
      summary_fields: { user_capabilities: { edit: true, delete: true } },
    } as CredentialType;
    const { result } = renderHook(() => useCredentialTypeRowActions(vi.fn()));
    const editAction = result.current[0];
    const deleteAction = result.current[2];
    if ('onClick' in editAction && typeof editAction.onClick === 'function') {
      editAction.onClick(type);
    }
    expect(pageNavigate).toHaveBeenCalled();
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      deleteAction.onClick(type);
    }
    expect(deleteTypes).toHaveBeenCalledWith([type]);
  });

  it('disables edit and delete for managed credential types', () => {
    const managed = { id: 1, name: 'Built-in', managed: true } as CredentialType;
    const { result } = renderHook(() => useCredentialTypeRowActions(vi.fn()));
    const editAction = result.current[0];
    const deleteAction = result.current[2];
    if ('isDisabled' in editAction && typeof editAction.isDisabled === 'function') {
      const editReason = (editAction.isDisabled as (type: CredentialType) => string | undefined)(
        managed
      );
      expect(editReason).toMatch(/read-only/i);
    }
    if ('isDisabled' in deleteAction && typeof deleteAction.isDisabled === 'function') {
      const deleteReason = (
        deleteAction.isDisabled as (type: CredentialType) => string | undefined
      )(managed);
      expect(deleteReason).toMatch(/read-only/i);
    }
  });
});
