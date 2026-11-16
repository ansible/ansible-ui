import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { InventoryAddUsers } from './InventoryAddUsers';

import {
  awxPageWizardCapture,
  awxPageWizardProgressDialog,
  createGatewayRoleAssignmentPostHandler,
  installAwxBulkActionDialogMock,
} from '../../../common/test/mockAwxPageWizard';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  const { createAwxPageWizardFrameworkMock } = await import(
    '../../../common/test/mockAwxPageWizard'
  );
  return createAwxPageWizardFrameworkMock(actual);
});

const gatewayRoleAssignmentPosts: unknown[] = [];

vi.mock('../../../common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => awxPageWizardProgressDialog,
}));

const mockInventory = {
  id: 1,
  name: 'Test Inventory',
  type: 'inventory',
  kind: '',
  organization: 1,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    user_capabilities: { edit: true, delete: true },
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/inventories/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockInventory)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/users'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  createGatewayRoleAssignmentPostHandler(gatewayRoleAssignmentPosts, 'role_user_assignments')
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  awxPageWizardProgressDialog.mockClear();
  gatewayRoleAssignmentPosts.length = 0;
});
afterAll(() => server.close());

describe('InventoryAddUsers', () => {
  it('validates users step and submits platform role assignments', async () => {
    installAwxBulkActionDialogMock();

    render(
      <MemoryRouter initialEntries={['/inventories/1/user-access/add']}>
        <Routes>
          <Route path="/inventories/:id/user-access/add" element={<InventoryAddUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const usersStep = awxPageWizardCapture.steps.find((step) => step.id === 'users');
    expect(() => {
      if (!usersStep || !('validate' in usersStep) || !usersStep.validate) {
        throw new Error('expected users step');
      }
      void usersStep.validate({}, {});
    }).toThrow(/Select at least one user/);

    if (!awxPageWizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await awxPageWizardCapture.onSubmit({
      users: [{ id: 2, username: 'user2' }],
      platformRoles: [{ id: 3, name: 'Use' }],
    });

    await waitFor(() => {
      expect(gatewayRoleAssignmentPosts).toHaveLength(1);
    });
    expect(gatewayRoleAssignmentPosts[0]).toMatchObject({
      user: 2,
      role_definition: 3,
      content_type: 'awx.inventory',
      object_id: 1,
    });

    expect(awxPageWizardProgressDialog).toHaveBeenCalled();
  });

  it('validates platform roles step', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/user-access/add']}>
        <Routes>
          <Route path="/inventories/:id/user-access/add" element={<InventoryAddUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const rolesStep = awxPageWizardCapture.steps.find((step) => step.id === 'platformRoles');
    expect(() => {
      if (!rolesStep || !('validate' in rolesStep) || !rolesStep.validate) {
        throw new Error('expected roles step');
      }
      void rolesStep.validate({}, {});
    }).toThrow(/Select at least one role/);
  });
});
