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

  it('renders content from a documentation group entry', () => {
    render(
      <CollectionDocumentationTabContent
        content={mockContent}
        collection={mockCollection}
        groups={[{ name: 'vars', contents: [mockContent] }]}
        renderJSON={false}
      />
    );

    expect(screen.getByText('Short description')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('expands and collapses nested parameters and shows defaults', async () => {
    const user = userEvent.setup();
    const content = {
      ...mockContent,
      doc_strings: {
        ...mockContent.doc_strings,
        doc: {
          short_description: 'Short description',
          description: 'Not an array',
          notes: 'Not an array',
          options: [
            {
              name: 'mode',
              description: ['First line', 'Second line'],
              type: 'str',
              required: true,
              elements: 'dict',
              default: 'yes',
              choices: ['yes', 'no', 1],
              suboptions: [
                {
                  name: 'nested',
                  description: 'Nested option',
                  type: 'bool',
                },
              ],
            },
          ],
        },
        examples: '- name: first\n  ping:\n\n- name: second\n  debug:\n',
        return: [
          {
            name: 'result',
            type: 'list',
            returned: 'always',
            description: 'The result',
            sample: ['alpha', { raw: 'beta' }],
          },
          {
            name: 'plain',
            type: 'str',
            returned: 'success',
            description: 'Plain sample',
            sample: 'just-text',
          },
        ],
      },
    } as unknown as IContents;

    render(
      <CollectionDocumentationTabContent
        content={content}
        collection={mockCollection}
        groups={[]}
        renderJSON={false}
      />
    );

    expect(screen.getByRole('link', { name: 'Synopsis' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Synopsis' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Notes' })).not.toBeInTheDocument();
    expect(screen.getByText('First line')).toBeInTheDocument();
    expect(screen.getByText('Second line')).toBeInTheDocument();
    expect(screen.getByText(/Required/)).toBeInTheDocument();
    expect(screen.getByText(/dict/)).toBeInTheDocument();
    expect(screen.getByTitle('Default')).toHaveTextContent('yes');
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('false')).toBeInTheDocument();
    expect(screen.getByText(/ping/)).toBeInTheDocument();
    expect(screen.getByText(/debug/)).toBeInTheDocument();
    expect(screen.getByText(/alpha/)).toBeInTheDocument();
    expect(screen.getByText(/just-text/)).toBeInTheDocument();
    expect(screen.getAllByText('Sample:').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /mode/ }));
    await waitFor(() => expect(screen.queryByText('nested')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /mode/ }));
    expect(screen.getByText('nested')).toBeInTheDocument();
  });

  it('shows plugin configuration and the parent path while filtering', async () => {
    const user = userEvent.setup();
    const content = {
      ...mockContent,
      content_type: 'lookup',
      doc_strings: {
        doc: {
          options: [
            {
              name: 'parent',
              description: 'Parent option',
              type: 'dict',
              suboptions: [
                {
                  name: 'child',
                  description: 'Child option',
                  type: 'str',
                  ini: [{ section: 'defaults', key: 'host' }],
                  env: [{ name: 'ANSIBLE_HOST' }],
                  vars: [{ name: 'ansible_host' }],
                },
              ],
            },
          ],
        },
      },
    } as unknown as IContents;

    render(
      <CollectionDocumentationTabContent
        content={content}
        collection={
          {
            ...mockCollection,
            repository: undefined,
            collection_version: undefined,
          } as unknown as CollectionVersionSearch
        }
        groups={[]}
        renderJSON={false}
      />
    );

    expect(screen.getByRole('heading', { name: 'Configuration' })).toBeInTheDocument();
    expect(screen.getByText('ini entries:')).toBeInTheDocument();
    expect(screen.getByText(/VALUE/)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search for parameter name'), 'child');
    expect(await screen.findByText('/parent')).toBeInTheDocument();
    expect(screen.queryByText('parent')).not.toBeInTheDocument();
  });

  it('shows the original JSON when parameter rendering throws', async () => {
    const exploding = {
      content_name: 'boom',
      content_type: 'module',
      doc_strings: {
        doc: {
          options: [
            {
              get name(): string {
                throw new Error('bad option');
              },
            },
          ],
        },
      },
    } as unknown as IContents;

    render(
      <CollectionDocumentationTabContent
        content={exploding}
        collection={mockCollection}
        groups={[]}
        renderJSON={false}
      />
    );

    expect(
      await screen.findByText(/Error occurred when rendering documentation/)
    ).toBeInTheDocument();
    expect(screen.getByText('Unexpected error when deserializing doc data.')).toBeInTheDocument();
  });

  it('shows a deserialization message for circular documentation JSON', () => {
    const circular = {
      content_name: 'loop',
      content_type: 'module',
      doc_strings: { doc: {} },
    } as unknown as IContents & { self?: unknown };
    circular.self = circular;

    render(
      <CollectionDocumentationTabContent
        content={circular}
        collection={mockCollection}
        groups={[]}
        renderJSON={true}
      />
    );

    expect(screen.getByText('Unexpected error when deserializing doc data.')).toBeInTheDocument();
  });

  it('renders an empty document when content is missing', () => {
    render(
      <CollectionDocumentationTabContent
        content={undefined}
        collection={mockCollection}
        groups={[]}
        renderJSON={false}
      />
    );

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Parameters' })).not.toBeInTheDocument();
  });
});
