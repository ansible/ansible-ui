/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { OrganizationPage } from './OrganizationPage';

const mockOrganization = {
  id: 3,
  name: 'Test Org',
  description: 'A test organization',
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

const server = setupServer(
  http.get('*/organizations/3/', () => HttpResponse.json(mockOrganization))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderOrganizationPage() {
  return render(
    <MemoryRouter initialEntries={['/organizations/3/details']}>
      <Routes>
        <Route path="/organizations/:id/*" element={<OrganizationPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OrganizationPage', () => {
  it('should render organization page with name in header', async () => {
    renderOrganizationPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Org', level: 1 })).toBeInTheDocument();
    });
  });

  it('should display breadcrumbs with Organizations link', async () => {
    renderOrganizationPage();

    await waitFor(() => {
      expect(screen.getByText('Organizations')).toBeInTheDocument();
    });
  });

  it('should display Details tab', async () => {
    renderOrganizationPage();

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('should display back to Organizations tab', async () => {
    renderOrganizationPage();

    await waitFor(() => {
      expect(screen.getByText('Back to Organizations')).toBeInTheDocument();
    });
  });

  it('should show loading state when organization data has not loaded', () => {
    server.use(http.get('*/organizations/3/', () => new HttpResponse(null, { status: 200 })));

    renderOrganizationPage();

    expect(screen.queryByText('Test Org')).not.toBeInTheDocument();
  });

  it('should show error state on API failure', async () => {
    server.use(
      http.get('*/organizations/3/', () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    renderOrganizationPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });
});
