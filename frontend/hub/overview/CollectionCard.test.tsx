/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CollectionVersionSearch } from '../administration/collection-approvals/Approval';
import { CollectionCard } from './CollectionCard';

const mockCollection: CollectionVersionSearch = {
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
    pulp_href: '/api/galaxy/pulp/api/v3/content/ansible/collection_versions/26d5c6ff/',
    namespace: 'redhat',
    name: 'redhat_csp_download',
    version: '1.2.2',
    requires_ansible: '>=2.9.10',
    require_ansible: '>=2.9.10',
    pulp_created: '2023-08-03T20:40:19.739612Z',
    contents: [
      { name: 'redhat_csp_download', description: '', content_type: 'role' },
      {
        name: 'redhat_csp_download',
        description: 'Downloads resources from the Red Hat customer portal.',
        content_type: 'module',
      },
    ],
    dependencies: {},
    description: 'Downloads resources from the Red Hat Customer Portal.',
    tags: [
      { name: 'tools' },
      { name: 'application' },
      { name: 'redhat' },
      { name: 'rhel' },
      { name: 'rhn' },
      { name: 'subscription_manager' },
    ],
  },
  repository_version: 'latest',
  namespace_metadata: {
    pulp_href: '/api/galaxy/pulp/api/v3/content/ansible/namespaces/4e07a845/',
    name: 'redhat',
    company: '',
    description: '',
    avatar_url: '',
  },
  is_highest: true,
  is_deprecated: false,
  is_signed: true,
};

describe('CollectionCard', () => {
  it('renders card with expected details', () => {
    render(
      <MemoryRouter>
        <CollectionCard collection={mockCollection} />
      </MemoryRouter>
    );

    // Title
    expect(screen.getByText('redhat_csp_download')).toBeInTheDocument();

    // Description
    expect(
      screen.getByText('Downloads resources from the Red Hat Customer Portal.')
    ).toBeInTheDocument();

    // Namespace
    expect(screen.getByText(/Provided by redhat/)).toBeInTheDocument();

    // Version
    expect(screen.getByText(/v1\.2\.2/)).toBeInTheDocument();

    // Modules count
    expect(screen.getByText('Modules')).toBeInTheDocument();

    // Roles count
    expect(screen.getByText('Roles')).toBeInTheDocument();

    // Signed label
    expect(screen.getByText('Signed')).toBeInTheDocument();
  });

  it('renders card without signed label for unsigned collection', () => {
    const unsignedCollection = {
      ...mockCollection,
      is_signed: false,
    };

    render(
      <MemoryRouter>
        <CollectionCard collection={unsignedCollection} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Signed')).not.toBeInTheDocument();
  });
});
