import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { Credential } from '../../../interfaces/Credential';
import { useCopyCredential } from './useCopyCredential';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageAlertToaster: vi.fn(),
}));
vi.mock('@ansible/common-ui/crud/usePostRequest');

describe('useCopyCredential', () => {
  const addAlert = vi.fn();
  const replaceAlert = vi.fn();
  const postRequest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageAlertToaster).mockReturnValue({ addAlert, replaceAlert } as never);
    vi.mocked(usePostRequest).mockReturnValue(postRequest);
  });

  it('shows success alert when copy succeeds', async () => {
    postRequest.mockResolvedValue({});
    const onComplete = vi.fn();
    const { result } = renderHook(() => useCopyCredential(onComplete));
    result.current({ id: 1, name: 'Machine' } as Credential);
    await waitFor(() => {
      expect(addAlert).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
    });
    expect(onComplete).toHaveBeenCalled();
  });

  it('shows danger alert when copy fails', async () => {
    postRequest.mockRejectedValue(new Error('failed'));
    const { result } = renderHook(() => useCopyCredential());
    result.current({ id: 1, name: 'Machine' } as Credential);
    await waitFor(() => {
      expect(replaceAlert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ variant: 'danger' })
      );
    });
  });
});
