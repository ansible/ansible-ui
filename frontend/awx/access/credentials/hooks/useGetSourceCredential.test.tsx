import { renderHook } from '@testing-library/react';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { Credential } from '../../../interfaces/Credential';
import { useGetSourceCredential } from './useGetSourceCredential';

vi.mock('@ansible/common-ui/crud/useGet', () => ({ useGetItem: vi.fn() }));

const mockUseGetItem = vi.mocked(useGetItem);

describe('useGetSourceCredential', () => {
  beforeEach(() => {
    mockUseGetItem.mockReset();
  });

  it('returns the credential loaded for a source ID', () => {
    const credential = { id: 2, name: 'Vault credential', kind: 'vault' } as Credential;
    mockUseGetItem.mockReturnValue({ data: credential } as never);

    const { result } = renderHook(() => useGetSourceCredential(2));

    expect(mockUseGetItem).toHaveBeenCalledWith(awxAPI`/credentials/`, 2);
    expect(result.current).toBe(credential);
  });

  it('accepts a missing source ID and returns no credential', () => {
    mockUseGetItem.mockReturnValue({ data: undefined } as never);

    const { result } = renderHook(() => useGetSourceCredential(undefined));

    expect(mockUseGetItem).toHaveBeenCalledWith(awxAPI`/credentials/`, undefined);
    expect(result.current).toBeUndefined();
  });
});
