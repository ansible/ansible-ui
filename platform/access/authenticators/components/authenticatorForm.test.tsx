import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { AuthenticatorForm } from './AuthenticatorForm';
import authenticator_plugins from './authenticatorPlugins.fixture.json';
import authenticators from './authenticators.fixture.json';
import { RequestError } from '@ansible/common-ui/crud/RequestError';

describe('authenticatorForm', () => {
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/1/`, () => {
      return HttpResponse.json(authenticators.results[0] as unknown as Authenticator);
    }),
    http.get(gatewayAPI`/authenticator_plugins/`, () => {
      return HttpResponse.json(authenticator_plugins);
    })
  );
  const voidFn = async () => {};

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());
  beforeEach(() => {
    server.resetHandlers();
    vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
      const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
        <textarea
          id={props.id as string}
          name={props.id as string}
          value={props.value as string}
          onChange={props.onChange as () => void}
          className={props.className as string}
          onFocus={props.onFocus as () => void}
          onBlur={props.onBlur as () => void}
        />
      ));
      return { DataEditor: FakeDataEditor };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should render create authenticator form', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/create']}>
        <Routes>
          <Route
            path={'/access/authenticators/create'}
            element={
              <AuthenticatorForm
                plugins={authenticator_plugins as AuthenticatorPlugins}
                handleSubmit={voidFn}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(getByRole('button', { name: 'Create Authentication Method' })).toBeInTheDocument();
  });

  test('should render edit authenticator form', async () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/edit/1']}>
        <Routes>
          <Route
            path={'/access/authenticators/edit/:id'}
            element={
              <AuthenticatorForm
                authenticator={authenticators?.results[0] as unknown as Authenticator}
                plugins={authenticator_plugins as AuthenticatorPlugins}
                handleSubmit={voidFn}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByRole('button', { name: 'Save Authentication Method' })).toBeInTheDocument();
    });
  });

  test('should display schema fields pre-populated', async () => {
    const { container, getByText } = render(
      <MemoryRouter initialEntries={['/access/authenticators/edit/1']}>
        <Routes>
          <Route
            path={'/access/authenticators/edit/:id'}
            element={
              <AuthenticatorForm
                authenticator={authenticators.results[2] as unknown as Authenticator}
                plugins={authenticator_plugins as AuthenticatorPlugins}
                handleSubmit={voidFn}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[id="name"]')).toHaveValue('Dev LDAP Container');
      expect(container.querySelector('[id="configuration-input-BIND_DN"]')).toHaveValue(
        'cn=admin,dc=example,dc=org'
      );
      expect(container.querySelector('[id="configuration-input-BIND_PASSWORD"]')).toHaveValue(
        '$encrypted$'
      );
      expect(container.querySelector('[id="configuration-input-SERVER_URI"]')).toHaveValue(
        'ldap://host.docker.internal:389'
      );
      expect(container.querySelector('[id="configuration-input-USER_DN_TEMPLATE"]')).toHaveValue(
        'cn=%(user)s,ou=users,dc=example,dc=org'
      );
      expect(
        container.querySelector('[id="configuration-input-GROUP_TYPE-form-group-toggle"]')
      ).toHaveTextContent('MemberDNGroupType');
      expect(getByText('LDAP Connection Options')).toBeInTheDocument();
      expect(getByText('LDAP Group Type')).toBeInTheDocument();
      expect(getByText('LDAP Group Type Parameters')).toBeInTheDocument();
      expect(getByText('LDAP Start TLS')).toBeInTheDocument();
      expect(getByText('LDAP User Attribute Map')).toBeInTheDocument();
      expect(getByText('LDAP User Search')).toBeInTheDocument();
    });
  });

  test('should submit form data', async () => {
    const handleSubmit = vi.fn();
    const { container, getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/create']}>
        <Routes>
          <Route
            path={'/access/authenticators/create'}
            element={
              <AuthenticatorForm
                plugins={authenticator_plugins as AuthenticatorPlugins}
                handleSubmit={handleSubmit}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[id="name"]')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(container.querySelector('[id="name"]') as HTMLInputElement);
    await user.type(
      container.querySelector('[id="name"]') as HTMLInputElement,
      'Local Database Authenticator'
    );
    await user.click(getByRole('button', { name: 'Create Authentication Method' }));
    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Local Database Authenticator',
        type: AuthenticatorTypeEnum.Local,
        enabled: false,
        create_objects: false,
        remove_users: false,
        configuration: {},
        auto_migrate_users_to: null,
      }),
      expect.any(Function),
      expect.any(Function)
    );
  });

  test('should display configuration field errors with correct field names', async () => {
    const handleSubmit = vi.fn().mockRejectedValue(
      new RequestError(
        'Bad Request',
        undefined,
        400,
        {
          ADDITIONAL_UNVERIFIED_ARGS: ['Config error'],
        },
        {
          ADDITIONAL_UNVERIFIED_ARGS: ['Config error'],
        }
      )
    );

    const { container, getByRole, getByText } = render(
      <MemoryRouter initialEntries={['/access/authenticators/create']}>
        <Routes>
          <Route
            path={'/access/authenticators/create'}
            element={
              <AuthenticatorForm
                plugins={authenticator_plugins as AuthenticatorPlugins}
                handleSubmit={handleSubmit}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[id="name"]')).toBeInTheDocument();
    });

    const user = userEvent.setup();

    await user.click(container.querySelector('[id="name"]') as HTMLInputElement);
    await user.type(
      container.querySelector('[id="name"]') as HTMLInputElement,
      'Test Authenticator'
    );

    await user.click(
      container.querySelector(
        '[id="configuration-editor-ADDITIONAL_UNVERIFIED_ARGS-form-group"] input'
      ) as HTMLInputElement
    );
    await user.type(
      container.querySelector(
        '[id="configuration-editor-ADDITIONAL_UNVERIFIED_ARGS-form-group"] input'
      ) as HTMLInputElement,
      'xyz'
    );

    // Submit the form to trigger error handling
    await user.click(getByRole('button', { name: 'Create Authentication Method' }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    // Verify that the authenticatorErrorAdapter processed the error correctly:
    expect(getByText('Config error')).toBeInTheDocument();
  });
});
