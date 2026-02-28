import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RulebookActivationPage } from '../rulebook-activations/RulebookActivationPage/RulebookActivationPage';
import { DecisionEnvironmentPage } from '../decision-environments/DecisionEnvironmentPage/DecisionEnvironmentPage';
import { ProjectPage } from '../projects/ProjectPage/ProjectPage';
import { CredentialPage } from '../access/credentials/CredentialPage/CredentialPage';
import { edaAPI } from '../common/eda-utils';
import {
  LogLevelEnum,
  RestartPolicyEnum,
  StatusEnum,
  ScmTypeEnum,
} from '../interfaces/generated/eda-api';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaCredential } from '../interfaces/EdaCredential';

const mockRulebookActivation: EdaRulebookActivation = {
  id: 1,
  name: 'Test Activation',
  description: 'Test activation for read-only permissions',
  is_enabled: true,
  decision_environment: {
    id: 1,
    name: 'Default Decision Environment',
    description: '',
    image_url: 'quay.io/test/image:latest',
    organization_id: 1,
  },
  status: StatusEnum.Running,
  git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
  project: {
    id: 1,
    git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
    url: 'https://github.com/test/repo',
    scm_type: ScmTypeEnum.Git,
    name: 'Test Project',
    description: '',
    organization_id: 1,
  },
  rulebook: {
    id: 1,
    name: 'test.yml',
    description: '',
    organization_id: 1,
  },
  extra_var: null,
  organization: {
    id: 1,
    name: 'Default',
    description: 'The default organization',
  },
  instances: [],
  restart_policy: RestartPolicyEnum.OnFailure,
  restart_count: 0,
  rulebook_name: 'test.yml',
  current_job_id: null,
  rules_count: 1,
  rules_fired_count: 0,
  created_at: '2025-01-01T00:00:00.000000Z',
  modified_at: '2025-01-01T00:00:00.000000Z',
  edited_at: '',
  restarted_at: null,
  status_message: '',
  awx_token_id: null,
  log_level: LogLevelEnum.Error,
  eda_credentials: [],
  k8s_service_name: null,
  event_streams: [],
  source_mappings: '',
  skip_audit_events: false,
  created_by: { username: 'admin' },
  modified_by: { username: 'admin' },
  edited_by: { username: 'admin' },
};

const mockDecisionEnvironment: EdaDecisionEnvironment = {
  id: 1,
  name: 'Test Decision Environment',
  description: 'Test DE for read-only permissions',
  image_url: 'quay.io/test/de:latest',
  organization_id: 1,
  eda_credential_id: null,
  created_at: '2025-01-01T00:00:00.000000Z',
  modified_at: '2025-01-01T00:00:00.000000Z',
};

const mockProject: EdaProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test project for read-only permissions',
  url: 'https://github.com/test/repo',
  scm_type: ScmTypeEnum.Git,
  organization_id: 1,
  signature_validation_credential_id: null,
  proxy: '',
  import_state: 'completed' as EdaProject['import_state'],
  import_error: '',
  created_at: '2025-01-01T00:00:00.000000Z',
  modified_at: '2025-01-01T00:00:00.000000Z',
  git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
};

const mockCredential: EdaCredential = {
  id: 1,
  name: 'Test Credential',
  description: 'Test credential for read-only permissions',
  inputs: {},
  managed: false,
  credential_type: {
    id: 1,
    name: 'Container Registry',
    namespace: 'eda',
    kind: 'cloud',
  },
  organization: {
    id: 1,
    name: 'Default',
    description: 'The default organization',
  },
  created_at: '2025-01-01T00:00:00.000000Z',
  modified_at: '2025-01-01T00:00:00.000000Z',
  created_by: { username: 'admin' },
  modified_by: { username: 'admin' },
};

// Read-only OPTIONS responses (only GET action available)
const readOnlyActivationOptions = {
  actions: {
    GET: {},
  },
};

const readOnlyDecisionEnvironmentOptions = {
  actions: {
    GET: {},
  },
};

const readOnlyProjectOptions = {
  actions: {
    GET: {},
  },
};

const readOnlyCredentialOptions = {
  actions: {
    GET: {},
  },
};

describe('Read-Only Permissions - Action Buttons Disabled', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should disable delete action on Rulebook Activation when user has read-only permission', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(mockRulebookActivation);
      }),
      http.options(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(readOnlyActivationOptions);
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
      expect(screen.getByRole('heading', { name: 'Test Activation' })).toBeInTheDocument();
    });

    // Click kebab menu
    const kebabButton = screen.getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);

    await waitFor(() => {
      expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
    });

    // Verify delete action is disabled
    const deleteOption = screen.getByRole('menuitem', { name: /delete rulebook activation/i });
    expect(deleteOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable edit and delete actions on Decision Environment when user has read-only permission', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(edaAPI`/decision-environments/1/`, () => {
        return HttpResponse.json(mockDecisionEnvironment);
      }),
      http.options(edaAPI`/decision-environments/1/`, () => {
        return HttpResponse.json(readOnlyDecisionEnvironmentOptions);
      })
    );

    render(
      <MemoryRouter initialEntries={['/decision-environments/1/details']}>
        <Routes>
          <Route path="/decision-environments/:id/details" element={<DecisionEnvironmentPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Test Decision Environment' })
      ).toBeInTheDocument();
    });

    // Verify edit button is disabled
    const editButton = screen.getByRole('button', { name: /edit decision environment/i });
    expect(editButton).toHaveAttribute('aria-disabled', 'true');

    // Click kebab menu
    const kebabButton = screen.getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);

    await waitFor(() => {
      const deleteOption = screen.getByRole('menuitem', { name: /delete decision environment/i });
      expect(deleteOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('should disable edit and delete actions on Project when user has read-only permission', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(edaAPI`/projects/1/`, () => {
        return HttpResponse.json(mockProject);
      }),
      http.options(edaAPI`/projects/1/`, () => {
        return HttpResponse.json(readOnlyProjectOptions);
      })
    );

    render(
      <MemoryRouter initialEntries={['/projects/1/details']}>
        <Routes>
          <Route path="/projects/:id/details" element={<ProjectPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Project' })).toBeInTheDocument();
    });

    // Verify edit button is disabled
    const editButton = screen.getByRole('button', { name: /edit project/i });
    expect(editButton).toHaveAttribute('aria-disabled', 'true');

    // Click kebab menu
    const kebabButton = screen.getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);

    await waitFor(() => {
      const deleteOption = screen.getByRole('menuitem', { name: /delete project/i });
      expect(deleteOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('should disable edit and delete actions on Credential when user has read-only permission', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(edaAPI`/eda-credentials/1/`, () => {
        return HttpResponse.json(mockCredential);
      }),
      http.options(edaAPI`/eda-credentials/1/`, () => {
        return HttpResponse.json(readOnlyCredentialOptions);
      })
    );

    render(
      <MemoryRouter initialEntries={['/credentials/1/details']}>
        <Routes>
          <Route path="/credentials/:id/details" element={<CredentialPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Credential' })).toBeInTheDocument();
    });

    // Verify edit button is disabled
    const editButton = screen.getByRole('button', { name: /edit credential/i });
    expect(editButton).toHaveAttribute('aria-disabled', 'true');

    // Click kebab menu
    const kebabButton = screen.getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);

    await waitFor(() => {
      const deleteOption = screen.getByRole('menuitem', { name: /delete credential/i });
      expect(deleteOption).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
