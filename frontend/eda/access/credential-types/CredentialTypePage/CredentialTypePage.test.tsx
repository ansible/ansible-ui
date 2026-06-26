/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CredentialTypePage } from './CredentialTypePage';

const mockCredentialType = {
  id: 10,
  name: 'Source Control',
  description: 'SCM credential type',
  namespace: 'scm',
  kind: 'scm',
  managed: false,
  inputs: {},
  injectors: {},
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

const server = setupServer(
  http.get('*/credential-types/10/', () => HttpResponse.json(mockCredentialType)),
  http.options('*/credential-types/10/', () => HttpResponse.json({ actions: { PATCH: {} } }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderCredentialTypePage() {
  return render(
    <MemoryRouter initialEntries={['/credential-types/10/details']}>
      <Routes>
        <Route path="/credential-types/:id/*" element={<CredentialTypePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CredentialTypePage', () => {
  it('should render page with credential type name in header', async () => {
    renderCredentialTypePage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Source Control', level: 1 })).toBeInTheDocument();
    });
  });

  it('should display breadcrumbs with Credential Types link', async () => {
    renderCredentialTypePage();

    await waitFor(() => {
      expect(screen.getByText('Credential Types')).toBeInTheDocument();
    });
  });

  it('should display Details and Credentials tabs', async () => {
    renderCredentialTypePage();

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
    expect(screen.getByText('Credentials')).toBeInTheDocument();
  });

  it('should display back to Credential Types tab', async () => {
    renderCredentialTypePage();

    await waitFor(() => {
      expect(screen.getByText('Back to Credential Types')).toBeInTheDocument();
    });
  });

  it('should show loading page when data has not loaded', () => {
    server.use(
      http.get('*/credential-types/10/', () => new HttpResponse(null, { status: 200 })),
      http.options('*/credential-types/10/', () => HttpResponse.json({ actions: { PATCH: {} } }))
    );

    renderCredentialTypePage();

    expect(screen.queryByText('Source Control')).not.toBeInTheDocument();
  });
});
