/* eslint-disable i18next/no-literal-string */
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { InventoryHostPage } from './InventoryHostPage';

const mockNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@ansible/ansible-ui-framework')>()),
  usePageNavigate: () => mockNavigate,
}));

// Capture the onDelete callback passed to useHostsActions so we can invoke it directly,
// covering the pageNavigate lines (32-34) in InventoryHostPage without a full delete UI flow.
let capturedOnDelete: ((host: unknown) => void) | undefined;

vi.mock('../../hosts/hooks/useHostsActions', () => ({
  useHostsActions: vi.fn().mockImplementation((onDelete: (host: unknown) => void) => {
    capturedOnDelete = onDelete;
    return [];
  }),
}));

const mockHost = {
  id: 42,
  name: 'test-host',
  type: 'host',
  inventory: 1,
  enabled: true,
  variables: '---',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {},
};

describe('InventoryHostPage — post-delete navigation', () => {
  const server = setupServer(
    http.get(awxAPI`/inventories/1/`, () =>
      HttpResponse.json({ id: 1, name: 'Test Inventory', type: 'inventory' })
    ),
    http.get(
      ({ request }) => request.url.includes('/hosts/') && request.url.includes('42'),
      () => HttpResponse.json(mockHost)
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    mockNavigate.mockClear();
  });
  afterAll(() => server.close());

  test('should navigate to inventory hosts list when onDelete callback fires', async () => {
    capturedOnDelete = undefined;

    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/hosts/42/details']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/hosts/:host_id/*"
            element={<InventoryHostPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(capturedOnDelete).toBeDefined();
    });

    capturedOnDelete!({} as never);

    expect(mockNavigate).toHaveBeenCalledWith(AwxRoute.InventoryHosts, {
      params: { inventory_type: 'inventory', id: '1' },
    });
  });
});
