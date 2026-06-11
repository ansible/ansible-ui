import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { AuthenticatorPlugin, AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { AuthenticatorForm, formatConfiguration } from './AuthenticatorForm';
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

    await waitFor(
      () => {
        expect(container.querySelector('[id="name"]')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const user = userEvent.setup();
    const nameInput = container.querySelector('[id="name"]') as HTMLInputElement;
    await user.click(nameInput);
    await user.type(nameInput, 'Local Database Authenticator');

    await waitFor(() => {
      expect(nameInput).toHaveValue('Local Database Authenticator');
    });

    await user.click(getByRole('button', { name: 'Create Authentication Method' }));

    await waitFor(
      () => {
        expect(handleSubmit).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );

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
  }, 15000);

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

    await waitFor(
      () => {
        expect(container.querySelector('[id="name"]')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const user = userEvent.setup();

    const nameInput = container.querySelector('[id="name"]') as HTMLInputElement;
    await user.click(nameInput);
    await user.type(nameInput, 'Test Authenticator');

    const configInput = container.querySelector(
      '[id="configuration-editor-ADDITIONAL_UNVERIFIED_ARGS-form-group"] input'
    ) as HTMLInputElement;
    await user.click(configInput);
    await user.type(configInput, 'xyz');

    // Submit the form to trigger error handling
    await user.click(getByRole('button', { name: 'Create Authentication Method' }));

    await waitFor(
      () => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      },
      { timeout: 10000 }
    );

    // Verify that the authenticatorErrorAdapter processed the error correctly:
    await waitFor(
      () => {
        expect(getByText('Config error')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  test('should populate default values when selecting SAML authenticator type', async () => {
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

    // Select SAML authenticator type - the button shows the current selection "Local"
    const typeSelect = container.querySelector(
      '[id="authentication-type-select-form-group-toggle"]'
    ) as HTMLButtonElement;
    await user.click(typeSelect);

    const samlOption = getByRole('option', { name: /saml/i });
    await user.click(samlOption);

    // Wait for default values to be populated - check SP_ENTITY_ID CharField default
    await waitFor(() => {
      const spEntityIdInput = container.querySelector(
        '[id="configuration-input-SP_ENTITY_ID"]'
      ) as HTMLInputElement;
      expect(spEntityIdInput).toHaveValue('aap_gateway');
    });

    // Check that SP_EXTRA JSONField has default value populated (contains the key)
    await waitFor(() => {
      const spExtraEditor = container.querySelector(
        '[id="configuration-editor-SP_EXTRA"]'
      ) as HTMLTextAreaElement;
      expect(spExtraEditor.value).toContain('requestedAuthnContext');
    });
  }, 15000);
});

describe('formatConfiguration', () => {
  test('should send empty object for cleared JSONField', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.SAML,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'SP_EXTRA',
          help_text: 'Test field',
          required: true,
          default: { requestedAuthnContext: false },
          type: 'JSONField',
          ui_field_label: 'SP Extra',
        },
      ],
    };

    const result = formatConfiguration({ SP_EXTRA: '' }, plugin);
    expect(result).toEqual({ SP_EXTRA: {} });
  });

  test('should send empty object for cleared DictField', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.LDAP,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'CONNECTION_OPTIONS',
          help_text: 'Test field',
          required: false,
          type: 'DictField',
        },
      ],
    };

    const result = formatConfiguration({ CONNECTION_OPTIONS: '' }, plugin);
    expect(result).toEqual({ CONNECTION_OPTIONS: {} });
  });

  test('should send empty array for cleared ListField', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.SAML,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'EXTRA_DATA',
          help_text: 'Test field',
          required: true,
          default: [],
          type: 'ListField',
          ui_field_label: 'Extra Data',
        },
      ],
    };

    const result = formatConfiguration({ EXTRA_DATA: '' }, plugin);
    expect(result).toEqual({ EXTRA_DATA: [] });
  });

  test('should send empty array for cleared LDAPSearchField', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.LDAP,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'USER_SEARCH',
          help_text: 'Test field',
          required: false,
          type: 'LDAPSearchField',
        },
      ],
    };

    const result = formatConfiguration({ USER_SEARCH: '' }, plugin);
    expect(result).toEqual({ USER_SEARCH: [] });
  });

  test('should parse valid JSON for JSONField', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.SAML,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'SP_EXTRA',
          help_text: 'Test field',
          required: true,
          type: 'JSONField',
        },
      ],
    };

    const result = formatConfiguration({ SP_EXTRA: '{"requestedAuthnContext":null}' }, plugin);
    expect(result).toEqual({ SP_EXTRA: { requestedAuthnContext: null } });
  });

  test('should parse empty object JSON for JSONField', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.SAML,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'SP_EXTRA',
          help_text: 'Test field',
          required: true,
          type: 'JSONField',
        },
      ],
    };

    const result = formatConfiguration({ SP_EXTRA: '{}' }, plugin);
    expect(result).toEqual({ SP_EXTRA: {} });
  });

  test('should handle CharField fields normally', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.SAML,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'SP_ENTITY_ID',
          help_text: 'Test field',
          required: true,
          type: 'CharField',
        },
      ],
    };

    const result = formatConfiguration({ SP_ENTITY_ID: 'my_entity_id' }, plugin);
    expect(result).toEqual({ SP_ENTITY_ID: 'my_entity_id' });
  });

  test('should skip empty CharField fields', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.SAML,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'SP_ENTITY_ID',
          help_text: 'Test field',
          required: false,
          type: 'CharField',
        },
      ],
    };

    const result = formatConfiguration({ SP_ENTITY_ID: '' }, plugin);
    expect(result).toEqual({});
  });

  test('should handle BooleanField with false value', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.LDAP,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'START_TLS',
          help_text: 'Test field',
          required: false,
          type: 'BooleanField',
        },
      ],
    };

    const result = formatConfiguration({ START_TLS: false }, plugin);
    expect(result).toEqual({ START_TLS: false });
  });

  test('should handle URLListField', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.Keycloak,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'REDIRECT_URIS',
          help_text: 'Test field',
          required: true,
          type: 'URLListField',
        },
      ],
    };

    const result = formatConfiguration(
      { REDIRECT_URIS: 'https://example.com,https://test.com' },
      plugin
    );
    expect(result).toEqual({ REDIRECT_URIS: ['https://example.com', 'https://test.com'] });
  });
});
