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

  it('should display auto-restart option when enabled', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationDetails />} />
        </Routes>
      </MemoryRouter>
    );

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
});
