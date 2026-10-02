/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { CredentialDetailFields } from './CredentialDetailFields';
import { EdaCredential } from '../../../interfaces/EdaCredential';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialDetailFields', () => {
  it('should render nothing when credential has no inputs', () => {
    const credential = { id: 1, name: 'Test' } as unknown as EdaCredential;
    const { container } = render(
      <MemoryRouter>
        <CredentialDetailFields credential={credential} />
      </MemoryRouter>
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render text field values', async () => {
    const credential = {
      id: 1,
      name: 'Test',
      inputs: {
        username: 'myuser',
        host: 'server.example.com',
      },
    } as unknown as EdaCredential;

    render(
      <MemoryRouter>
        <CredentialDetailFields credential={credential} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('myuser')).toBeInTheDocument();
      expect(screen.getByText('server.example.com')).toBeInTheDocument();
    });
  });

  it('should display Encrypted for encrypted fields', async () => {
    const credential = {
      id: 1,
      name: 'Test',
      inputs: {
        password: '$encrypted$',
      },
    } as unknown as EdaCredential;

    render(
      <MemoryRouter>
        <CredentialDetailFields credential={credential} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Encrypted')).toBeInTheDocument();
    });
  });

  it('should render enabled options for boolean true values', async () => {
    const credential = {
      id: 1,
      name: 'Test',
      inputs: {
        username: 'admin',
        authorize: true,
        become_method: false,
      },
    } as unknown as EdaCredential;

    render(
      <MemoryRouter>
        <CredentialDetailFields credential={credential} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Authorize')).toBeInTheDocument();
    });
  });

  it('should render external credential field with input sources', async () => {
    const credential = {
      id: 1,
      name: 'Test',
      inputs: {
        password: 'some-value',
      },
    } as unknown as EdaCredential;

    const inputSources = {
      password: {
        input_field_name: 'password',
        source_credential: 5,
        metadata: { key: 'secret-path' },
      },
    };

    server.use(
      http.get(edaAPI`/eda-credentials/5/`, () =>
        HttpResponse.json({
          id: 5,
          name: 'HashiCorp Vault',
          credential_type: { kind: 'external', name: 'Vault' },
        })
      )
    );

    render(
      <MemoryRouter>
        <CredentialDetailFields credential={credential} inputSources={inputSources} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('HashiCorp Vault')).toBeInTheDocument();
    });
  });
});
