/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { OrganizationDetails } from './OrganizationDetails';

const mockOrganization = {
  id: 1,
  name: 'Default Organization',
  description: 'The default org',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-02-15T12:00:00Z',
};

const server = setupServer(
  http.get(edaAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderOrganizationDetails() {
  return render(
    <MemoryRouter initialEntries={['/organizations/1/details']}>
      <Routes>
        <Route path="/organizations/:id/details" element={<OrganizationDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OrganizationDetails', () => {
  it('should render organization name and description', async () => {
    renderOrganizationDetails();

    await waitFor(() => {
      expect(screen.getByText('Default Organization')).toBeInTheDocument();
    });
    expect(screen.getByText('The default org')).toBeInTheDocument();
  });

  it('should render all detail labels', async () => {
    renderOrganizationDetails();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render loading page when organization is not yet loaded', () => {
    server.use(
      http.get(edaAPI`/organizations/99/`, async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockOrganization);
      })
    );

    render(
      <MemoryRouter initialEntries={['/organizations/99/details']}>
        <Routes>
          <Route path="/organizations/:id/details" element={<OrganizationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Default Organization')).not.toBeInTheDocument();
  });

  it('should handle organization with empty description', async () => {
    server.use(
      http.get(edaAPI`/organizations/1/`, () =>
        HttpResponse.json({ ...mockOrganization, description: '' })
      )
    );

    renderOrganizationDetails();

    await waitFor(() => {
      expect(screen.getByText('Default Organization')).toBeInTheDocument();
    });
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
