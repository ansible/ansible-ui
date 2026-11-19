import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivationAddUsers } from './EdaRulebookActivationAddUsers';

const mockActivation = {
  id: 5,
  name: 'Test Activation',
  description: 'A test rulebook activation',
  organization_id: 1,
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
      name: 'EDA Activation Admin',
      description: 'Has all permissions to a single activation',
      content_type: 'eda.activation',
      managed: true,
    },
  ],
};

let capturedRolesUrl: string | undefined;

const server = setupServer(
  http.get(edaAPI`/activations/5/`, () => HttpResponse.json(mockActivation)),
  http.get('*/api/gateway/v1/role_definitions/', ({ request }) => {
    capturedRolesUrl = request.url;
    return HttpResponse.json(mockRolesResponse);
  }),
  http.get('*/api/gateway/v1/users/', () => HttpResponse.json(mockUsersResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  capturedRolesUrl = undefined;
});
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/rulebook-activations/5/user-access/add']}>
      <Routes>
        <Route
          path="/rulebook-activations/:id/user-access/add"
          element={<EdaRulebookActivationAddUsers />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaRulebookActivationAddUsers', () => {
  it('should render the assign users page title and breadcrumbs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });

    expect(screen.getByText('RulebookActivations')).toBeInTheDocument();
    expect(screen.getByText('Test Activation')).toBeInTheDocument();
    expect(screen.getByText('User Access')).toBeInTheDocument();
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

  it('should fetch roles filtered by eda.activation content type', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('EDA Activation Admin')).toBeInTheDocument();
    });

    expect(capturedRolesUrl).toBeDefined();
    expect(capturedRolesUrl).toContain('content_type__api_slug=eda.activation');
  }, 15000);

  it('should show a cancel button on the wizard', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Assign users/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });
});
