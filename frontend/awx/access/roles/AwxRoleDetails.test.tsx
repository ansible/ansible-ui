import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import mockBuiltInRole from '@ansible/cypress/fixtures/awxBuiltInRoleDefinition.json';
import mockCustomRole from '@ansible/cypress/fixtures/awxCustomRoleDefinition.json';
import { AwxRoleDetails } from './AwxRoleDetails';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/role_definitions/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockBuiltInRole)
  ),
  http.get(
    ({ request }) => request.url.includes('/role_definitions/') && request.url.includes('/33/'),
    () => HttpResponse.json(mockCustomRole)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxRoleDetails', () => {
  it('should display role details for built-in roles', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/1']}>
        <Routes>
          <Route path="/roles/:id" element={<AwxRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockBuiltInRole.name)).toBeInTheDocument();
    });
    expect(screen.getByText(mockBuiltInRole.description)).toBeInTheDocument();
    expect(screen.getByTestId('awx.credential')).toBeInTheDocument();
    expect(screen.getByTestId('permissions-description-list')).toBeInTheDocument();
    expect(screen.getByTestId('awx.change_credential')).toBeInTheDocument();
    expect(screen.getByTestId('awx.delete_credential')).toBeInTheDocument();
    expect(screen.getByTestId('awx.use_credential')).toBeInTheDocument();
  });

  it('should display role details for custom roles', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/33']}>
        <Routes>
          <Route path="/roles/:id" element={<AwxRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockCustomRole.name)).toBeInTheDocument();
    });
    expect(screen.getByText(mockCustomRole.description)).toBeInTheDocument();
    expect(screen.getByTestId('awx.inventory')).toBeInTheDocument();
    expect(screen.getByTestId('awx.view_inventory')).toBeInTheDocument();
  });
});
