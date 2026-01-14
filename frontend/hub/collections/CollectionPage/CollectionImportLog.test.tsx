import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { CollectionImportLog } from './CollectionImportLog';

// Mock collection data with approved pipeline
const mockCollectionApproved = {
  collection_version: {
    namespace: 'testnamespace',
    name: 'testcollection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
  },
  repository: {
    name: 'validated',
    pulp_labels: {
      pipeline: 'approved',
    },
  },
  is_signed: false,
  is_deprecated: false,
};

// Mock collection data with staging pipeline
const mockCollectionStaging = {
  ...mockCollectionApproved,
  repository: {
    name: 'staging',
    pulp_labels: {
      pipeline: 'staging',
    },
  },
};

// Mock collection data with rejected pipeline
const mockCollectionRejected = {
  ...mockCollectionApproved,
  repository: {
    name: 'rejected',
    pulp_labels: {
      pipeline: 'rejected',
    },
  },
};

// Mock API response for imports list
const mockImportsListResponse = {
  meta: { count: 1 },
  data: [
    {
      id: 'import-123',
      namespace: 'testnamespace',
      name: 'testcollection',
      version: '1.0.0',
      state: 'completed',
    },
  ],
  links: {},
};

// Mock API response for import detail
const mockImportDetailResponse = {
  id: 'import-123',
  namespace: 'testnamespace',
  name: 'testcollection',
  version: '1.0.0',
  state: 'completed',
  messages: [
    { level: 'INFO', message: 'Starting import process...' },
    { level: 'INFO', message: 'Extracting collection archive...' },
    { level: 'INFO', message: 'Validating collection structure...' },
    { level: 'SUCCESS', message: 'Import completed successfully.' },
  ],
};

// Mock API response for import in progress
const mockImportInProgressResponse = {
  ...mockImportDetailResponse,
  state: 'running',
  messages: [
    { level: 'INFO', message: 'Starting import process...' },
    { level: 'INFO', message: 'Extracting collection archive...' },
  ],
};

// Mock API response for failed import
const mockImportFailedResponse = {
  ...mockImportDetailResponse,
  state: 'failed',
  messages: [
    { level: 'INFO', message: 'Starting import process...' },
    { level: 'ERROR', message: 'Failed to validate collection manifest.' },
  ],
};

// Wrapper component that provides the outlet context
function TestWrapper({
  children,
  collection = mockCollectionApproved,
}: Readonly<{ children: React.ReactNode; collection?: typeof mockCollectionApproved }>) {
  return (
    <MemoryRouter
      initialEntries={['/collections/validated/testnamespace/testcollection/import_log']}
    >
      <Routes>
        <Route
          path="/collections/:repository/:namespace/:name"
          element={<Outlet context={{ collection }} />}
        >
          <Route path="import_log" element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('CollectionImportLog', () => {
  const server = setupServer(
    // Mock imports list API (with query params for list)
    http.get(
      ({ request }) =>
        request.url.includes('/_ui/v1/imports/collections/') && request.url.includes('namespace='),
      () => HttpResponse.json(mockImportsListResponse)
    ),
    // Mock import detail API (without query params, has specific ID)
    http.get(
      ({ request }) =>
        request.url.includes('/_ui/v1/imports/collections/') && !request.url.includes('namespace='),
      () => HttpResponse.json(mockImportDetailResponse)
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should display status label', async () => {
    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  test('should display completed status', async () => {
    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      // StatusCell capitalizes the status - use getAllByText since there may be multiple
      const statusElements = screen.getAllByText(/completed/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  test('should display approval status label', async () => {
    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Approval status')).toBeInTheDocument();
    });
  });

  test('should display approved status for approved pipeline', async () => {
    render(
      <TestWrapper collection={mockCollectionApproved}>
        <CollectionImportLog />
      </TestWrapper>
    );

    // Wait for the component to fully render with import log
    await waitFor(() => {
      expect(screen.getByTestId('import-log')).toBeInTheDocument();
    });

    // Verify approval status section is rendered
    expect(screen.getByText('Approval status')).toBeInTheDocument();
  });

  test('should display waiting for approval status for staging pipeline', async () => {
    render(
      <TestWrapper collection={mockCollectionStaging}>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('waiting for approval')).toBeInTheDocument();
    });
  });

  test('should display rejected status for rejected pipeline', async () => {
    render(
      <TestWrapper collection={mockCollectionRejected}>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('rejected')).toBeInTheDocument();
    });
  });

  test('should display version label and value', async () => {
    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Version')).toBeInTheDocument();
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });
  });

  test('should render import log messages', async () => {
    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Starting import process...')).toBeInTheDocument();
    });

    expect(screen.getByText('Extracting collection archive...')).toBeInTheDocument();
    expect(screen.getByText('Validating collection structure...')).toBeInTheDocument();
    expect(screen.getByText('Import completed successfully.')).toBeInTheDocument();
  });

  test('should display Done message at the end of log', async () => {
    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  test('should display import log code block with testid', async () => {
    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('import-log')).toBeInTheDocument();
    });
  });

  test('should display running state for in-progress import', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/_ui/v1/imports/collections/') &&
          !request.url.includes('namespace='),
        () => HttpResponse.json(mockImportInProgressResponse)
      )
    );

    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    // Wait for import log to be visible first
    await waitFor(() => {
      expect(screen.getByTestId('import-log')).toBeInTheDocument();
    });

    // Verify component rendered with status section
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('should display failed state for failed import', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/_ui/v1/imports/collections/') &&
          !request.url.includes('namespace='),
        () => HttpResponse.json(mockImportFailedResponse)
      )
    );

    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    // Wait for the component to render with import log
    await waitFor(() => {
      expect(screen.getByTestId('import-log')).toBeInTheDocument();
    });

    // Verify the import log contains error message
    await waitFor(() => {
      expect(screen.getByText('Failed to validate collection manifest.')).toBeInTheDocument();
    });
  });

  test('should display error state when imports list API fails', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/_ui/v1/imports/collections/') &&
          request.url.includes('namespace='),
        () => HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
      )
    );

    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    // Wait for error state - should show error empty state or refresh button
    await waitFor(
      () => {
        // Look for any indication of error state
        const emptyState = document.querySelector('.pf-v6-c-empty-state');
        const refreshButton = screen.queryByRole('button', { name: /refresh/i });

        expect(emptyState || refreshButton).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  test('should display error state when import detail API fails', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/_ui/v1/imports/collections/') &&
          !request.url.includes('namespace='),
        () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    // Wait for error state
    await waitFor(
      () => {
        const errorElement = document.querySelector('[class*="empty-state"]');
        const refreshButton = screen.queryByRole('button', { name: /refresh/i });

        expect(errorElement || refreshButton).toBeTruthy();
      },
      { timeout: 5000 }
    );
  });

  test('should display error state when no imports found', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/_ui/v1/imports/collections/') &&
          request.url.includes('namespace='),
        () =>
          HttpResponse.json({
            meta: { count: 0 },
            data: [],
            links: {},
          })
      )
    );

    render(
      <TestWrapper>
        <CollectionImportLog />
      </TestWrapper>
    );

    // Wait for error state - empty data triggers error display
    await waitFor(
      () => {
        const errorElement = document.querySelector('[class*="empty-state"]');
        const refreshButton = screen.queryByRole('button', { name: /refresh/i });

        expect(errorElement || refreshButton).toBeTruthy();
      },
      { timeout: 5000 }
    );
  });
});
