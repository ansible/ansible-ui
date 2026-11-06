import { fireEvent, render, screen, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { AuthenticatorPlugin, AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import {
  AuthenticatorForm,
  buildTriggers,
  formatConfiguration,
  parseTrigger,
  useSetAutoMigrateInitialValue,
} from './AuthenticatorForm';
import authenticator_plugins from './authenticatorPlugins.fixture.json';
import authenticators from './authenticators.fixture.json';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import * as CrudData from '@ansible/common-ui/crud/Data';
import { AuthenticatorMap, AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: Record<string, string | (() => void)>) => (
    <textarea
      id={props.id as string}
      name={props.id as string}
      value={(props.value as string) ?? ''}
      onChange={props.onChange as () => void}
      className={props.className as string}
      onFocus={props.onFocus as () => void}
      onBlur={props.onBlur as () => void}
    />
  ),
}));

describe('authenticatorForm', () => {
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/1/`, () => {
      return HttpResponse.json(authenticators.results[0] as unknown as Authenticator);
    }),
    http.get(gatewayAPI`/authenticator_plugins/`, () => {
      return HttpResponse.json(authenticator_plugins);
    }),
    http.options(gatewayAPI`/authenticators/`, () =>
      HttpResponse.json({
        actions: {
          POST: {
            name: { type: 'string', required: true },
          },
        },
      })
    )
  );
  const voidFn = async () => {};

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());
  beforeEach(() => {
    server.resetHandlers();
    navigateMock.mockClear();
  });

  test('fetches name pattern from authenticators OPTIONS and validates on blur', async () => {
    server.use(
      http.options(gatewayAPI`/authenticators/`, () =>
        HttpResponse.json({
          actions: {
            POST: {
              name: {
                pattern: String.raw`^[a-zA-Z0-9_\-\s]+$`,
                patternDescription:
                  'Name must contain only letters, numbers, underscores, hyphens, and spaces.',
              },
            },
          },
        })
      )
    );

    const user = userEvent.setup();
    render(
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

    const nameInput = await screen.findByTestId('name');
    await user.type(nameInput, 'invalid<script>');
    await user.tab();

    await waitFor(
      () => {
        expect(
          screen.getByText(
            /Name must contain only letters, numbers, underscores, hyphens, and spaces\./
          )
        ).toBeInTheDocument();
      },
      { timeout: 15000 }
    );
  }, 20000);

  test('should render create authenticator form', async () => {
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

    await waitFor(
      () => {
        expect(getByRole('button', { name: 'Create Authentication Method' })).toBeInTheDocument();
      },
      { timeout: 15000 }
    );
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
      { timeout: 30000 }
    );

    const user = userEvent.setup();
    const nameInput = container.querySelector('[id="name"]') as HTMLInputElement;
    await user.click(nameInput);
    fireEvent.change(nameInput, { target: { value: 'Local Database Authenticator' } });

    await waitFor(() => {
      expect(nameInput).toHaveValue('Local Database Authenticator');
    });

    await user.click(getByRole('button', { name: 'Create Authentication Method' }));

    await waitFor(
      () => {
        expect(handleSubmit).toHaveBeenCalled();
      },
      { timeout: 30000 }
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
  }, 60000);

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
      { timeout: 30000 }
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
      { timeout: 30000 }
    );

    // Verify that the authenticatorErrorAdapter processed the error correctly:
    await waitFor(
      () => {
        expect(getByText('Config error')).toBeInTheDocument();
      },
      { timeout: 30000 }
    );
  }, 60000);

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

    await waitFor(
      () => {
        expect(container.querySelector('[id="name"]')).toBeInTheDocument();
      },
      { timeout: 30000 }
    );

    const user = userEvent.setup();

    // Select SAML authenticator type - the button shows the current selection "Local"
    const typeSelect = container.querySelector(
      '[id="authentication-type-select-form-group-toggle"]'
    ) as HTMLButtonElement;
    await user.click(typeSelect);

    const samlOption = getByRole('option', { name: /saml/i });
    await user.click(samlOption);

    // Wait for default values to be populated - check SP_ENTITY_ID CharField default
    await waitFor(
      () => {
        const spEntityIdInput = container.querySelector(
          '[id="configuration-input-SP_ENTITY_ID"]'
        ) as HTMLInputElement;
        expect(spEntityIdInput).toHaveValue('aap_gateway');
      },
      { timeout: 30000 }
    );

    // Check that SP_EXTRA JSONField has default value populated (contains the key)
    await waitFor(
      () => {
        const spExtraEditor = container.querySelector(
          '[id="configuration-editor-SP_EXTRA"]'
        ) as HTMLTextAreaElement;
        expect(spExtraEditor.value).toContain('requestedAuthnContext');
      },
      { timeout: 30000 }
    );
  }, 60000);

  test('cancel navigates back', async () => {
    const handleSubmit = vi.fn();
    const { getByRole } = render(
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
      expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });
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

  test('joins URLListField default array into a string when applying create-mode defaults', () => {
    const plugin: AuthenticatorPlugin = {
      type: AuthenticatorTypeEnum.LDAP,
      documentation_url: '',
      configuration_schema: [
        {
          name: 'SERVER_URI',
          help_text: 'Test',
          required: true,
          default: ['ldap://one', 'ldap://two'],
          type: 'URLListField',
          ui_field_label: 'Server URI',
        },
        {
          name: 'START_TLS',
          help_text: 'TLS',
          required: false,
          default: true,
          type: 'BooleanField',
          ui_field_label: 'Start TLS',
        },
      ],
    };
    const plugins: AuthenticatorPlugins = {
      authenticators: [plugin],
    };

    const { container, getByRole } = render(
      <MemoryRouter initialEntries={['/access/authenticators/create']}>
        <Routes>
          <Route
            path={'/access/authenticators/create'}
            element={<AuthenticatorForm plugins={plugins} handleSubmit={async () => {}} />}
          />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    const typeToggle = container.querySelector(
      '[id="authentication-type-select-form-group-toggle"]'
    ) as HTMLButtonElement;

    return (async () => {
      await waitFor(() => {
        expect(typeToggle).toBeInTheDocument();
      });
      await user.click(typeToggle);
      await user.click(getByRole('option', { name: /ldap/i }));

      await waitFor(() => {
        const input = container.querySelector(
          '[id="configuration-input-SERVER_URI"]'
        ) as HTMLInputElement;
        expect(input).toHaveValue('ldap://one,ldap://two');
        const tlsInput = container.querySelector(
          '[id="configuration-input-START_TLS"]'
        ) as HTMLInputElement;
        expect(tlsInput.checked).toBe(true);
      });
    })();
  });
});

describe('buildTriggers', () => {
  test('builds never and always triggers', () => {
    expect(
      buildTriggers({
        map_type: AuthenticatorMapType.allow,
        name: 'n',
        revoke: false,
        trigger: 'never',
      } as never)
    ).toEqual({ never: {} });

    expect(
      buildTriggers({
        map_type: AuthenticatorMapType.allow,
        name: 'n',
        revoke: false,
        trigger: 'always',
      } as never)
    ).toEqual({ always: {} });
  });

  test('builds groups triggers for or and and conditionals', () => {
    const base = {
      map_type: AuthenticatorMapType.allow,
      name: 'n',
      revoke: false,
      trigger: 'groups' as const,
      groups_value: [{ name: 'a' }, { name: 'b' }],
    };
    expect(buildTriggers({ ...base, conditional: 'or' })).toEqual({
      groups: { has_or: ['a', 'b'] },
    });
    expect(buildTriggers({ ...base, conditional: 'and' })).toEqual({
      groups: { has_and: ['a', 'b'] },
    });
  });

  test('builds attribute triggers including comma split for in comparison', () => {
    const result = buildTriggers({
      map_type: AuthenticatorMapType.allow,
      name: 'n',
      revoke: false,
      trigger: 'attributes',
      conditional: 'or',
      attributes: [
        { attribute: 'k', comparison: 'contains', value: 'v' },
        { attribute: 'g', comparison: 'in', value: 'a,b' },
      ],
    } as never);

    expect(result).toEqual({
      attributes: {
        join_condition: 'or',
        k: { contains: 'v' },
        g: { in: ['a', 'b'] },
      },
    });
  });
});

describe('parseTrigger', () => {
  test('parses groups, attributes, never, and always from mapping triggers', () => {
    const groupsMapping = {
      triggers: { groups: { has_and: ['x'] } },
    } as AuthenticatorMap;

    expect(parseTrigger(groupsMapping)).toEqual({
      trigger: 'groups',
      conditional: 'and',
      groups_value: [{ name: 'x' }],
    });

    const attributesMapping = {
      triggers: {
        attributes: {
          join_condition: 'or',
          department: { equals: 'Eng' },
          role: { in: ['a', 'b'] },
        },
      },
    } as unknown as AuthenticatorMap;

    const parsed = parseTrigger(attributesMapping) as {
      trigger: string;
      conditional: string;
      attributes: { attribute: string; comparison: string; value: string }[];
    };
    expect(parsed.trigger).toBe('attributes');
    expect(parsed.conditional).toBe('or');
    expect(parsed.attributes).toEqual(
      expect.arrayContaining([
        { attribute: 'department', comparison: 'equals', value: 'Eng' },
        { attribute: 'role', comparison: 'in', value: 'a,b' },
      ])
    );

    expect(parseTrigger({ triggers: { never: {} } } as AuthenticatorMap)).toEqual({
      trigger: 'never',
    });
    expect(parseTrigger({ triggers: { always: {} } } as AuthenticatorMap)).toEqual({
      trigger: 'always',
    });
  });
});

describe('useSetAutoMigrateInitialValue', () => {
  const legacyAuth = {
    id: 5,
    type: 'ansible_base.legacy.oauth2',
    summary_fields: { auto_migrate_users_to: { id: 88, name: 'Target' } },
  } as unknown as Authenticator;

  let requestGetSpy: ReturnType<typeof vi.spyOn<typeof CrudData, 'requestGet'>>;

  beforeEach(() => {
    requestGetSpy = vi.spyOn(CrudData, 'requestGet').mockResolvedValue({
      count: 1,
      results: [{ id: 42, name: 'Listed' } as Authenticator],
    }) as ReturnType<typeof vi.spyOn<typeof CrudData, 'requestGet'>>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns summary field id for legacy authenticators', async () => {
    const { result } = renderHook(() => useSetAutoMigrateInitialValue());
    await expect(result.current(legacyAuth)).resolves.toBe(88);
    expect(requestGetSpy).toHaveBeenCalled();
  });

  test('returns first listed authenticator id for non-legacy', async () => {
    const { result } = renderHook(() => useSetAutoMigrateInitialValue());
    await expect(
      result.current({ id: 5, type: AuthenticatorTypeEnum.Local } as Authenticator)
    ).resolves.toBe(42);
  });
});
