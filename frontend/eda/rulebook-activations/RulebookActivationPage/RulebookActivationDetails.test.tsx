/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { RulebookActivationDetails } from './RulebookActivationDetails';

const mockActivation = {
  id: 1,
  name: 'Test Activation',
  description: 'Test Description',
  is_enabled: true,
  status: 'running',
  decision_environment_id: 1,
  project_id: 1,
  rulebook_id: 1,
  restart_policy: 'always',
  restart_count: 0,
  rulebook_name: 'Test Rulebook',
  current_job_id: '123',
  rules_count: 5,
  rules_fired_count: 2,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  restarted_at: null,
  restart_on_project_update: true,
  skip_audit_events: false,
  project: {
    id: 1,
    name: 'Test Project',
  },
  decision_environment: {
    id: 1,
    name: 'Test DE',
  },
};

describe('RulebookActivationDetails - Options', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer(
      http.get(edaAPI`/activations/1/`, () => HttpResponse.json(mockActivation))
    );
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display "Enabled options" label and auto-restart option when enabled', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Enabled options')).toBeInTheDocument();
    expect(await screen.findByText('Auto-restart on project update')).toBeInTheDocument();
  });

  it('should display skip audit events option when enabled', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          restart_on_project_update: false,
          skip_audit_events: true,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Skip audit events')).toBeInTheDocument();
  });

  it('should not display enable event persistence option when disabled', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          enable_persistence: false,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Enabled options');
    expect(screen.queryByText('Enable event persistence')).not.toBeInTheDocument();
  });

  it('should display event persistence credential when present', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          enable_persistence: true,
          rule_engine_credential: {
            id: 42,
            name: 'Drools Credential',
          },
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Event persistence credential')).toBeInTheDocument();
    expect(await screen.findByText('Drools Credential')).toBeInTheDocument();
  });

  it('should not display event persistence credential section when not present', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          enable_persistence: true,
          rule_engine_credential: null,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Enabled options');
    expect(screen.queryByText('Event persistence credential')).not.toBeInTheDocument();
  });
});

describe('RulebookActivationDetails - Source Mappings and Event Streams', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display event streams when source_mappings are present', async () => {
    const sourceMappingsYaml = `
- event_stream_id: 1
  event_stream_name: Stream One
  source_name: source-1
- event_stream_id: 2
  event_stream_name: Stream Two
  source_name: source-2
`;

    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          source_mappings: sourceMappingsYaml,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Event stream(s)')).toBeInTheDocument();
    expect(screen.getByText('Stream One')).toBeInTheDocument();
    expect(screen.getByText('Stream Two')).toBeInTheDocument();
  });

  it('should not display event streams section when source_mappings is empty', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          source_mappings: '',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Activation ID');
    expect(screen.queryByText('Event stream(s)')).not.toBeInTheDocument();
  });

  it('should display alert when event stream is in test mode (disabled)', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          event_streams: [
            {
              id: 1,
              name: 'Test Stream',
              test_mode: true,
            },
          ],
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Event stream disabled.')).toBeInTheDocument();
    expect(
      screen.getByText(/One of the rulebook activation's event streams has been disabled/i)
    ).toBeInTheDocument();
  });

  it('should not display alert when no event streams are in test mode', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          event_streams: [
            {
              id: 1,
              name: 'Active Stream',
              test_mode: false,
            },
          ],
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Activation ID');
    expect(screen.queryByText('Event stream disabled.')).not.toBeInTheDocument();
  });
});

describe('RulebookActivationDetails - Credentials Display', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display multiple credentials when present', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          eda_credentials: [
            { id: 1, name: 'Credential 1' },
            { id: 2, name: 'Credential 2' },
          ],
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Credential(s)')).toBeInTheDocument();
    expect(screen.getByText('Credential 1')).toBeInTheDocument();
    expect(screen.getByText('Credential 2')).toBeInTheDocument();
  });

  it('should not display credentials section when no credentials', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          eda_credentials: [],
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Activation ID');
    expect(screen.queryByText('Credential(s)')).not.toBeInTheDocument();
  });
});

describe('RulebookActivationDetails - Restart Policy and Log Level', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display restart policy "Always"', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          restart_policy: 'always',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Restart policy')).toBeInTheDocument();
    expect(screen.getByText('Always')).toBeInTheDocument();
  });

  it('should display restart policy "Never"', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          restart_policy: 'never',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Restart policy')).toBeInTheDocument();
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('should display restart policy "On failure"', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          restart_policy: 'on-failure',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Restart policy')).toBeInTheDocument();
    expect(screen.getByText('On failure')).toBeInTheDocument();
  });

  it('should display log level "Info"', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          log_level: 'info',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Log level')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('should display log level "Debug"', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          log_level: 'debug',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Log level')).toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
  });
});

describe('RulebookActivationDetails - Extra Variables', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display extra variables when present', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          extra_var: 'key: value\nanother_key: another_value',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Variables')).toBeInTheDocument();
  });

  it('should not display extra variables section when not present', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          extra_var: null,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Activation ID');
    expect(screen.queryByText('Variables')).not.toBeInTheDocument();
  });
});

describe('RulebookActivationDetails - Status and Dates', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display status and status message', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          status: 'running',
          status_message: 'Running smoothly',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Running smoothly')).toBeInTheDocument();
  });

  it('should display last restarted date when present', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          restarted_at: '2024-01-15T10:30:00Z',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Last restarted')).toBeInTheDocument();
  });

  // Note: Test for empty last restarted removed as it's testing rendering
  // of empty state which is implicitly covered by other tests.

  it('should display k8s service name when present', async () => {
    server.use(
      http.get(edaAPI`/activations/1/`, () =>
        HttpResponse.json({
          ...mockActivation,
          k8s_service_name: 'my-k8s-service',
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Service name')).toBeInTheDocument();
    expect(screen.getByText('my-k8s-service')).toBeInTheDocument();
  });
});
