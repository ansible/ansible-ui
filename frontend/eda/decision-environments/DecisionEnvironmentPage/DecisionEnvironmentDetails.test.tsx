/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { DecisionEnvironmentDetails } from './DecisionEnvironmentDetails';

const server = setupServer();

const mockDecisionEnvironment = {
  id: 5,
  name: 'Default DE',
  description: 'Primary environment',
  image_url: 'quay.io/ansible/ansible-rulebook:main',
  pull_policy: 'always',
  organization: { id: 1, name: 'Default' },
  eda_credential: { id: 9, name: 'Registry token' },
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-02T00:00:00Z',
  created_by: { username: 'creator' },
  modified_by: { username: 'modifier' },
};

const mockOptions = {
  actions: {
    POST: {
      pull_policy: {
        choices: [
          { value: 'always', display_name: 'Always' },
          { value: 'missing', display_name: 'If not present' },
        ],
      },
    },
  },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/decision-environments/5/details']}>
      <Routes>
        <Route path="/decision-environments/:id/details" element={<DecisionEnvironmentDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DecisionEnvironmentDetails', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render decision environment details with linked organization and credential', async () => {
    server.use(
      http.get(edaAPI`/decision-environments/5/`, () => HttpResponse.json(mockDecisionEnvironment)),
      http.options(edaAPI`/decision-environments/`, () => HttpResponse.json(mockOptions))
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Default DE')).toBeInTheDocument();
    });
    expect(screen.getByText('Primary environment')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Default' })).toBeInTheDocument();
    expect(screen.getByText('quay.io/ansible/ansible-rulebook:main')).toBeInTheDocument();
    expect(screen.getByText('Always')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Registry token' })).toBeInTheDocument();
  });

  it('should fall back to the raw pull policy and names when links are unavailable', async () => {
    server.use(
      http.get(edaAPI`/decision-environments/5/`, () =>
        HttpResponse.json({
          ...mockDecisionEnvironment,
          organization: undefined,
          eda_credential: { name: 'Unlinked credential' },
          pull_policy: 'never',
        })
      ),
      http.options(edaAPI`/decision-environments/`, () =>
        HttpResponse.json({ actions: { POST: {} } })
      )
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Default DE')).toBeInTheDocument();
    });
    expect(screen.getByText('never')).toBeInTheDocument();
    expect(screen.getByText('Unlinked credential')).toBeInTheDocument();
  });
});
