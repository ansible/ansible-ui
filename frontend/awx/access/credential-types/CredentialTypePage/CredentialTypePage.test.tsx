import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CredentialTypePage } from './CredentialTypePage';

const mockCredentialType = {
  id: 1,
  type: 'credential_type',
  name: 'Machine',
  description: '',
  kind: 'ssh',
  namespace: 'ssh',
  managed: true,
  inputs: {},
  injectors: {},
  summary_fields: { user_capabilities: { edit: true, delete: true } },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/credential_types/') && request.url.includes('/1'),
    () => HttpResponse.json(mockCredentialType)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialTypePage', () => {
  it('should render page title and Details tab', async () => {
    render(
      <MemoryRouter initialEntries={['/credential-types/1']}>
        <Routes>
          <Route path="/credential-types/:id" element={<CredentialTypePage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Machine');
    });
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
  });
});
