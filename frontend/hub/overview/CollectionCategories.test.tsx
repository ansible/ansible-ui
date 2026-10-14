/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch } from '../collections/Collection';
import { CollectionCategoryCarousel } from './CollectionCategories';

vi.mock('../collections/hooks/useSelectCollections', () => ({
  useSelectCollectionsDialog: () => vi.fn(),
}));

vi.mock('../common/useHubContext', () => ({
  useHubContext: () => ({ user: { is_superuser: false } }),
}));

const mockCollection: CollectionVersionSearch = {
  repository: {
    pulp_href: '/repo/',
    pulp_id: '1',
    pulp_last_updated: '',
    pulp_labels: { pipeline: 'approved' },
    latest_version_href: '',
    name: 'published',
    description: '',
    content_count: 0,
    gpgkey: '',
  },
  collection_version: {
    pulp_href: '/cv/',
    namespace: 'demo',
    name: 'collection',
    version: '1.0.0',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    pulp_created: '',
    contents: [],
    dependencies: {},
    description: '',
    tags: [],
  },
  repository_version: 'latest',
  namespace_metadata: {
    pulp_href: '/ns/',
    name: 'demo',
    company: '',
    description: '',
    avatar_url: '',
  },
  is_highest: true,
  is_deprecated: false,
  is_signed: false,
};

describe('CollectionCategoryCarousel', () => {
  it('renders category title and collection card', () => {
    render(
      <MemoryRouter>
        <CollectionCategoryCarousel
          category="application"
          collections={[mockCollection]}
          searchKey="tags"
          searchValue="application"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Application collections')).toBeInTheDocument();
    expect(screen.getByText('Go to collections')).toBeInTheDocument();
  });
});
