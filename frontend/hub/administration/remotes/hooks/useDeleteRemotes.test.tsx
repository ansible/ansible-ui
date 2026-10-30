/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HubRemote } from '../Remotes';
import { useDeleteRemotes } from './useDeleteRemotes';

let capturedConfig: {
  title?: string;
  actionFn?: (remote: HubRemote, signal: AbortSignal) => Promise<unknown>;
} = {};

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedConfig) => {
    capturedConfig = config;
  },
}));

vi.mock('@ansible/common-ui/useInvalidateCache/useInvalidateCache', () => ({
  useClearCache: () => ({ clearCacheByKey: vi.fn() }),
}));

vi.mock('./useRemoteColumns', () => ({
  useRemoteColumns: () => [],
}));

vi.mock('../../../common/api/hub-api-utils', async () => {
  const actual = await vi.importActual('../../../common/api/hub-api-utils');
  return {
    ...actual,
    hubAPIDelete: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
  };
});

import { hubAPIDelete } from '../../../common/api/hub-api-utils';

const REMOTE_UUID = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';

const mockRemote: HubRemote = {
  name: 'community',
  pulp_href: `/pulp/api/v3/remotes/ansible/collection/${REMOTE_UUID}/`,
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

describe('useDeleteRemotes', () => {
  beforeEach(() => {
    capturedConfig = {};
    vi.mocked(hubAPIDelete).mockClear();
  });

  it('opens bulk confirmation when deleting remotes', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteRemotes(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockRemote]);
    });

    expect(capturedConfig.title).toBe('Permanently delete remotes');
  });

  it('deletes remote via actionFn', async () => {
    const { result } = renderHook(() => useDeleteRemotes(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockRemote]);
    });

    await act(async () => {
      await capturedConfig.actionFn?.(mockRemote, new AbortController().signal);
    });

    expect(hubAPIDelete).toHaveBeenCalled();
  });
});
