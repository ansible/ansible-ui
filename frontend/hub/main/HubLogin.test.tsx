/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { HubLogin } from './HubLogin';

const server = setupServer(
  http.get('*/_ui/v1/settings/', () => HttpResponse.json({ KEYCLOAK_URL: '' }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('../common/useHubActiveUser', () => ({
  useHubActiveUser: vi.fn(),
}));

import { useHubActiveUser } from '../common/useHubActiveUser';

describe('HubLogin', () => {
  it('renders children when user is authenticated', async () => {
    vi.mocked(useHubActiveUser).mockReturnValue({
      activeHubUser: {
        username: 'admin',
        is_superuser: true,
      } as import('../interfaces/expanded/HubUser').HubUser,
      refreshActiveHubUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HubLogin>
          <div>Hub content</div>
        </HubLogin>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hub content')).toBeInTheDocument();
    });
  });

  it('renders login form when user is not authenticated', async () => {
    vi.mocked(useHubActiveUser).mockReturnValue({
      activeHubUser: null,
      refreshActiveHubUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HubLogin loginTitle="Hub Login">{null}</HubLogin>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hub Login' })).toBeInTheDocument();
    });
  });

  it('shows loading while user state is undefined', () => {
    vi.mocked(useHubActiveUser).mockReturnValue({
      activeHubUser: undefined,
      refreshActiveHubUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HubLogin>{null}</HubLogin>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar', { name: 'Contents' })).toBeInTheDocument();
  });
});
