import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CredentialAddUsers } from './CredentialAddUsers';

const credential = {
  id: 1,
  type: 'credential',
  name: 'Test Credential',
  description: '',
  organization: null,
  credential_type: 1,
  managed: false,
  inputs: {},
  summary_fields: { credential_type: { id: 1, name: 'Machine' }, user_capabilities: {} },
  created: '',
  modified: '',
  url: '/api/v2/credentials/1/',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/credentials/') && request.url.includes('/1/'),
    () => HttpResponse.json(credential)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/users'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialAddUsers', () => {
  it('should render wizard with Select user(s) step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/credentials/1/user-access/add']}>
        <Routes>
          <Route path="/credentials/:id/user-access/add" element={<CredentialAddUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
