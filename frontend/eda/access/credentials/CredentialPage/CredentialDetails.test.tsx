/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { CredentialDetails } from './CredentialDetails';

const mockCredential = {
  id: 1,
  name: 'Test Credential',
  description: 'A test credential',
  credential_type: { id: 1, name: 'Machine', kind: 'cloud' },
  organization: { id: 1, name: 'Default' },
  inputs: {
    username: 'admin',
    password: '$encrypted$',
    host: 'example.com',
  },
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-02T00:00:00Z',
  created_by: { id: 1, username: 'admin' },
  modified_by: { id: 1, username: 'admin' },
};

const mockCredentialInputSources = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const server = setupServer(
  http.get(edaAPI`/eda-credentials/1/`, () => HttpResponse.json(mockCredential)),
  http.get('*/credential-input-sources/*', () => HttpResponse.json(mockCredentialInputSources))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderCredentialDetails(credentialId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/credentials/${credentialId}/details`]}>
      <Routes>
        <Route path="/credentials/:id/details" element={<CredentialDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CredentialDetails', () => {
  it('should render credential name', async () => {
    renderCredentialDetails();

    await waitFor(() => {
      expect(screen.getByText('Test Credential')).toBeInTheDocument();
    });
  });

  it('should render credential description', async () => {
    renderCredentialDetails();

    await waitFor(() => {
      expect(screen.getByText('A test credential')).toBeInTheDocument();
    });
  });

  it('should render credential type', async () => {
    renderCredentialDetails();

    await waitFor(() => {
      expect(screen.getByText('Machine')).toBeInTheDocument();
    });
  });

  it('should render organization as a link', async () => {
    renderCredentialDetails();

    await waitFor(() => {
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  it('should display Encrypted for encrypted fields', async () => {
    renderCredentialDetails();

    await waitFor(() => {
      expect(screen.getByText('Encrypted')).toBeInTheDocument();
    });
  });

  it('should render input field values', async () => {
    renderCredentialDetails();

    await waitFor(() => {
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });
  });
});
