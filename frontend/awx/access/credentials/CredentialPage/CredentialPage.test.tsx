import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CredentialPage } from './CredentialPage';

const baseCredential = {
  id: 1,
  type: 'credential',
  url: '/api/v2/credentials/1/',
  name: 'Test Credential',
  description: '',
  organization: null,
  credential_type: 1,
  managed: false,
  inputs: {},
  summary_fields: {
    credential_type: { id: 1, name: 'Machine', description: '' },
    user_capabilities: { edit: true, delete: true, copy: true, use: true },
  },
  created: '2022-12-09T15:26:49.544132Z',
  modified: '2022-12-09T15:26:49.544146Z',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/credentials/1/'),
    () => HttpResponse.json(baseCredential)
  ),
  http.get(
    ({ request }) => request.url.includes('/credential_types/'),
    () => HttpResponse.json({ count: 0, results: [] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderCredentialPage(credential = baseCredential) {
  server.use(
    http.get(
      ({ request }) => request.url.includes('/credentials/1/'),
      () => HttpResponse.json(credential)
    )
  );
  return render(
    <MemoryRouter initialEntries={['/credentials/1/details']}>
      <Routes>
        <Route path="/credentials/:id/details" element={<CredentialPage />} />
        <Route path="/credentials/:id" element={<CredentialPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CredentialPage', () => {
  it(
    'should load credential, display name, and show edit/delete in actions dropdown',
    { timeout: 15000 },
    async () => {
      renderCredentialPage();

      await waitFor(
        () => {
          expect(screen.getByTestId('actions-dropdown')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      await userEvent.click(screen.getByTestId('actions-dropdown'));

      await waitFor(() => {
        expect(screen.getByTestId('edit-credential')).toBeInTheDocument();
        expect(screen.getByTestId('delete-credential')).toBeInTheDocument();
      });
    }
  );
});
