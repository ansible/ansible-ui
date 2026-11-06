import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Authenticator, AuthenticatorTypeEnum } from '../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../interfaces/AuthenticatorPlugin';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import type { AuthenticatorFormValues } from './components/AuthenticatorForm';
import authenticator_plugins from './components/authenticatorPlugins.fixture.json';
import { CreateAuthenticator } from './CreateAuthenticator';

const mockPageNavigate = vi.fn();
const mockPostRequest = vi.fn();
const mockProcessAutoMigration = vi.fn();
const mockUseGet = vi.fn();

vi.mock('@ansible/ansible-ui-framework', () => ({
  usePageNavigate: (): typeof mockPageNavigate => mockPageNavigate,
  LoadingPage: () => <div data-testid="loading-page">Loading</div>,
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  postRequest: (url: unknown, body: unknown): Promise<Authenticator> =>
    mockPostRequest(url, body) as Promise<Authenticator>,
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (): { data: AuthenticatorPlugins | undefined } =>
    mockUseGet() as { data: AuthenticatorPlugins | undefined },
}));

vi.mock('./hooks/useProcessAutoMigrationUsersRequest', () => ({
  useProcessAutoMigrationUsersRequest: () => mockProcessAutoMigration,
}));

vi.mock('./components/AuthenticatorForm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./components/AuthenticatorForm')>();
  return {
    ...actual,
    AuthenticatorForm: (props: {
      handleSubmit: (values: AuthenticatorFormValues) => Promise<void>;
    }) => (
      <div>
        <button
          type="button"
          data-testid="submit-create"
          onClick={() =>
            void props.handleSubmit({
              name: 'New authenticator',
              enabled: true,
              create_objects: true,
              remove_users: false,
              type: AuthenticatorTypeEnum.Local,
              configuration: { ADDITIONAL_UNVERIFIED_ARGS: '{}' },
              auto_migrate_users_to: null,
            })
          }
        >
          submit
        </button>
        <button
          type="button"
          data-testid="submit-with-migration"
          onClick={() =>
            void props.handleSubmit({
              name: 'New authenticator',
              enabled: true,
              create_objects: true,
              remove_users: false,
              type: AuthenticatorTypeEnum.Local,
              configuration: { ADDITIONAL_UNVERIFIED_ARGS: '{}' },
              auto_migrate_users_to: 5,
            })
          }
        >
          submit with migration
        </button>
      </div>
    ),
  };
});

describe('CreateAuthenticator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGet.mockReturnValue({ data: authenticator_plugins });
    mockPostRequest.mockResolvedValue({
      id: 42,
      name: 'New authenticator',
    });
    mockProcessAutoMigration.mockResolvedValue(undefined);
  });

  it('shows loading while plugins are loading', () => {
    mockUseGet.mockReturnValue({ data: undefined });
    render(
      <MemoryRouter>
        <CreateAuthenticator />
      </MemoryRouter>
    );
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('submits create request and navigates to details', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateAuthenticator />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('submit-create'));

    await waitFor(() => {
      expect(mockPostRequest).toHaveBeenCalledWith(
        gatewayAPI`/authenticators/`,
        expect.objectContaining({
          name: 'New authenticator',
          type: AuthenticatorTypeEnum.Local,
          create_objects: true,
          remove_users: false,
          enabled: true,
          configuration: { ADDITIONAL_UNVERIFIED_ARGS: {} },
        })
      );
    });

    expect(mockProcessAutoMigration).not.toHaveBeenCalled();
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.AuthenticatorDetails, {
      params: { id: 42 },
    });
  });

  it('runs auto-migration when auto_migrate_users_to is set', async () => {
    const user = userEvent.setup();
    const created = { id: 99, name: 'New authenticator' };
    mockPostRequest.mockResolvedValue(created);

    render(
      <MemoryRouter>
        <CreateAuthenticator />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('submit-with-migration'));

    await waitFor(() => {
      expect(mockProcessAutoMigration).toHaveBeenCalledWith(created, 5);
    });
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.AuthenticatorDetails, {
      params: { id: 99 },
    });
  });
});
