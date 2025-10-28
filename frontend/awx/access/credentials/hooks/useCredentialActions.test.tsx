import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useCredentialActions } from './useCredentialActions';
import { useDeleteCredentials } from './useDeleteCredentials';
import { useCopyCredential } from './useCopyCredential';
import { usePageNavigate, PageActionType } from '@ansible/ansible-ui-framework';
import { Credential } from '../../../interfaces/Credential';

vi.mock('./useDeleteCredentials');
vi.mock('./useCopyCredential');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));

describe('useCredentialActions (Row Actions)', () => {
  const mockCredential: Credential = {
    id: 1,
    name: 'Test Credential',
    type: 'credential',
    url: '/api/v2/credentials/1/',
    credential_type: 1,
    organization: 1,
    summary_fields: {
      credential_type: { name: 'Machine', id: 1, description: 'Machine credentials' },
      organization: { name: 'Default', id: 1, description: 'Default org' },
      created_by: { id: 1, username: 'admin' },
      modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
      object_roles: {
        admin_role: { id: 1, name: 'Admin', description: 'Can manage' },
        read_role: { id: 2, name: 'Read', description: 'Can view' },
        use_role: { id: 3, name: 'Use', description: 'Can use' },
      },
      owners: [],
      user_capabilities: { edit: true, delete: true, copy: true, use: true },
    },
    kind: 'ssh',
    credential_type__namespace: '',
    credential_type__kind: 'ssh',
    inputs: {},
    cloud: false,
    managed: false,
    kubernetes: false,
    related: {},
    created: '2025-01-01T00:00:00.000Z',
    modified: '2025-01-01T00:00:00.000Z',
  };

  const mockPageNavigate = vi.fn();
  const mockDeleteCredentials = vi.fn();
  const mockCopyCredential = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(useDeleteCredentials).mockReturnValue(mockDeleteCredentials);
    vi.mocked(useCopyCredential).mockReturnValue(mockCopyCredential);
  });

  test('returns row actions array with edit, duplicate, and delete actions', () => {
    const { result } = renderHook(() => useCredentialActions());

    expect(result.current).toHaveLength(4); // Edit, Duplicate, Separator, Delete
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Button,
      label: 'Edit credential',
      variant: 'primary',
      isPinned: true,
    });
    expect(result.current[1]).toMatchObject({
      type: PageActionType.Button,
      label: 'Duplicate credential',
      isPinned: true,
    });
    expect(result.current[3]).toMatchObject({
      type: PageActionType.Button,
      label: 'Delete credential',
      isDanger: true,
    });
  });

  test('duplicate action triggers copy credential function', () => {
    const { result } = renderHook(() => useCredentialActions());

    const duplicateAction = result.current[1];
    if ('onClick' in duplicateAction && typeof duplicateAction.onClick === 'function') {
      (duplicateAction.onClick as (cred: Credential) => void)(mockCredential);
    }

    expect(mockCopyCredential).toHaveBeenCalledWith(mockCredential);
  });

  test('delete action triggers delete credentials function with credential array', () => {
    const { result } = renderHook(() => useCredentialActions());

    const deleteAction = result.current[3];
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      (deleteAction.onClick as (cred: Credential) => void)(mockCredential);
    }

    expect(mockDeleteCredentials).toHaveBeenCalledWith([mockCredential]);
  });

  test('edit action is disabled when user lacks edit permission', () => {
    const credentialWithoutEditPermission = {
      ...mockCredential,
      summary_fields: {
        ...mockCredential.summary_fields,
        user_capabilities: { edit: false, delete: true, copy: true, use: true },
      },
    };

    const { result } = renderHook(() => useCredentialActions());

    const editAction = result.current[0];
    expect('isDisabled' in editAction).toBe(true);

    if ('isDisabled' in editAction && typeof editAction.isDisabled === 'function') {
      const disabledReason = (editAction.isDisabled as (cred: Credential) => string | undefined)(
        credentialWithoutEditPermission
      );
      expect(disabledReason).toBeTruthy();
    }
  });

  test('passes onDeleted callback to delete credentials hook', () => {
    const onDeleted = vi.fn();
    renderHook(() => useCredentialActions({ onDeleted }));

    expect(useDeleteCredentials).toHaveBeenCalledWith(onDeleted);
  });

  test('passes onCredentialCopied callback to copy credential hook', () => {
    const onDeleted = vi.fn();
    const onCredentialCopied = vi.fn();
    renderHook(() => useCredentialActions({ onDeleted, onCredentialCopied }));

    expect(useCopyCredential).toHaveBeenCalledWith(onCredentialCopied);
  });

  test('all row actions require single selection', () => {
    const { result } = renderHook(() => useCredentialActions());

    const buttonActions = result.current.filter((action) => 'selection' in action);
    buttonActions.forEach((action) => {
      if ('selection' in action) {
        expect(action.selection).toBe(1); // PageActionSelection.Single = 1
      }
    });
  });
});
