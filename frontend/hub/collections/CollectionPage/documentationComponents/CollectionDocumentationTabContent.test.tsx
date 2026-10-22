/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch, IContents } from '../../Collection';
import { CollectionDocumentationTabContent } from './CollectionDocumentationTabContent';

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'testns',
    name: 'testcol',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/cv/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: '',
  },
  repository: {
    name: 'published',
    pulp_href: '/repo/',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
    description: '',
  },
  repository_version: '1',
  is_signed: false,
  is_deprecated: false,
} as CollectionVersionSearch;

const mockContent = {
  content_name: 'hello',
  content_type: 'module',
  readme_file: null,
  readme_html: null,
  doc_strings: {
    doc: {
      short_description: 'Short description',
      description: ['Line one', 'Line two'],
      notes: ['Note one'],
      deprecated: { why: 'Old', alternative: 'Use new module' },
      options: [
        {
          name: 'parent',
          description: ['Parent option'],
          type: 'str',
          suboptions: [
            {
              name: 'child',
              description: 'Child option',
              type: 'bool',
            },
          ],
        },
      ],
    },
    return: { ret: { description: 'return value', type: 'str' } },
    examples: '- hello:\n    name: world',
    metadata: null,
  },
} as unknown as IContents;

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => () => '/doc/path',
    usePageSettings: () => ({}),
  };
});

describe('CollectionDocumentationTabContent', () => {
  it('renders documentation sections and parameter table', async () => {
    render(
      <CollectionDocumentationTabContent
        content={mockContent}
        collection={mockCollection}
        groups={[{ name: 'modules', contents: [mockContent] }]}
        renderJSON={false}
      />
    );

    expect(await screen.findByText('Short description')).toBeInTheDocument();
    expect(screen.getByText('DEPRECATED')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Synopsis' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Parameters' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Examples' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Returns' })).toBeInTheDocument();
  });

  it('filters parameters by search input', async () => {
    const user = userEvent.setup();
    render(
      <CollectionDocumentationTabContent
        content={mockContent}
        collection={mockCollection}
        groups={[]}
        renderJSON={false}
      />
    );

    const filter = await screen.findByPlaceholderText('Search for parameter name');
    await user.type(filter, 'child');

    await waitFor(() => {
      expect(screen.getByText('child')).toBeInTheDocument();
      expect(screen.queryByText('parent')).not.toBeInTheDocument();
    });
  });

  it('renders JSON view when renderJSON is true', () => {
    render(
      <CollectionDocumentationTabContent
        content={mockContent}
        collection={mockCollection}
        groups={[]}
        renderJSON={true}
      />
    );

    expect(screen.getByText(/"content_name": "hello"/)).toBeInTheDocument();
  });
});
