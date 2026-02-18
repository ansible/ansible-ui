/* eslint-disable i18next/no-literal-string */
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../common/eda-utils';
import { CreateEventStream } from './EventStreamForm';

const mockOrganizations = {
  results: [
    { id: 1, name: 'Default' },
    { id: 2, name: 'Organization 2' },
  ],
};

const mockCredentialTypes = {
  results: [
    {
      id: 1,
      name: 'Basic Event Stream',
      kind: 'basic',
      description: 'Basic Event Stream Credential',
      managed: true,
    },
  ],
};

const mockCredentialType = {
  id: 1,
  name: 'Basic Event Stream',
  kind: 'basic',
  description: 'Basic Event Stream Credential',
  managed: true,
};

const mockCredentials = {
  results: [],
};

const server = setupServer(
  http.get(edaAPI`/organizations/`, () => {
    return HttpResponse.json(mockOrganizations);
  }),
  http.get(edaAPI`/organizations/:id/`, () => {
    return HttpResponse.json({ id: 1, name: 'Default' });
  }),
  http.get(edaAPI`/credential-types/`, ({ request }) => {
    const url = new URL(request.url);
    const namespace = url.searchParams.get('namespace');
    if (namespace === 'event_stream') {
      return HttpResponse.json(mockCredentialTypes);
    }
    return HttpResponse.json({ results: [] });
  }),
  http.get(edaAPI`/credential-types/:id/`, () => {
    return HttpResponse.json(mockCredentialType);
  }),
  http.get(edaAPI`/eda-credentials/`, () => {
    return HttpResponse.json(mockCredentials);
  })
);

describe('EventStreamForm', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the create form with correct required fields', async () => {
    render(
      <MemoryRouter>
        <CreateEventStream />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create event stream/ })).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event stream type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Headers/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Forward events to rulebook activation/)).toBeInTheDocument();

    // Enabled by default
    const toggle = screen.getByRole('switch', { name: /Forward events to rulebook activation/ });
    expect(toggle).toBeChecked();

    expect(screen.getByRole('button', { name: /Create event stream/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
  });

  it('should show and require credential field after selecting Basic Event Stream type', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CreateEventStream />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create event stream/ })).toBeInTheDocument();
    });

    const nameInput = screen.getByRole('textbox', { name: 'Name' });
    await user.click(nameInput);
    await user.type(nameInput, 'test-name');

    const organizationSelect = screen.getByRole('button', { name: 'Organization' });
    await user.click(organizationSelect);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: 'Default' }));

    // Verify credential field is initially hidden
    expect(screen.queryByLabelText(/Credential/)).not.toBeInTheDocument();

    const eventStreamTypeSelect = screen.getByLabelText(/Event stream type/);
    await user.click(eventStreamTypeSelect);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Basic Event Stream/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: /Basic Event Stream/ }));

    // Verify credential field is now visible after selecting event stream type
    await waitFor(
      () => {
        const credentialField = screen.getByLabelText(/Credential/);
        expect(credentialField).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
