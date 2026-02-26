import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredentialAddUsers } from './EdaCredentialAddUsers';

const mockCredential = {
  id: 42,
  name: 'Test Credential',
  description: 'A test credential',
  organization_id: 1,
  credential_type_id: 1,
};

const mockUsersResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 101,
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
    },
  ],
};

const mockRolesResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 201,
      name: 'Eda Credential Admin',
      description: 'Has all permissions to a single credential',
      content_type: 'eda.edacredential',
      managed: true,
    },
  ],
};

let capturedRolesUrl: string | undefined;

const server = setupServer(
  http.get(edaAPI`/eda-credentials/42/`, () => HttpResponse.json(mockCredential)),
  http.get('*/api/gateway/v1/role_definitions/', ({ request }) => {
    capturedRolesUrl = request.url;
    return HttpResponse.json(mockRolesResponse);
  }),
  http.get('*/api/gateway/v1/users/', () => HttpResponse.json(mockUsersResponse))
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  capturedRolesUrl = undefined;
});
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/credentials/42/user-access/add-users']}>
      <Routes>
        <Route path="/credentials/:id/user-access/add-users" element={<EdaCredentialAddUsers />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaCredentialAddUsers', () => {
  it('should render the assign users page title, breadcrumbs, and buttons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Credentials')).toBeInTheDocument();
    expect(screen.getByText('Test Credential')).toBeInTheDocument();
    expect(screen.getByText('User Access')).toBeInTheDocument();
  });

  it('should render the wizard buttons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });

    const wizardFooter = screen.getByTestId('wizard-footer');
    expect(within(wizardFooter).getByRole('button', { name: /^Next$/ })).toBeInTheDocument();
    expect(within(wizardFooter).getByRole('button', { name: /^Cancel$/ })).toBeInTheDocument();

    const backButton = within(wizardFooter).getByRole('button', { name: /^Back$/ });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toBeDisabled();
  });

  it('should render the wizard step labels', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText('Select user(s)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Select roles to apply').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
  });

  it('should fetch roles filtered by eda.edacredential content type', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('Eda Credential Admin')).toBeInTheDocument();
    });

    expect(capturedRolesUrl).toBeDefined();
    expect(capturedRolesUrl).toContain('content_type__api_slug=eda.edacredential');

    const wizardFooter = screen.getByTestId('wizard-footer');
    const backButton = within(wizardFooter).getByRole('button', { name: /^Back$/ });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toBeEnabled();
  });
});
