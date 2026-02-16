import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import {
  InventoryHostGroupsAddModal,
  InventoryHostGroupsAddModalProps,
} from './InventoryHostGroupsModal';

const groupsFixture = {
  count: 4,
  next: null,
  previous: null,
  results: [
    {
      id: 433,
      type: 'group',
      name: 'Related to group 1',
      created: '2024-01-24T19:32:20.026680Z',
      modified: '2024-01-24T19:32:20.026717Z',
      inventory: 12141,
      variables: '---',
      summary_fields: {
        inventory: { id: 12141, name: 'test inventory', kind: '' },
        created_by: { id: 3, username: 'dev' },
        modified_by: { id: 3, username: 'dev' },
        user_capabilities: { edit: true, delete: true, copy: true },
        groups: { results: [], count: 0 },
      },
      related: { children: { count: 0, results: [] }, hosts: { count: 0, results: [] } },
    },
    {
      id: 431,
      type: 'group',
      name: 'Test group 2',
      created: '2024-01-24T19:31:51.120495Z',
      modified: '2024-01-24T19:31:51.120517Z',
      inventory: 12141,
      variables: '---',
      summary_fields: {
        inventory: { id: 12141, name: 'test inventory', kind: '' },
        created_by: { id: 3, username: 'dev' },
        modified_by: { id: 3, username: 'dev' },
        user_capabilities: { edit: true, delete: true, copy: true },
        groups: { results: [], count: 0 },
      },
      related: { children: { count: 0, results: [] }, hosts: { count: 0, results: [] } },
    },
  ],
};

const emptyGroupsFixture = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const groupsOptionsFixture = {
  actions: { GET: {}, POST: {} },
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/inventories/') && request.url.includes('/groups'),
    () => HttpResponse.json(groupsOptionsFixture)
  ),
  http.options(awxAPI`/groups/`, () => HttpResponse.json(groupsOptionsFixture)),
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/') &&
      request.url.includes('/groups/') &&
      request.url.includes('not__hosts'),
    () => HttpResponse.json(groupsFixture)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const defaultProps: InventoryHostGroupsAddModalProps = {
  onAdd: vi.fn(),
  inventoryId: '1',
  hostId: '1',
};

function renderModal(props = defaultProps) {
  return render(
    <MemoryRouter initialEntries={['/inventories/inventory/1/hosts/1/groups']}>
      <InventoryHostGroupsAddModal {...props} />
    </MemoryRouter>
  );
}

describe('InventoryHostGroupsModal', () => {
  it('should render modal with groups list when API returns groups', async () => {
    renderModal();

    await waitFor(() => {
      expect(screen.getByText('Related to group 1')).toBeInTheDocument();
      expect(screen.getByText('Test group 2')).toBeInTheDocument();
    });
  });

  it('should display empty state when API returns no groups', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/inventories/') &&
          request.url.includes('/groups/') &&
          request.url.includes('not__hosts'),
        () => HttpResponse.json(emptyGroupsFixture)
      )
    );

    renderModal();

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('No items') || content.includes('No groups'))
      ).toBeInTheDocument();
    });
  });

  it('should display error state when groups API fails', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/inventories/') &&
          request.url.includes('/groups/') &&
          request.url.includes('not__hosts'),
        () => HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    );

    renderModal();

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveTextContent(/error/i);
    });
  });

  it('should render as accessible dialog', async () => {
    renderModal();

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
