import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsForm, AwxSettingsOptionsAction } from './AwxSettingsForm';

const mockNavigate = vi.fn();
const mockPatch = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@ansible/common-ui/crud/usePatchRequest', () => ({
  usePatchRequest: () => mockPatch,
}));

vi.mock('./useRevertAllSettingsModal', () => ({
  useRevertAllSettingsModal: () => vi.fn(),
}));

const mockExecutionEnvironments = [
  {
    id: 1,
    name: 'Default Execution Environment',
    description: 'Default EE for testing',
    image: 'quay.io/ansible/awx-ee:latest',
  },
  {
    id: 2,
    name: 'Custom Execution Environment',
    description: 'Custom EE for testing',
    image: 'custom/ee:latest',
  },
];

const mockSettingsOptions = {
  DEFAULT_EXECUTION_ENVIRONMENT: {
    type: 'field',
    label: 'Default Execution Environment',
    category: 'jobs',
    category_slug: 'jobs',
    help_text: 'The execution environment that will be used by default for jobs.',
    required: false,
  } satisfies AwxSettingsOptionsAction,
};

const mockSettingsData = {
  DEFAULT_EXECUTION_ENVIRONMENT: 1,
};

describe('AwxSettingsForm - DEFAULT_EXECUTION_ENVIRONMENT field', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(
      http.get(awxAPI`/execution_environments/`, () => {
        return HttpResponse.json({
          count: mockExecutionEnvironments.length,
          results: mockExecutionEnvironments,
        });
      }),
      http.options(awxAPI`/execution_environments/`, () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.get(awxAPI`/execution_environments/1/`, () => {
        return HttpResponse.json(mockExecutionEnvironments[0]);
      }),
      http.patch(awxAPI`/settings/all/`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(body);
      })
    );
  });

  test('should render execution environment selection field', () => {
    render(
      <MemoryRouter>
        <AwxSettingsForm options={mockSettingsOptions} data={mockSettingsData} />
      </MemoryRouter>
    );

    // Check that the label is rendered
    expect(screen.getByText('Default Execution Environment')).toBeVisible();

    // The PageFormSelectExecutionEnvironment component renders as a menu toggle button
    expect(screen.getByTestId('executionEnvironment')).toBeVisible();
  });

  test('should handle empty/no execution environment selection', () => {
    const emptyData = { DEFAULT_EXECUTION_ENVIRONMENT: null };

    render(
      <MemoryRouter>
        <AwxSettingsForm options={mockSettingsOptions} data={emptyData} />
      </MemoryRouter>
    );

    const menuToggle = screen.getByTestId('executionEnvironment');
    expect(menuToggle).toHaveTextContent('Select execution environment');
  });

  test('should show required indicator when field is marked as required', () => {
    const requiredOptions = {
      DEFAULT_EXECUTION_ENVIRONMENT: {
        ...mockSettingsOptions.DEFAULT_EXECUTION_ENVIRONMENT,
        required: true,
      },
    };

    render(
      <MemoryRouter>
        <AwxSettingsForm options={requiredOptions} data={mockSettingsData} />
      </MemoryRouter>
    );

    // Check for required indicator (asterisk)
    expect(screen.getByText('*')).toBeVisible();
  });
});

describe('AwxSettingsForm - additional field types', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mixedOptions = {
    HOSTNAME: {
      type: 'string',
      label: 'Hostname',
      category: 'system',
      category_slug: 'system',
      default: 'localhost',
    },
    MAX_FORKS: {
      type: 'integer',
      label: 'Max forks',
      category: 'jobs',
      category_slug: 'jobs',
      min_value: 1,
      max_value: 20,
      default: 5,
    },
    ENABLE_WEBSOCKETS: {
      type: 'boolean',
      label: 'Enable websockets',
      category: 'jobs',
      category_slug: 'jobs',
      default: true,
    },
    LOG_AGGREGATOR_TYPE: {
      type: 'choice',
      label: 'Aggregator type',
      category: 'logging',
      category_slug: 'logging',
      default: 'none',
      choices: [
        ['none', 'None'],
        ['logstash', 'Logstash'],
      ] as [string, string][],
    },
    AUTH_LDAP_SERVER_URI: {
      type: 'string',
      label: 'LDAP server URI',
      category: 'ldap',
      category_slug: 'ldap',
    },
    AUTH_LDAP_1_BIND_DN: {
      type: 'string',
      label: 'LDAP bind DN',
      category: 'ldap',
      category_slug: 'ldap',
    },
  } satisfies Record<string, AwxSettingsOptionsAction>;

  const mixedData = {
    HOSTNAME: 'controller.local',
    MAX_FORKS: 5,
    ENABLE_WEBSOCKETS: true,
    LOG_AGGREGATOR_TYPE: 'none',
    AUTH_LDAP_SERVER_URI: 'ldap://example',
    AUTH_LDAP_1_BIND_DN: 'cn=admin',
  };

  test('should render grouped LDAP fields and common option types', () => {
    render(
      <MemoryRouter>
        <AwxSettingsForm options={mixedOptions} data={mixedData} />
      </MemoryRouter>
    );

    expect(screen.getByText('Hostname')).toBeVisible();
    expect(screen.getByText('Max forks')).toBeVisible();
    expect(screen.getByText('Aggregator type')).toBeVisible();
    expect(screen.getByText('Enable websockets')).toBeInTheDocument();
    expect(screen.getByText('LDAP bind DN')).toBeInTheDocument();
  });
});

describe('OptionActionsFormInput', () => {
  test('renders password inputs for secret field names', () => {
    render(
      <MemoryRouter>
        <AwxSettingsForm
          options={{
            LDAP_BIND_PASSWORD: {
              type: 'string',
              label: 'LDAP Bind Password',
              category: 'ldap',
              category_slug: 'ldap',
            },
          }}
          data={{}}
        />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('LDAP Bind Password')).toHaveAttribute('type', 'password');
  });

  test('renders choice and datetime option types', () => {
    render(
      <MemoryRouter>
        <AwxSettingsForm
          options={{
            SESSION_COOKIE_AGE: {
              type: 'datetime',
              label: 'Session cookie age',
              category: 'system',
              category_slug: 'system',
            },
            LOG_LEVEL: {
              type: 'choice',
              label: 'Log level',
              category: 'logging',
              category_slug: 'logging',
              default: 'info',
              choices: [
                ['info', 'Info'],
                ['debug', 'Debug'],
              ] as [string, string][],
            },
          }}
          data={{ SESSION_COOKIE_AGE: '2020-01-01T00:00', LOG_LEVEL: 'info' }}
        />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Session cookie age')).toHaveAttribute('type', 'datetime-local');
    expect(screen.getByText('Log level')).toBeInTheDocument();
  });
});
