import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CredentialTypes } from './CredentialTypes';

const mockCredentialTypes = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'credential_type',
      name: 'Machine',
      description: '',
      kind: 'ssh',
      namespace: 'ssh',
      managed: true,
      inputs: {},
      injectors: {},
      summary_fields: {
        user_capabilities: { edit: false, delete: false },
      },
    },
    {
      id: 2,
      type: 'credential_type',
      name: 'Custom Type',
      description: 'A custom credential type',
      kind: 'cloud',
      namespace: 'custom',
      managed: false,
      inputs: {},
      injectors: {},
      summary_fields: {
        user_capabilities: { edit: true, delete: true },
      },
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/credential_types/`, () => {
    return HttpResponse.json({
      actions: {},
    });
  }),
  http.get(awxAPI`/credential_types/`, () => {
    return HttpResponse.json(mockCredentialTypes);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialTypes', () => {
  it('should render credential types list', async () => {
    render(
      <MemoryRouter>
        <CredentialTypes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Credential Types')).toBeInTheDocument();
    });
  });

  it('should display credential types in table', async () => {
    render(
      <MemoryRouter>
        <CredentialTypes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Machine')).toBeInTheDocument();
      expect(screen.getByText('Custom Type')).toBeInTheDocument();
    });
  });

  it('should display error state when credential types fail to load', async () => {
    server.use(http.get(awxAPI`/credential_types/`, () => HttpResponse.json({}, { status: 500 })));

    render(
      <MemoryRouter>
        <CredentialTypes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading credential types/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no credential types exist and user can create', async () => {
    server.use(
      http.options(awxAPI`/credential_types/`, () =>
        HttpResponse.json({ actions: { POST: { name: {} }, GET: {} } })
      ),
      http.get(awxAPI`/credential_types/`, () =>
        HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    render(
      <MemoryRouter>
        <CredentialTypes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('There are currently no credential types added.')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText('Please create a credential type by using the button below.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create credential type/i })).toBeInTheDocument();
  });

  it('should display empty state without create button when user lacks permission', async () => {
    server.use(
      http.get(awxAPI`/credential_types/`, () =>
        HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    render(
      <MemoryRouter>
        <CredentialTypes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to create a credential type.')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        'Please contact your organization administrator if there is an issue with your access.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /create credential type/i })).not.toBeInTheDocument();
  });
});
