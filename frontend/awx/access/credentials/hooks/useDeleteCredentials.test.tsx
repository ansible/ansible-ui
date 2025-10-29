import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteCredentials } from './useDeleteCredentials';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Credential } from '../../../interfaces/Credential';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');
vi.mock('./useCredentialsColumns', () => ({
  useCredentialsColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

describe('useDeleteCredentials (Bulk Delete)', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  const mockCredentials: Credential[] = [
    {
      id: 1,
      name: 'Credential A',
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
      created: '2025-01-01T00:00:00.000Z',
      modified: '2025-01-01T00:00:00.000Z',
      kind: 'ssh',
      credential_type__namespace: '',
      credential_type__kind: 'ssh',
      inputs: {},
      cloud: false,
      managed: false,
      kubernetes: false,
      related: {},
    },
    {
      id: 2,
      name: 'Credential B',
      type: 'credential',
      url: '/api/v2/credentials/2/',
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
      created: '2025-01-01T00:00:00.000Z',
      modified: '2025-01-01T00:00:00.000Z',
      kind: 'ssh',
      credential_type__namespace: '',
      credential_type__kind: 'ssh',
      inputs: {},
      cloud: false,
      managed: false,
      kubernetes: false,
      related: {},
    },
    {
      id: 3,
      name: 'Credential C',
      type: 'credential',
      url: '/api/v2/credentials/3/',
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
      created: '2025-01-01T00:00:00.000Z',
      modified: '2025-01-01T00:00:00.000Z',
      kind: 'ssh',
      credential_type__namespace: '',
      credential_type__kind: 'ssh',
      inputs: {},
      cloud: false,
      managed: false,
      kubernetes: false,
      related: {},
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('returns delete credentials function', () => {
    const { result } = renderHook(() => useDeleteCredentials());

    expect(typeof result.current).toBe('function');
  });

  test('calls bulk action with correct title for multiple credentials', () => {
    const { result } = renderHook(() => useDeleteCredentials());

    result.current(mockCredentials);

    expect(mockBulkAction).toHaveBeenCalled();
    const callArgs = mockBulkAction.mock.calls[0]?.[0] as {
      title: string;
      confirmText: string;
      actionButtonText: string;
      items: Credential[];
      keyFn: (item: Credential) => number | string;
      isDanger: boolean;
      onComplete?: () => void;
      confirmationColumns: unknown[];
      actionColumns: unknown[];
      actionFn: (item: Credential, signal: AbortSignal) => Promise<void>;
    };
    expect(callArgs?.title).toMatch(/permanently delete credentials/i);
  });

  test('calls bulk action with correct action button text', () => {
    const { result } = renderHook(() => useDeleteCredentials());

    result.current(mockCredentials);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as {
      actionButtonText: string;
    };
    expect(callArgs?.actionButtonText).toMatch(/delete credential/i);
  });

  test('passes credentials sorted by name', () => {
    const unsortedCredentials = [
      { ...mockCredentials[2], name: 'Z Credential' },
      { ...mockCredentials[1], name: 'A Credential' },
      { ...mockCredentials[0], name: 'M Credential' },
    ];

    const { result } = renderHook(() => useDeleteCredentials());

    result.current(unsortedCredentials);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as {
      items: Credential[];
    };
    expect(callArgs?.items[0]?.name).toBe('A Credential');
    expect(callArgs?.items[1]?.name).toBe('M Credential');
    expect(callArgs?.items[2]?.name).toBe('Z Credential');
  });

  test('marks bulk action as dangerous', () => {
    const { result } = renderHook(() => useDeleteCredentials());

    result.current(mockCredentials);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as {
      isDanger: boolean;
    };
    expect(callArgs?.isDanger).toBe(true);
  });

  test('passes onComplete callback to bulk action', () => {
    const { result } = renderHook(() => useDeleteCredentials(mockOnComplete));

    result.current(mockCredentials);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as {
      onComplete?: () => void;
    };
    expect(callArgs?.onComplete).toBe(mockOnComplete);
  });

  test('handles single credential deletion with singular text', () => {
    const singleCredential = [mockCredentials[0]];
    const { result } = renderHook(() => useDeleteCredentials());

    result.current(singleCredential);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as {
      confirmText: string;
    };
    // Should use singular form when count is 1
    expect(callArgs?.confirmText).toMatch(/1 credential(?!s)/);
  });
});
