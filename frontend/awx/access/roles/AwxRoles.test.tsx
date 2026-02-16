import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRoles } from './AwxRoles';

const mockRoleDefinitions = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Credential Admin',
      description: 'Has all permissions to a single credential',
      content_type: 'awx.credential',
      managed: true,
      permissions: ['awx.change_credential', 'awx.delete_credential', 'awx.use_credential'],
    },
    {
      id: 2,
      name: 'Inventory Read',
      description: 'Has view permissions to a single inventory',
      content_type: 'awx.inventory',
      managed: false,
      permissions: ['awx.view_inventory'],
    },
  ],
};

const server = setupServer(
  http.get(awxAPI`/role_definitions/`, () => {
    return HttpResponse.json(mockRoleDefinitions);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxRoles', () => {
  it('should render roles list', async () => {
    render(
      <MemoryRouter>
        <AwxRoles />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Roles')).toBeInTheDocument();
    });
  });

  it('should display roles in table', async () => {
    render(
      <MemoryRouter>
        <AwxRoles />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Credential Admin')).toBeInTheDocument();
      expect(screen.getByText('Inventory Read')).toBeInTheDocument();
    });
  });
});
