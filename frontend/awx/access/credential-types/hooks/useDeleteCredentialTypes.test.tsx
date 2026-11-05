import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { CredentialType } from '../../../interfaces/CredentialType';
import { useDeleteCredentialTypes } from './useDeleteCredentialTypes';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('./useCredentialTypesColumns', () => ({
  useCredentialTypesColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/crud/Data');

const credentialType = (overrides: Partial<CredentialType>): CredentialType =>
  ({
    id: 1,
    name: 'Custom Type',
    managed: false,
    summary_fields: { user_capabilities: { delete: true } },
    ...overrides,
  }) as CredentialType;

describe('useDeleteCredentialTypes', () => {
  const mockBulkAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  it('opens bulk delete confirmation', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteCredentialTypes(onComplete));
    result.current([credentialType({ id: 2, name: 'Z Type' }), credentialType({ name: 'A Type' })]);

    expect(mockBulkAction).toHaveBeenCalledWith(
      expect.objectContaining({
        onComplete,
        isDanger: true,
      })
    );
    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { items: CredentialType[] };
    expect(callArgs.items[0]?.name).toBe('A Type');
  });

  it('warns when managed or permission-blocked types are selected', () => {
    const { result } = renderHook(() => useDeleteCredentialTypes(vi.fn()));
    result.current([
      credentialType({ managed: true }),
      credentialType({
        summary_fields: {
          user_capabilities: { edit: false, delete: false },
        } as CredentialType['summary_fields'],
      }),
    ]);

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { alertPrompts?: string[] };
    expect(callArgs.alertPrompts?.length).toBe(2);
  });
});
