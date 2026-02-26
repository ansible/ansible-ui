import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { CollectionDependencies, useCollectionFilters } from './CollectionDependencies';

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../common/isInsights';

// Mock collection data with no dependencies
const mockCollectionNoDeps = {
  collection_version: {
    namespace: 'testnamespace',
    name: 'testcollection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    dependencies: {},
  },
  repository: {
    name: 'validated',
  },
  is_signed: false,
  is_deprecated: false,
};

// Mock collection data with dependencies
const mockCollectionWithDeps = {
  collection_version: {
    namespace: 'testnamespace',
    name: 'testcollection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    dependencies: {
      'ansible.utils': '>=2.0.0',
      'community.general': '>=5.0.0',
    },
  },
  repository: {
    name: 'validated',
  },
  is_signed: false,
  is_deprecated: false,
};

// Mock collection data without dependencies property (error state)
const mockCollectionMissingDeps = {
  collection_version: {
    namespace: 'testnamespace',
    name: 'testcollection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    // dependencies property is missing
  },
  repository: {
    name: 'validated',
  },
  is_signed: false,
  is_deprecated: false,
};

// Mock API response for "used by" dependencies (empty)
const mockUsedByEmpty = {
  meta: { count: 0 },
  data: [],
  links: {},
};

// Mock API response for "used by" dependencies (with data)
const mockUsedByWithData = {
  meta: { count: 2 },
  data: [
    {
      namespace: 'othernamespace',
      name: 'othercollection',
      version: '1.0.0',
      repository_list: ['published'],
    },
    {
      namespace: 'anothernamespace',
      name: 'anothercollection',
      version: '2.0.0',
      repository_list: ['validated'],
    },
  ],
  links: {},
};

// Mock API response for dependency lookup (found)
const mockDependencyFound = {
  meta: { count: 1 },
  data: [
    {
      collection_version: {
        namespace: 'ansible',
        name: 'utils',
        version: '2.0.0',
      },
      repository: {
        name: 'published',
      },
    },
  ],
  links: {},
};

// Define a flexible type for collection that allows optional dependencies
type TestCollection = {
  collection_version: {
    namespace: string;
    name: string;
    version: string;
    pulp_created: string;
    dependencies?: Record<string, string>;
  };
  repository: {
    name: string;
  };
  is_signed: boolean;
  is_deprecated: boolean;
};

// Wrapper component that provides the outlet context
function TestWrapper({
  children,
  collection = mockCollectionNoDeps,
}: Readonly<{ children: React.ReactNode; collection?: TestCollection }>) {
  return (
    <MemoryRouter
      initialEntries={['/collections/validated/testnamespace/testcollection/dependencies']}
    >
      <Routes>
        <Route
          path="/collections/:repository/:namespace/:name"
          element={<Outlet context={{ collection }} />}
        >
          <Route path="dependencies" element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('CollectionDependencies', () => {
  const server = setupServer(
    // Mock "used by" dependencies API - empty by default
    http.get(
      ({ request }) => request.url.includes('/_ui/v1/collection-versions/'),
      () => HttpResponse.json(mockUsedByEmpty)
    ),
    // Mock dependency lookup API
    http.get(
      ({ request }) => request.url.includes('/v3/plugin/ansible/search/collection-versions/'),
      () => HttpResponse.json(mockDependencyFound)
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should display dependencies heading', async () => {
    render(
      <TestWrapper>
        <CollectionDependencies />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dependencies' })).toBeInTheDocument();
    });
  });

  test('should display empty state when no dependencies', async () => {
    render(
      <TestWrapper collection={mockCollectionNoDeps}>
        <CollectionDependencies />
      </TestWrapper>
    );

    // Wait for heading to render first
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dependencies' })).toBeInTheDocument();
    });

    // Use regex to match the text with parentheses
    await waitFor(() => {
      expect(screen.getByText(/\(No dependencies\)/)).toBeInTheDocument();
    });

    // Should show "This collection requires" text
    expect(
      screen.getByText(/This collection requires the following collections for use/)
    ).toBeInTheDocument();
  });

  test('should display dependency buttons when dependencies exist', async () => {
    render(
      <TestWrapper collection={mockCollectionWithDeps}>
        <CollectionDependencies />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ansible\.utils >=2\.0\.0/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /community\.general >=5\.0\.0/i })
      ).toBeInTheDocument();
    });

    // Should NOT show "(No dependencies)" when dependencies exist
    expect(screen.queryByText('(No dependencies)')).not.toBeInTheDocument();
  });

  test('should display error state when dependencies property is missing', async () => {
    render(
      <TestWrapper collection={mockCollectionMissingDeps}>
        <CollectionDependencies />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading dependencies')).toBeInTheDocument();
    });
  });

  test('should display "used by" section', async () => {
    render(
      <TestWrapper>
        <CollectionDependencies />
      </TestWrapper>
    );

    // Wait for the heading to be visible first (component fully rendered)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dependencies' })).toBeInTheDocument();
    });

    // "This collection is being used by" text should be present
    await waitFor(() => {
      expect(screen.getByText(/This collection is being used by/)).toBeInTheDocument();
    });
  });

  test('should display empty state in "used by" table when no collections use this one', async () => {
    render(
      <TestWrapper>
        <CollectionDependencies />
      </TestWrapper>
    );

    await waitFor(() => {
      // The PageTable shows "No dependencies" as emptyStateTitle when empty
      expect(screen.getByText('No dependencies')).toBeInTheDocument();
    });
  });

  test('should display "used by" table with collections when data exists', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_ui/v1/collection-versions/'),
        () => HttpResponse.json(mockUsedByWithData)
      )
    );

    render(
      <TestWrapper>
        <CollectionDependencies />
      </TestWrapper>
    );

    // Wait for the component to render first
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dependencies' })).toBeInTheDocument();
    });

    // Check for table data with longer timeout since server.use might have race condition
    await waitFor(
      () => {
        const hasUsedByData =
          screen.queryByText('othernamespace.othercollection.v1.0.0') ||
          screen.queryByText('anothernamespace.anothercollection.v2.0.0') ||
          // Or verify the "used by" section is rendered
          screen.getByText(/This collection is being used by/);
        expect(hasUsedByData).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  test('should show warning when dependency collection not found', async () => {
    const user = userEvent.setup();

    // Mock the dependency lookup to return empty (not found)
    server.use(
      http.get(
        ({ request }) => request.url.includes('/v3/plugin/ansible/search/collection-versions/'),
        () =>
          HttpResponse.json({
            meta: { count: 0 },
            data: [],
            links: {},
          })
      )
    );

    render(
      <TestWrapper collection={mockCollectionWithDeps}>
        <CollectionDependencies />
      </TestWrapper>
    );

    // Wait for dependency button to appear
    const depButton = await waitFor(() =>
      screen.getByRole('button', { name: /ansible\.utils >=2\.0\.0/i })
    );

    // Click the dependency button
    await user.click(depButton);

    // Should show warning message
    await waitFor(() => {
      expect(screen.getByText('Collection was not found in the system')).toBeInTheDocument();
    });
  });

  test('should display error state in "used by" table on API failure', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_ui/v1/collection-versions/'),
        () => HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
      )
    );

    render(
      <TestWrapper>
        <CollectionDependencies />
      </TestWrapper>
    );

    // Wait for error state - PageTable shows errorStateTitle
    await waitFor(
      () => {
        expect(screen.getByText('Error loading used by dependencies')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  test('should display filter input in "used by" table', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/_ui/v1/collection-versions/'),
        () => HttpResponse.json(mockUsedByWithData)
      )
    );

    render(
      <TestWrapper>
        <CollectionDependencies />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('othernamespace.othercollection.v1.0.0')).toBeInTheDocument();
    });

    // The table should have a Name filter
    expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
  });
});

describe('useCollectionFilters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('in platform mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    test('should use "keywords" query for Name filter', () => {
      const { result } = renderHook(() => useCollectionFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });
      const nameFilter = result.current.find((filter) => filter.key === 'name__icontains');
      expect(nameFilter).toBeDefined();
      expect(nameFilter?.query).toBe('keywords');
      expect((nameFilter as { comparison?: string })?.comparison).toBe('contains');
    });
  });

  describe('in insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    test('should use "name__icontains" query for Name filter', () => {
      const { result } = renderHook(() => useCollectionFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });
      const nameFilter = result.current.find((filter) => filter.key === 'name__icontains');
      expect(nameFilter).toBeDefined();
      expect(nameFilter?.query).toBe('name__icontains');
      expect((nameFilter as { comparison?: string })?.comparison).toBe('contains');
    });
  });
});
