import { render, renderHook, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { CollectionVersionSearch } from '../Collection';
import { copyToRepositoryAction, useCopyToRepository } from './useCopyToRepository';
import { HubContext } from '../../common/useHubContext';

const { capturedDialog } = vi.hoisted(() => ({
  capturedDialog: { current: null as React.ReactNode },
}));

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'testnamespace',
    name: 'testcollection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/api/galaxy/v3/collections/testnamespace/testcollection/versions/1.0.0/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: 'Test collection description',
  },
  repository: {
    name: 'staging',
    description: 'Staging repository',
    pulp_id: 'test-pulp-id',
    pulp_last_updated: '2024-01-01T00:00:00Z',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '/api/galaxy/v3/repositories/staging/versions/1/',
    pulp_href: '/api/galaxy/v3/repositories/staging/',
    pulp_labels: {
      pipeline: 'staging',
    },
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

const mockRepositoriesResponse = {
  meta: {
    count: 0,
  },
  data: [],
};

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: () => [
      undefined,
      (dialog: React.ReactNode) => {
        capturedDialog.current = dialog;
      },
    ],
  };
});

vi.mock('@ansible/ansible-ui-framework/PageTable/PageTable', () => ({
  PageTable: ({
    pageItems,
    selectItem,
  }: {
    pageItems?: { name: string }[];
    selectItem?: (item: unknown) => void;
  }) => (
    <div data-testid="hub-copy-to-repository-table">
      {pageItems?.map((item) => (
        <button
          key={item.name}
          data-testid={`select-repo-${item.name}`}
          onClick={() => selectItem?.(item)}
        >
          {item.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../common/HubError', () => ({
  HubError: ({ error }: { error: { message: string } }) => (
    <div data-testid="hub-error">{error.message}</div>
  ),
}));

vi.mock('@patternfly/react-core', async () => {
  const actual = await vi.importActual('@patternfly/react-core');
  return {
    ...actual,
    Modal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalHeader: ({ title }: { title: string }) => <div>{title}</div>,
    ModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {
      collection_auto_sign: false,
      require_upload_signatures: false,
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

vi.mock('../../administration/repositories/hooks/useRepositorySelector', () => ({
  useRepositoryColumns: () => [],
  useRepositoryFilters: () => [],
}));

vi.mock('../../common/useHubView', () => ({
  useHubView: () => ({
    pageItems: [{ name: 'approved-repo', pulp_href: '/api/galaxy/pulp/api/v3/repos/approved/' }],
    itemCount: 1,
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

describe('useCopyToRepository', () => {
  const server = setupServer(
    http.get(
      ({ request }) => {
        return request.url.includes('/v3/plugin/ansible/search/collection-versions/');
      },
      () => {
        return HttpResponse.json(mockRepositoriesResponse);
      }
    ),
    http.get(
      ({ request }) => {
        return request.url.includes('/repositories/ansible/ansible/');
      },
      () => {
        return HttpResponse.json({ results: [] });
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should return a function', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(typeof result.current).toBe('function');
  });

  test('should call refresh callback when hook is invoked', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(() => result.current(mockCollection, 'copy')).not.toThrow();
  });

  test('should handle approve operation', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(() => result.current(mockCollection, 'approve')).not.toThrow();
  });

  test('should handle copy operation', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(() => result.current(mockCollection, 'copy')).not.toThrow();
  });

  test('should handle displayDefaultError parameter', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(() => result.current(mockCollection, 'copy', 'Test error message')).not.toThrow();
  });
});

describe('copyToRepositoryAction', () => {
  const t = ((s: string) => s) as unknown as Parameters<typeof copyToRepositoryAction>[4];

  const mockContext: HubContext = {
    featureFlags: {
      collection_auto_sign: false,
      require_upload_signatures: false,
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  } as unknown as HubContext;

  test('should throw when approving collection not in staging or rejected', async () => {
    const collection: CollectionVersionSearch = {
      ...mockCollection,
      repository: {
        ...mockCollection.repository!,
        pulp_labels: { pipeline: 'published' },
      },
    };

    await expect(copyToRepositoryAction(collection, 'approve', [], mockContext, t)).rejects.toThrow(
      'You can only approve collections in rejected or staging repositories'
    );
  });

  test('should throw when signing service is not found', async () => {
    const context = {
      ...mockContext,
      featureFlags: { collection_auto_sign: true, require_upload_signatures: false },
      settings: { GALAXY_COLLECTION_SIGNING_SERVICE: 'my-signing-service' },
    } as unknown as HubContext;

    const server = setupServer(
      http.get('**/signing-services/', () => {
        return HttpResponse.json({ results: [] });
      })
    );
    server.listen({ onUnhandledRequest: 'bypass' });

    await expect(copyToRepositoryAction(mockCollection, 'approve', [], context, t)).rejects.toThrow(
      'Signing service my-signing-service not found'
    );

    server.close();
  });

  test('should resolve when approving collection in staging with auto-sign disabled', async () => {
    const collection: CollectionVersionSearch = {
      ...mockCollection,
      repository: {
        ...mockCollection.repository!,
        pulp_href:
          '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789012/',
        pulp_labels: { pipeline: 'staging' },
      },
    };

    const context = {
      ...mockContext,
      featureFlags: { collection_auto_sign: false, require_upload_signatures: false },
    } as unknown as HubContext;

    const server = setupServer(
      http.post('**/move_collection_version/', () => {
        return HttpResponse.json({});
      })
    );
    server.listen({ onUnhandledRequest: 'bypass' });

    await expect(
      copyToRepositoryAction(collection, 'approve', [], context, t)
    ).resolves.toBeUndefined();

    server.close();
  });

  test('should include signing_service param when service is found', async () => {
    const collection: CollectionVersionSearch = {
      ...mockCollection,
      repository: {
        ...mockCollection.repository!,
        pulp_href:
          '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789012/',
        pulp_labels: { pipeline: 'staging' },
      },
    };
    const context = {
      ...mockContext,
      featureFlags: { collection_auto_sign: true, require_upload_signatures: false },
      settings: { GALAXY_COLLECTION_SIGNING_SERVICE: 'my-signing-service' },
    } as unknown as HubContext;
    const server = setupServer(
      http.get('**/signing-services/', () =>
        HttpResponse.json({ results: [{ pulp_href: '/pulp/api/v3/signing-services/abc/' }] })
      ),
      http.post('**/move_collection_version/', () => HttpResponse.json({}))
    );
    server.listen({ onUnhandledRequest: 'bypass' });
    await expect(
      copyToRepositoryAction(collection, 'approve', [], context, t)
    ).resolves.toBeUndefined();
    server.close();
  });

  test('should throw for copy when signing service configured but not found', async () => {
    const context = {
      ...mockContext,
      settings: { GALAXY_COLLECTION_SIGNING_SERVICE: 'my-signing-service' },
    } as unknown as HubContext;
    const server = setupServer(
      http.get('**/signing-services/', () => HttpResponse.json({ results: [] }))
    );
    server.listen({ onUnhandledRequest: 'bypass' });
    await expect(copyToRepositoryAction(mockCollection, 'copy', [], context, t)).rejects.toThrow(
      'Signing service my-signing-service not found'
    );
    server.close();
  });

  test('should return early when collection has no repository', async () => {
    const collection: CollectionVersionSearch = {
      ...mockCollection,
      repository: undefined,
    };

    await expect(
      copyToRepositoryAction(collection, 'copy', [], mockContext, t)
    ).resolves.toBeUndefined();
  });
});

describe('CopyToRepositoryModal error handling', () => {
  const collectionWithValidPulpHref: CollectionVersionSearch = {
    ...mockCollection,
    repository: {
      ...mockCollection.repository!,
      pulp_href:
        '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789012/',
      pulp_labels: { pipeline: 'staging' },
    },
  };

  const server = setupServer(
    http.get(
      ({ request }) => request.url.includes('/v3/plugin/ansible/search/collection-versions/'),
      () => HttpResponse.json({ meta: { count: 0 }, data: [] })
    ),
    http.get(
      ({ request }) => request.url.includes('/repositories/ansible/ansible/'),
      () => HttpResponse.json({ results: [] })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    capturedDialog.current = null;
  });

  test('should display error when API call fails with a generic Error', async () => {
    server.use(
      http.post(
        ({ request }) => request.url.includes('/move_collection_version/'),
        () => HttpResponse.error()
      )
    );

    const user = userEvent.setup();
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    act(() => {
      result.current(collectionWithValidPulpHref, 'approve');
    });

    render(capturedDialog.current as React.ReactElement);

    // Select a repository so the Select button is enabled
    await user.click(screen.getByTestId('select-repo-approved-repo'));

    // Click the Select button to trigger copyToRepositories
    await user.click(screen.getByRole('button', { name: 'Select' }));

    await waitFor(() => {
      expect(screen.getByTestId('hub-error')).toHaveTextContent(
        'Failed to copy collection version.'
      );
    });
  });

  test('should display error with details when API returns structured error', async () => {
    server.use(
      http.post(
        ({ request }) => request.url.includes('/move_collection_version/'),
        () => HttpResponse.json({ detail: 'Permission denied' }, { status: 403 })
      )
    );

    const user = userEvent.setup();
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    act(() => {
      result.current(collectionWithValidPulpHref, 'approve');
    });

    render(capturedDialog.current as React.ReactElement);

    await user.click(screen.getByTestId('select-repo-approved-repo'));
    await user.click(screen.getByRole('button', { name: 'Select' }));

    await waitFor(() => {
      expect(screen.getByTestId('hub-error')).toBeInTheDocument();
    });
  });
});
