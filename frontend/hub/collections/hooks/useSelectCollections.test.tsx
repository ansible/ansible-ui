/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch } from '../../administration/collection-approvals/Approval';
import { CollectionMultiSelectDialog } from './useSelectCollections';

const mockCollections: CollectionVersionSearch[] = [
  {
    repository: {
      pulp_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/098ee4df/',
      pulp_id: '098ee4df',
      pulp_last_updated: '2023-05-17T14:19:45.572339Z',
      pulp_labels: { pipeline: 'approved' },
      latest_version_href:
        '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/098ee4df/versions/36/',
      name: 'published',
      description: 'Certified content repository',
      content_count: 1,
      gpgkey: '',
    },
    collection_version: {
      pulp_href: '/api/galaxy/pulp/api/v3/content/ansible/collection_versions/1/',
      namespace: 'ansible',
      name: 'test_collection1',
      version: '1.0.0',
      requires_ansible: '>=2.9',
      require_ansible: '>=2.9',
      pulp_created: '2023-08-03T20:40:19.739612Z',
      contents: [],
      dependencies: {},
      description: 'Test collection',
      tags: [],
    },
    repository_version: 'latest',
    namespace_metadata: {
      pulp_href: '/api/galaxy/pulp/api/v3/content/ansible/namespaces/1/',
      name: 'ansible',
      company: '',
      description: '',
      avatar_url: '',
    },
    is_highest: true,
    is_deprecated: false,
    is_signed: true,
  },
];

describe('CollectionMultiSelectDialog', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders dialog with title and description', async () => {
    server.use(
      http.get('*/plugin/ansible/search/collection-versions/*', () => {
        return HttpResponse.json({ meta: { count: 1 }, links: {}, data: mockCollections });
      })
    );

    render(
      <MemoryRouter>
        <CollectionMultiSelectDialog
          title="Select featured collections content"
          description="Please select content below."
          onSelect={vi.fn()}
          defaultSelection={mockCollections}
          maxSelections={12}
          allowZeroSelections
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Select featured collections content')).toBeInTheDocument();
    });

    expect(screen.getByText('Please select content below.')).toBeInTheDocument();
  });
});
