/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CredentialPlugins } from './CredentialPlugins';

const mockCredentials = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'HashiCorp Vault',
      credential_type: { id: 10, name: 'HashiCorp Vault', kind: 'external' },
    },
  ],
};

const server = setupServer(
  http.get('*/eda-credentials/', () => HttpResponse.json(mockCredentials))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialPlugins', () => {
  const onCancel = vi.fn();
  const handleSubmit = vi.fn();
  const handleTest = vi.fn();

  it('should render the page header', async () => {
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
  });

  it('should render external credential label', async () => {
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
      expect(screen.getByText('External credential')).toBeInTheDocument();
    });
  });

  it('should render Finish button', async () => {
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
      expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
    });
  });

  it('should render Test button', async () => {
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
      expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
    });
  });

  it('should render Cancel button', async () => {
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
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });
});
