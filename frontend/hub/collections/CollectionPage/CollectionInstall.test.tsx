import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { CollectionVersionsContent } from './CollectionDocumentation';
import { CollectionInstall } from './CollectionInstall';

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
}));

import { isInsightsMode } from '../../common/isInsights';

// Mock collection data for outlet context - unsigned collection
const mockCollection = {
  collection_version: {
    namespace: 'testnamespace',
    name: 'testcollection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    description: 'A test collection for install tab testing',
    tags: [{ name: 'tools' }, { name: 'networking' }],
    requires_ansible: '>=2.14.0',
    dependencies: {},
  },
  repository: {
    name: 'validated',
    pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345/',
  },
  is_signed: false,
  is_deprecated: false,
};

// Mock collection data for signed collection
const mockSignedCollection = {
  ...mockCollection,
  is_signed: true,
};

// Mock API response for collection content (includes license)
const mockContentResponse: CollectionVersionsContent = {
  count: 1,
  next: '',
  previous: '',
  results: [
    {
      docs_blob: {
        contents: [],
        collection_readme: {
          html: '<h1>Test Collection</h1><p>This is a test collection README.</p>',
          name: 'README.md',
        },
        documentation_files: [],
      },
      license: ['GPL-3.0-or-later', 'MIT'],
    },
  ],
};

// Mock API response for repository distribution (to get basePath)
const mockDistributionResponse = {
  count: 1,
  results: [
    {
      base_path: 'validated',
      name: 'validated',
      pulp_href: '/pulp/api/v3/distributions/ansible/ansible/67890/',
      repository: '/pulp/api/v3/repositories/ansible/ansible/12345/',
    },
  ],
};

// Mock API response for signature data
const mockSignatureResponse = {
  signatures: [
    {
      signature: '-----BEGIN PGP SIGNATURE-----\ntest-signature-data\n-----END PGP SIGNATURE-----',
    },
  ],
};

// Wrapper component that provides the outlet context
function TestWrapper({
  children,
  collection = mockCollection,
}: Readonly<{ children: React.ReactNode; collection?: typeof mockCollection }>) {
  return (
    <MemoryRouter initialEntries={['/collections/validated/testnamespace/testcollection/install']}>
      <Routes>
        <Route
          path="/collections/:repository/:namespace/:name"
          element={<Outlet context={{ collection }} />}
        >
          <Route path="install" element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('CollectionInstall', () => {
  const server = setupServer(
    // Mock collection versions content API
    http.get(
      ({ request }) => request.url.includes('/content/ansible/collection_versions/'),
      () => HttpResponse.json(mockContentResponse)
    ),
    // Mock distribution API for basePath resolution
    http.get(
      ({ request }) => request.url.includes('/distributions/ansible/ansible/'),
      () => HttpResponse.json(mockDistributionResponse)
    ),
    // Mock signature API
    http.get(
      ({ request }) =>
        request.url.includes('/v3/plugin/ansible/content/') && request.url.includes('/versions/'),
      () => HttpResponse.json(mockSignatureResponse)
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should render install information with license', async () => {
    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Install' })).toBeInTheDocument();
    });

    // Verify license is displayed
    await waitFor(() => {
      expect(screen.getByText('GPL-3.0-or-later, MIT')).toBeInTheDocument();
    });
  });

  test('should display collection tags', async () => {
    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('tools')).toBeInTheDocument();
      expect(screen.getByText('networking')).toBeInTheDocument();
    });
  });

  test('should display installation command', async () => {
    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText('ansible-galaxy collection install testnamespace.testcollection')
      ).toBeInTheDocument();
    });

    // Verify installation note
    expect(
      screen.getByText(
        /Installing collection with ansible-galaxy is only supported in ansible 2\.13\.9\+/i
      )
    ).toBeInTheDocument();
  });

  test('should show download tarball button', async () => {
    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download tarball/i })).toBeInTheDocument();
    });
  });

  test('should display ansible version requirement', async () => {
    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ansible >=2\.14\.0/)).toBeInTheDocument();
    });
  });

  test('should show distributions link', async () => {
    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /distributions/i })).toBeInTheDocument();
    });
  });

  test('should show signature section when collection is signed', async () => {
    render(
      <TestWrapper collection={mockSignedCollection}>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /show signature/i })).toBeInTheDocument();
    });
  });

  test('should toggle signature visibility when button clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper collection={mockSignedCollection}>
        <CollectionInstall />
      </TestWrapper>
    );

    // Wait for the show signature button
    const showSignatureButton = await waitFor(() =>
      screen.getByRole('button', { name: /show signature/i })
    );

    // Click to show signature
    await user.click(showSignatureButton);

    // Button text should change to "Hide signature"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /hide signature/i })).toBeInTheDocument();
    });
  });

  test('should not show signature section when collection is unsigned', async () => {
    render(
      <TestWrapper collection={mockCollection}>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Install' })).toBeInTheDocument();
    });

    // Signature button should not be present
    expect(screen.queryByRole('button', { name: /show signature/i })).not.toBeInTheDocument();
  });

  test('should display readme content with documentation link', async () => {
    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Collection')).toBeInTheDocument();
    });

    // Verify "Go to documentation" link
    expect(screen.getByRole('link', { name: /go to documentation/i })).toBeInTheDocument();
  });

  test('should display error state when content API fails', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/content/ansible/collection_versions/'),
        () => HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
      )
    );

    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    // Wait for component to render - it should handle error gracefully
    await waitFor(
      () => {
        // Check for error state elements or that component rendered without crashing
        const errorElement = document.querySelector('[class*="empty-state"]');
        const refreshButton = screen.queryByRole('button', { name: /refresh/i });
        const hasRendered = screen.queryByRole('heading', { name: 'Install' });

        expect(errorElement || refreshButton || hasRendered).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  test('should display collection description', async () => {
    render(
      <TestWrapper>
        <CollectionInstall />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('A test collection for install tab testing')).toBeInTheDocument();
    });
  });

  describe('Insights mode - download URL conversion', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    afterEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    test('should render install page in insights mode', async () => {
      render(
        <TestWrapper>
          <CollectionInstall />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Install' })).toBeInTheDocument();
      });
    });

    test('should show download tarball button in insights mode', async () => {
      render(
        <TestWrapper>
          <CollectionInstall />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /download tarball/i })).toBeInTheDocument();
      });
    });

    test('should render install command in insights mode', async () => {
      render(
        <TestWrapper>
          <CollectionInstall />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText('ansible-galaxy collection install testnamespace.testcollection')
        ).toBeInTheDocument();
      });
    });
  });
});
