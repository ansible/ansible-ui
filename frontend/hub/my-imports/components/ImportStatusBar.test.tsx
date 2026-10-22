/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { ImportStatusBar } from './ImportStatusBar';

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
    namespace: 'ns',
    name: 'col',
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
    name: 'ns',
    company: '',
    description: '',
    avatar_url: '',
  },
  is_highest: true,
  is_deprecated: false,
  is_signed: false,
};

const mockImport: CollectionImport = {
  created_at: '',
  finished_at: '',
  id: '1',
  name: 'col',
  namespace: 'ns',
  started_at: '',
  state: 'completed',
  updated_at: '',
  version: '1.0.0',
};

describe('ImportStatusBar', () => {
  it('shows version and approval status when collection is provided', () => {
    render(<ImportStatusBar collection={mockCollection} collectionImport={mockImport} />);

    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows placeholder approval status without collection', () => {
    render(
      <ImportStatusBar collectionImport={{ ...mockImport, state: 'failed', version: '2.0.0' }} />
    );

    expect(screen.getByText('2.0.0')).toBeInTheDocument();
    expect(screen.getByText('---')).toBeInTheDocument();
  });
});
