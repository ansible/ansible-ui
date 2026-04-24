/* eslint-disable i18next/no-literal-string */

import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../common/eda-utils';
import { CreateRulebookActivation, EditRulebookActivation } from './RulebookActivationForm';

// Mock the DataEditor component to avoid Monaco Editor issues in tests
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    PageFormDataEditor: ({ label, name }: { label: string; name: string }) => (
      <div data-testid={`mock-data-editor-${name}`}>{label}</div>
    ),
  };
});

const mockOrganizations = {
  results: [
    { id: 1, name: 'Default' },
    { id: 2, name: 'Organization 2' },
  ],
};

const mockEventStreams = {
  count: 0,
  results: [],
};

const mockConfig = {
  deployment_type: 'podman',
};

const mockProjects = {
  count: 0,
  results: [],
};

const mockDecisionEnvironments = {
  count: 0,
  results: [],
};

const mockCredentials = {
  count: 0,
  results: [],
};

const mockExistingActivation = {
  id: 1,
  name: 'Test Activation',
  description: 'Test description',
  organization: { id: 1, name: 'Default' },
  project: { id: 5, name: 'Test Project' },
  rulebook: { id: 10, name: 'test-rulebook.yml' },
  decision_environment: { id: 3, name: 'Test DE' },
  restart_policy: 'always',
  log_level: 'info',
  is_enabled: true,
  skip_audit_events: true,
  restart_on_project_update: false,
  enable_persistence: true,
  rule_engine_credential_id: 99,
  eda_credentials: [{ id: 7, name: 'Test Credential' }],
  event_streams: [],
  extra_var: 'key: value',
};

const mockActivationOptions = {
  actions: {
    GET: {},
    PATCH: {},
  },
};

const server = setupServer(
  http.get(edaAPI`/organizations/`, () => {
    return HttpResponse.json(mockOrganizations);
  }),
  http.get(edaAPI`/event-streams/`, () => {
    return HttpResponse.json(mockEventStreams);
  }),
  http.get(edaAPI`/config/`, () => {
    return HttpResponse.json(mockConfig);
  }),
  http.get(edaAPI`/projects/`, () => {
    return HttpResponse.json(mockProjects);
  }),
  http.get(edaAPI`/decision-environments/`, () => {
    return HttpResponse.json(mockDecisionEnvironments);
  }),
  http.get(edaAPI`/eda-credentials/`, () => {
    return HttpResponse.json(mockCredentials);
  }),
  http.get(edaAPI`/activations/1/`, () => {
    return HttpResponse.json(mockExistingActivation);
  }),
  http.options(edaAPI`/activations/1/`, () => {
    return HttpResponse.json(mockActivationOptions);
  })
);

describe('CreateRulebookActivation', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the form with all required fields', async () => {
    render(
      <MemoryRouter>
        <CreateRulebookActivation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Create rulebook activation/ })
      ).toBeInTheDocument();
    });

    // Wait for form to load
    await waitFor(
      () => {
        expect(screen.getByText(/Name/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Verify ALL form fields are present
    expect(screen.getByText(/^Name/)).toBeInTheDocument();
    expect(screen.getByText(/Description/)).toBeInTheDocument();
    expect(screen.getByText(/Organization/)).toBeInTheDocument();
    expect(screen.getByText(/Project/)).toBeInTheDocument();
    // Rulebook appears in breadcrumb and form label, so use getAllByText
    expect(screen.getAllByText(/Rulebook/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Event streams/)).toBeInTheDocument();
    expect(screen.getByText(/^Credential$/)).toBeInTheDocument(); // Singular, not plural
    expect(screen.getByText(/Decision environment/)).toBeInTheDocument();
    expect(screen.getByText(/Restart policy/)).toBeInTheDocument();
    expect(screen.getByText(/Log level/)).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: /Rulebook activation enabled?/ })
    ).toBeInTheDocument();
    expect(screen.getByText(/Variables/)).toBeInTheDocument();

    // Verify Options section checkboxes
    expect(screen.getByText(/Options/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Skip audit events/ })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /Auto-restart on project update/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Enable event persistence/ })).toBeInTheDocument();
  });

  it('should apply default values correctly', async () => {
    render(
      <MemoryRouter>
        <CreateRulebookActivation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Create rulebook activation/ })
      ).toBeInTheDocument();
    });

    // Wait for form fields to render
    await waitFor(
      () => {
        expect(screen.getByText(/Restart policy/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Verify restart policy defaults to "On failure" - find by button text in select
    await waitFor(() => {
      const restartPolicyButtons = screen.getAllByRole('button');
      const restartPolicyButton = restartPolicyButtons.find(
        (btn) => btn.textContent?.includes('On failure') && btn.id?.includes('restart')
      );
      expect(restartPolicyButton).toBeTruthy();
    });

    // Verify log level defaults to "Error" - find by button text in select
    await waitFor(() => {
      const logLevelButtons = screen.getAllByRole('button');
      const logLevelButton = logLevelButtons.find(
        (btn) =>
          btn.textContent === 'Error' ||
          (btn.textContent?.includes('Error') && btn.id?.includes('log'))
      );
      expect(logLevelButton).toBeTruthy();
    });

    // Verify "Rulebook activation enabled?" switch is checked by default
    await waitFor(() => {
      const enabledSwitch = screen.getByRole('switch', { name: /Rulebook activation enabled?/ });
      expect(enabledSwitch).toBeChecked();
    });

    // Verify "Enable event persistence" checkbox is NOT checked by default
    await waitFor(() => {
      const persistenceCheckbox = screen.getByRole('checkbox', {
        name: /Enable event persistence/,
      });
      expect(persistenceCheckbox).not.toBeChecked();
    });
  });
});

describe('EditRulebookActivation', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the edit form with all required fields', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/edit']}>
        <Routes>
          <Route path="/rulebook-activations/:id/edit" element={<EditRulebookActivation />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Test Activation/ })).toBeInTheDocument();
    });

    // Wait for form to load
    await waitFor(
      () => {
        expect(screen.getByText(/Name/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Verify ALL form fields are present
    expect(screen.getByText(/^Name/)).toBeInTheDocument();
    expect(screen.getByText(/Description/)).toBeInTheDocument();
    expect(screen.getByText(/Organization/)).toBeInTheDocument();
    expect(screen.getByText(/Project/)).toBeInTheDocument();
    // Rulebook appears in breadcrumb and form label, so use getAllByText
    expect(screen.getAllByText(/Rulebook/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Event streams/)).toBeInTheDocument();
    expect(screen.getByText(/^Credential$/)).toBeInTheDocument(); // Singular, not plural
    expect(screen.getByText(/Decision environment/)).toBeInTheDocument();
    expect(screen.getByText(/Restart policy/)).toBeInTheDocument();
    expect(screen.getByText(/Log level/)).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: /Rulebook activation enabled?/ })
    ).toBeInTheDocument();
    expect(screen.getByText(/Variables/)).toBeInTheDocument();

    // Verify Options section checkboxes
    expect(screen.getByText(/Options/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Skip audit events/ })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /Auto-restart on project update/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Enable event persistence/ })).toBeInTheDocument();
  });

  it('should prepopulate form fields with existing activation data', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/edit']}>
        <Routes>
          <Route path="/rulebook-activations/:id/edit" element={<EditRulebookActivation />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Test Activation/ })).toBeInTheDocument();
    });

    // Wait for form to load
    await waitFor(
      () => {
        expect(screen.getByText(/Restart policy/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Verify name field is prepopulated
    await waitFor(() => {
      const nameInput = screen.getByRole('textbox', { name: /Name/ });
      expect(nameInput).toHaveValue('Test Activation');
    });

    // Verify restart policy is set to "Always" (from existing data)
    await waitFor(() => {
      const restartPolicyButtons = screen.getAllByRole('button');
      const restartPolicyButton = restartPolicyButtons.find(
        (btn) => btn.textContent?.includes('Always') && btn.id?.includes('restart')
      );
      expect(restartPolicyButton).toBeTruthy();
    });

    // Verify log level is set to "Info" (from existing data)
    await waitFor(() => {
      const logLevelButtons = screen.getAllByRole('button');
      const logLevelButton = logLevelButtons.find(
        (btn) =>
          btn.textContent === 'Info' ||
          (btn.textContent?.includes('Info') && btn.id?.includes('log'))
      );
      expect(logLevelButton).toBeTruthy();
    });

    // Verify "Skip audit events" checkbox is checked (from existing data)
    await waitFor(() => {
      const skipAuditCheckbox = screen.getByRole('checkbox', { name: /Skip audit events/ });
      expect(skipAuditCheckbox).toBeChecked();
    });

    // Verify "Enable event persistence" checkbox is checked (from existing data)
    await waitFor(() => {
      const persistenceCheckbox = screen.getByRole('checkbox', {
        name: /Enable event persistence/,
      });
      expect(persistenceCheckbox).toBeChecked();
    });

    // Verify "Auto-restart on project update" checkbox is NOT checked (from existing data)
    await waitFor(() => {
      const autoRestartCheckbox = screen.getByRole('checkbox', {
        name: /Auto-restart on project update/,
      });
      expect(autoRestartCheckbox).not.toBeChecked();
    });
  });
});
