import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from './fixtures/organization.fixture.json';
import { PlatformOrganizationDetails } from './PlatformOrganizationDetails';

vi.mock('../../../main/GatewayServices', () => ({
  useHasAwxService: () => false,
}));

describe('PlatformOrganizationDetails', () => {
  const server = setupServer(
    http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization))
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders organization detail fields from gateway data', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/details']}>
        <Routes>
          <Route
            path="/access/organizations/:id/details"
            element={<PlatformOrganizationDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
      expect(screen.getByText('Test organization description')).toBeInTheDocument();
    });
  });
});
