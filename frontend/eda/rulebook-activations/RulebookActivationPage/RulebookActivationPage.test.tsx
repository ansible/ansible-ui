import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { edaAPI } from '../../common/eda-utils';
import {
  LogLevelEnum,
  RestartPolicyEnum,
  ScmTypeEnum,
  StatusEnum,
} from '../../interfaces/generated/eda-api';
import { RulebookActivationPage } from './RulebookActivationPage';
import mockActivationOptions from './ActivationOptions.fixture.json';

/** Shape of the options object passed to the bulk confirmation (we only assert on alertPrompts). */
type BulkActionOptions = { alertPrompts?: string[] };

const mockBulkAction = vi.fn<(options: BulkActionOptions) => void>();
vi.mock('../../common/useEdaBulkConfirmation', () => ({
  useEdaBulkConfirmation: () => mockBulkAction,
}));

const mockWorkersOfflineActivation: EdaRulebookActivation = {
  id: 9,
  name: 'Demo Activation',
  description: '',
  is_enabled: true,
  decision_environment: {
    id: 1,
    name: 'Default Decision Environment',
    description: '',
    image_url:
      'brew.registry.redhat.io/rh-osbs/ansible-automation-platform-26-de-supported-rhel9:latest',
    organization_id: 1,
  },
  status: StatusEnum.WorkersOffline,
  git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
  project_id: 11,
  restart_on_project_update: false,
  project: {
    id: 11,
    git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
    url: 'https://github.com/ansible/ansible-ui',
    scm_type: ScmTypeEnum.Git,
    name: 'P1',
    description: '',
    organization_id: 1,
    update_revision_on_launch: false,
  },
  rulebook: {
    id: 97,
    name: 'range_long_running.yml',
    description: '',
    organization_id: 1,
  },
  extra_var: null,
  organization: {
    id: 1,
    name: 'Default',
    description: 'The default organization for Ansible Automation Platform',
  },
  instances: [
    {
      id: 1,
      name: 'Demo Activation',
      status: StatusEnum.WorkersOffline,
      git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
      status_message:
        "activation 1 is in an unknown state. The workers of its associated queue 'eda-ip-10-0-2-218-ec243bec-dfd5-d89a-4683-d87c33a7ac8b' are failing liveness checks. There may be an issue with the worker node; please contact the administrator.",
      activation_id: 1,
      organization_id: 1,
      started_at: '2025-10-15T16:38:14.437981Z',
      ended_at: null,
      queue_name: 'eda-ip-10-0-2-218-ec243bec-dfd5-d89a-4683-d87c33a7ac8b',
    },
  ],
  restart_policy: RestartPolicyEnum.OnFailure,
  restart_count: 0,
  rulebook_name: 'range_long_running.yml',
  current_job_id: null,
  rules_count: 1,
  rules_fired_count: 6,
  created_at: '2025-10-15T15:15:40.337529Z',
  modified_at: '2025-10-15T17:36:48.529694Z',
  edited_at: 'null',
  restarted_at: null,
  status_message:
    "activation 1 is in an unknown state. The workers of its associated queue 'eda-ip-10-0-2-218-ec243bec-dfd5-d89a-4683-d87c33a7ac8b' are failing liveness checks. There may be an issue with the worker node; please contact the administrator.",
  awx_token_id: null,
  log_level: LogLevelEnum.Error,
  eda_credentials: [],
  k8s_service_name: null,
  event_streams: [],
  source_mappings: '',
  skip_audit_events: false,
  created_by: {
    username: 'admin',
  },
  modified_by: {
    username: 'admin',
  },
  edited_by: {
    username: 'admin',
  },
};

describe('RulebookActivationPage', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(mockWorkersOfflineActivation);
      }),
      http.options(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(mockActivationOptions);
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should render the activation details when data is loaded', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });
    const kebabButton = getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);
    await waitFor(() => {
      expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
    });
    const restartOption = getByText('Restart rulebook activation');
    await user.click(restartOption);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
    });
  });

  it('should call enableActivationsWithWarning when enabling an activation with a copy name pattern', async () => {
    const user = userEvent.setup();

    const copyActivation = {
      ...mockWorkersOfflineActivation,
      is_enabled: false,
      name: 'Activation 1 @ 12:00:00',
    };

    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(copyActivation);
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: copyActivation.name })).toBeInTheDocument();
    });

    const switchButton = screen.getByRole('switch', { name: 'Click to enable instance' });
    await user.click(switchButton);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
    });
  });

  it('should call disableActivationsWithWarning when disabling an activation with workers offline', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    const switchButton = screen.getByRole('switch', { name: 'Click to disable instance' });
    await user.click(switchButton);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
      const lastCall = mockBulkAction.mock.calls.at(-1)?.[0];
      expect(lastCall?.alertPrompts).toBeDefined();
      const prompts = lastCall!.alertPrompts!;
      expect(prompts[0]).toContain('workers offline');
      expect(prompts[0]).toContain('Disabling');
    });
  });

  it('should call deleteActivationsWithWarning when deleting an activation with workers offline', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    const kebabButton = screen.getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);
    await waitFor(() => {
      expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
    });

    const deleteOption = screen.getByText('Delete rulebook activation');
    await user.click(deleteOption);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
      const lastCall = mockBulkAction.mock.calls.at(-1)?.[0];
      expect(lastCall?.alertPrompts).toBeDefined();
      const prompts = lastCall!.alertPrompts!;
      expect(prompts[0]).toContain('workers offline');
      expect(prompts[0]).toContain('Deleting');
    });
  });

  it('should call regular disable when disabling an activation without workers offline', async () => {
    const user = userEvent.setup();

    const runningActivation = {
      ...mockWorkersOfflineActivation,
      status: StatusEnum.Running,
      instances: [
        {
          ...mockWorkersOfflineActivation.instances[0],
          status: StatusEnum.Running,
        },
      ],
    };

    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(runningActivation);
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    const switchButton = screen.getByRole('switch', { name: 'Click to disable instance' });
    await user.click(switchButton);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
      const lastCall = mockBulkAction.mock.calls.at(-1)?.[0];
      expect(lastCall?.alertPrompts).toBeUndefined();
    });
  });

  it('should call regular delete when deleting an activation without workers offline', async () => {
    const user = userEvent.setup();

    const runningActivation = {
      ...mockWorkersOfflineActivation,
      status: StatusEnum.Running,
      instances: [
        {
          ...mockWorkersOfflineActivation.instances[0],
          status: StatusEnum.Running,
        },
      ],
    };

    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(runningActivation);
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    const kebabButton = screen.getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);
    await waitFor(() => {
      expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
    });

    const deleteOption = screen.getByText('Delete rulebook activation');
    await user.click(deleteOption);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
      const lastCall = mockBulkAction.mock.calls.at(-1)?.[0];
      expect(lastCall?.alertPrompts).toBeUndefined();
    });
  });

  it('should render all navigation tabs including History', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/*" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    // Verify all expected tabs are rendered
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Team Access' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'User Access' })).toBeInTheDocument();
  });
});
