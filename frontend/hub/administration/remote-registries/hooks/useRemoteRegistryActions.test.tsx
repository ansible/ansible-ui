/* eslint-disable i18next/no-literal-string */
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { hubAPI } from '../../../common/api/formatPath';
import { RemoteRegistry } from '../RemoteRegistry';
import { useRemoteRegistryActions } from './useRemoteRegistryActions';

const mockDeleteRemoteRegistries = vi.fn();
const mockAddAlert = vi.fn();
const mockPageNavigate = vi.fn();
const mockRefresh = vi.fn().mockResolvedValue(undefined);

vi.mock('./useDeleteRemoteRegistries', () => ({
  useDeleteRemoteRegistries: () => mockDeleteRemoteRegistries,
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
  };
});

const REGISTRY_UUID = 'dddddddd-eeee-ffff-0000-111111111111';

const mockRegistry: RemoteRegistry = {
  id: '1',
  name: 'redhat-io',
  url: 'https://registry.redhat.io',
  pulp_href: `/api/galaxy/_ui/v1/execution-environments/registries/${REGISTRY_UUID}/`,
  policy: 'immediate',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tls_validation: true,
  client_cert: null,
  ca_cert: null,
  last_sync_task: {
    task_id: '1',
    state: 'completed',
    started_at: '2024-01-01T00:00:00Z',
    finished_at: '2024-01-01T00:01:00Z',
    error: null,
  },
  download_concurrency: null,
  proxy_url: null,
  write_only_fields: [],
  rate_limit: null,
  is_indexable: true,
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

function getAction(actions: ReturnType<typeof useRemoteRegistryActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function clickAction(action: ReturnType<typeof getAction>, item: RemoteRegistry) {
  if (action && 'onClick' in action) {
    (action.onClick as (item: RemoteRegistry) => unknown)(item);
  }
}

describe('useRemoteRegistryActions', () => {
  it('includes sync, index, edit, and delete actions', () => {
    const { result } = renderHook(
      () =>
        useRemoteRegistryActions({
          onRemoteRegistryDeleted: vi.fn(),
          refresh: mockRefresh,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    expect(getAction(result.current, 'Sync remote registry')).toBeDefined();
    expect(getAction(result.current, 'Index execution environments')).toBeDefined();
    expect(getAction(result.current, 'Edit remote registry')).toBeDefined();
    expect(getAction(result.current, 'Delete remote registry')).toBeDefined();
  });

  it('shows success alert after sync', async () => {
    server.use(
      http.post(hubAPI`/_ui/v1/execution-environments/registries/1/sync/`, () =>
        HttpResponse.json({})
      )
    );

    const { result } = renderHook(
      () =>
        useRemoteRegistryActions({
          onRemoteRegistryDeleted: vi.fn(),
          refresh: mockRefresh,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const syncAction = getAction(result.current, 'Sync remote registry');
    act(() => {
      clickAction(syncAction, mockRegistry);
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'info', title: 'Syncing remote registry redhat-io' })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('disables index when registry is not indexable', () => {
    const nonIndexable = { ...mockRegistry, is_indexable: false };
    const { result } = renderHook(
      () => useRemoteRegistryActions({ onRemoteRegistryDeleted: vi.fn() }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const indexAction = getAction(result.current, 'Index execution environments');
    const isDisabled =
      indexAction && 'isDisabled' in indexAction ? indexAction.isDisabled : undefined;
    const result2 =
      typeof isDisabled === 'function'
        ? (isDisabled as (item: RemoteRegistry) => string | undefined)(nonIndexable)
        : isDisabled;
    expect(result2).toBeTruthy();
  });

  it('calls deleteRemoteRegistries on delete click', () => {
    const { result } = renderHook(
      () => useRemoteRegistryActions({ onRemoteRegistryDeleted: vi.fn() }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const deleteAction = getAction(result.current, 'Delete remote registry');
    act(() => {
      clickAction(deleteAction, mockRegistry);
    });

    expect(mockDeleteRemoteRegistries).toHaveBeenCalledWith([mockRegistry]);
  });

  it('navigates to edit and indexes registries', async () => {
    server.use(
      http.post(hubAPI`/_ui/v1/execution-environments/registries/1/index/`, () =>
        HttpResponse.json({})
      )
    );

    const { result } = renderHook(
      () =>
        useRemoteRegistryActions({
          onRemoteRegistryDeleted: vi.fn(),
          refresh: mockRefresh,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const editAction = getAction(result.current, 'Edit remote registry');
    act(() => {
      clickAction(editAction, mockRegistry);
    });
    expect(mockPageNavigate).toHaveBeenCalled();

    const indexAction = getAction(result.current, 'Index execution environments');
    act(() => {
      clickAction(indexAction, mockRegistry);
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Indexing remote registry redhat-io' })
      );
    });
  });

  it('shows danger alert when sync fails', async () => {
    server.use(
      http.post(hubAPI`/_ui/v1/execution-environments/registries/1/sync/`, () =>
        HttpResponse.json({ detail: 'failed' }, { status: 500 })
      )
    );

    const { result } = renderHook(
      () =>
        useRemoteRegistryActions({
          onRemoteRegistryDeleted: vi.fn(),
          refresh: mockRefresh,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const syncAction = getAction(result.current, 'Sync remote registry');
    act(() => {
      clickAction(syncAction, mockRegistry);
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'danger', title: 'Failed to sync remote registry' })
      );
    });
  });

  it('shows danger alert when index fails', async () => {
    server.use(
      http.post(hubAPI`/_ui/v1/execution-environments/registries/1/index/`, () =>
        HttpResponse.json({ detail: 'failed' }, { status: 500 })
      )
    );

    const { result } = renderHook(
      () =>
        useRemoteRegistryActions({
          onRemoteRegistryDeleted: vi.fn(),
          refresh: mockRefresh,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const indexAction = getAction(result.current, 'Index execution environments');
    act(() => {
      clickAction(indexAction, mockRegistry);
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'danger', title: 'Failed to index remote registry' })
      );
    });
  });
});
