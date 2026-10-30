/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HubRemote } from '../Remotes';
import { useRemoteActions } from './useRemoteActions';

const mockDeleteRemotes = vi.fn();
const mockPageNavigate = vi.fn();

vi.mock('./useDeleteRemotes', () => ({
  useDeleteRemotes: () => mockDeleteRemotes,
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('@ansible/ansible-ui-framework/utils/download-file', () => ({
  downloadTextFile: vi.fn(),
}));

import { downloadTextFile } from '@ansible/ansible-ui-framework/utils/download-file';

const baseRemote: HubRemote = {
  name: 'community',
  pulp_href: '/pulp/api/v3/remotes/ansible/collection/1/',
  url: 'https://galaxy.ansible.com/',
  pulp_created: '2024-01-01T00:00:00Z',
  client_cert: null,
  ca_cert: null,
  download_concurrency: null,
  proxy_url: null,
  rate_limit: null,
  requirements_file: null,
  signed_only: false,
  tls_validation: true,
  sync_dependencies: false,
  sync_highest_versions: null,
};

function getAction(actions: ReturnType<typeof useRemoteActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function clickAction(action: ReturnType<typeof getAction>, item: HubRemote) {
  if (action && 'onClick' in action) {
    (action.onClick as (item: HubRemote) => unknown)(item);
  }
}

describe('useRemoteActions', () => {
  it('returns edit and delete actions', () => {
    const { result } = renderHook(() => useRemoteActions({ onRemotesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(getAction(result.current, 'Edit remote')).toBeDefined();
    expect(getAction(result.current, 'Delete remote')).toBeDefined();
  });

  it('navigates to edit remote on click', () => {
    const { result } = renderHook(() => useRemoteActions({ onRemotesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const editAction = getAction(result.current, 'Edit remote');
    act(() => {
      clickAction(editAction, baseRemote);
    });

    expect(mockPageNavigate).toHaveBeenCalled();
  });

  it('hides download actions when optional fields are empty', () => {
    const { result } = renderHook(() => useRemoteActions({ onRemotesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const reqAction = getAction(result.current, 'Download requirement file');
    expect(reqAction && 'isHidden' in reqAction && reqAction.isHidden?.(baseRemote)).toBe(true);
  });

  it('downloads requirement file when present', () => {
    const remoteWithReq = { ...baseRemote, requirements_file: 'collections:\n  - name: demo' };
    const { result } = renderHook(() => useRemoteActions({ onRemotesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const reqAction = getAction(result.current, 'Download requirement file');
    expect(reqAction && 'isHidden' in reqAction && reqAction.isHidden?.(remoteWithReq)).toBe(false);

    act(() => {
      clickAction(reqAction, remoteWithReq);
    });

    expect(downloadTextFile).toHaveBeenCalledWith(
      'requirement',
      remoteWithReq.requirements_file,
      'yaml'
    );
  });

  it('downloads client certificate when present', () => {
    const remoteWithCert = { ...baseRemote, client_cert: 'client-cert-contents' };
    const { result } = renderHook(() => useRemoteActions({ onRemotesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const certAction = getAction(result.current, 'Download client certificate');
    act(() => {
      clickAction(certAction, remoteWithCert);
    });

    expect(downloadTextFile).toHaveBeenCalledWith('client_cert', remoteWithCert.client_cert ?? '');
  });

  it('downloads CA certificate when present', () => {
    const remoteWithCaCert = { ...baseRemote, ca_cert: 'ca-cert-contents' };
    const { result } = renderHook(() => useRemoteActions({ onRemotesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const caCertAction = getAction(result.current, 'Download CA certificate');
    act(() => {
      clickAction(caCertAction, remoteWithCaCert);
    });

    expect(downloadTextFile).toHaveBeenCalledWith('ca_cert', remoteWithCaCert.ca_cert ?? '');
  });

  it('calls deleteRemotes when delete is clicked', () => {
    mockDeleteRemotes.mockClear();
    const { result } = renderHook(() => useRemoteActions({ onRemotesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const deleteAction = getAction(result.current, 'Delete remote');
    act(() => {
      clickAction(deleteAction, baseRemote);
    });

    expect(mockDeleteRemotes).toHaveBeenCalledWith([baseRemote]);
  });
});
