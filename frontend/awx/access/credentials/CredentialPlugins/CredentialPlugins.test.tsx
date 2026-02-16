/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialPlugins } from './CredentialPlugins';

const mockCredentialOptions = {
  actions: {
    GET: {
      credential_type__kind: { choices: [['external', 'External']] },
    },
  },
};

const mockCredentialsResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.options(awxAPI`/credentials/`, () => HttpResponse.json(mockCredentialOptions)),
  http.get(
    ({ request }) =>
      request.url.includes('/credentials/') && !request.url.includes('/credential_types/'),
    () => HttpResponse.json(mockCredentialsResponse)
  ),
  http.options(awxAPI`/credential_types/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) => request.url.includes('credential_types'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialPlugins', () => {
  it('should render Secret Management System page with form', async () => {
    const handleSubmit = vi.fn();
    const handleTest = vi.fn();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <CredentialPlugins
          onCancel={onCancel}
          handleSubmit={handleSubmit}
          handleTest={handleTest}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Management System')).toBeInTheDocument();
    });

    expect(screen.getByText('Select external credential')).toBeInTheDocument();
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('should render with defaultValues when provided', async () => {
    const handleSubmit = vi.fn();
    const handleTest = vi.fn();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <CredentialPlugins
          onCancel={onCancel}
          handleSubmit={handleSubmit}
          handleTest={handleTest}
          defaultValues={{ source_credential: 0 }}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Management System')).toBeInTheDocument();
    });
  });
});
