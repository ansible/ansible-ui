import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Authenticator, AuthenticatorTypeEnum } from '../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../interfaces/AuthenticatorPlugin';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import type { AuthenticatorFormValues } from './components/AuthenticatorForm';
import authenticator_plugins from './components/authenticatorPlugins.fixture.json';
import { EditAuthenticator } from './EditAuthenticator';

const mockPageNavigate = vi.fn();
const mockRequestGet = vi.fn();
const mockRequestPatch = vi.fn();
const mockProcessAutoMigration = vi.fn();
const mockUseGet = vi.fn();

const baseAuthenticator = {
  id: 7,
  name: 'Existing auth',
  url: '/api/gateway/v1/authenticators/7/',
  created: '',
  modified: '',
  related: {},
  enabled: true,
  create_objects: true,
  remove_users: false,
  configuration: {},
  type: AuthenticatorTypeEnum.Local,
  order: 1,
  slug: 'existing',
  auto_migrate_users_to: null,
  summary_fields: {
    auto_migrate_users_to: { id: 0, name: '' },
    created_by: {} as Authenticator['summary_fields']['created_by'],
    modified_by: {} as Authenticator['summary_fields']['modified_by'],
  },
} as Authenticator;

vi.mock('@ansible/ansible-ui-framework', () => ({
  usePageNavigate: (): typeof mockPageNavigate => mockPageNavigate,
  LoadingPage: () => <div data-testid="loading-page">Loading</div>,
}));

vi.mock('@ansible/awx-ui/common/AwxError', () => ({
  AwxError: (props: { error: Error }) => <div data-testid="awx-error">{props.error.message}</div>,
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: (url: unknown): Promise<Authenticator> =>
    mockRequestGet(url) as Promise<Authenticator>,
  requestPatch: (url: unknown, body: unknown): Promise<Authenticator> =>
    mockRequestPatch(url, body) as Promise<Authenticator>,
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
          data-testid="submit-edit"
          onClick={() =>
            void props.handleSubmit({
              name: 'Updated name',
              enabled: false,
              create_objects: false,
              remove_users: true,
              type: AuthenticatorTypeEnum.Local,
              configuration: { ADDITIONAL_UNVERIFIED_ARGS: '{}' },
              auto_migrate_users_to: null,
            })
          }
        >
          submit
        </button>
      </div>
    ),
  };
});

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/access/authenticators/7/edit']}>
      <Routes>
        <Route path="/access/authenticators/:id/edit" element={<EditAuthenticator />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EditAuthenticator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGet.mockReturnValue({ data: authenticator_plugins });
    mockRequestGet.mockResolvedValue(baseAuthenticator);
    mockRequestPatch.mockResolvedValue({ ...baseAuthenticator, name: 'Updated name' });
    mockProcessAutoMigration.mockResolvedValue(undefined);
  });

  it('shows AwxError when loading authenticator fails', async () => {
    mockRequestGet.mockRejectedValue(new Error('network down'));
    renderEdit();

    await waitFor(() => {
      expect(screen.getByTestId('awx-error')).toHaveTextContent('network down');
    });
  });

  it('shows loading until plugins and authenticator are available', () => {
    mockRequestGet.mockImplementation(() => new Promise(() => {}));
    renderEdit();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('patches authenticator and navigates on submit', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => {
      expect(screen.getByTestId('submit-edit')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('submit-edit'));

    await waitFor(() => {
      expect(mockRequestPatch).toHaveBeenCalledWith(
        gatewayAPI`/authenticators/7/`,
        expect.objectContaining({
          name: 'Updated name',
          enabled: false,
          create_objects: false,
          remove_users: true,
          configuration: { ADDITIONAL_UNVERIFIED_ARGS: {} },
        })
      );
    });

    expect(mockProcessAutoMigration).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated name' }),
      null
    );
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.AuthenticatorDetails, {
      params: { id: 7 },
    });
  });
});
