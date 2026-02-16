import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PolicySettingsCategoryForm } from './PolicySettingsEdit';

const policySettingsData = {
  results: [{ url: '/api/v2/settings/policyascode/', slug: 'policyascode', name: 'Policy' }],
  OPA_HOST: '',
  OPA_PORT: 8181,
  OPA_SSL: false,
  OPA_AUTH_TYPE: 'None',
};

const policySettingsOptions = {
  actions: {
    GET: {
      OPA_HOST: {
        type: 'string',
        label: 'OPA server hostname',
        category: 'Policyascode',
        category_slug: 'policyascode',
        help_text: 'OPA server hostname',
      },
      OPA_AUTH_TYPE: {
        type: 'choice',
        label: 'OPA auth type',
        category: 'Policyascode',
        category_slug: 'policyascode',
        choices: [],
        help_text: 'Auth type',
      },
    },
    PUT: {
      OPA_HOST: {
        type: 'string',
        label: 'OPA server hostname',
        category: 'Policyascode',
        category_slug: 'policyascode',
        help_text: 'OPA server hostname',
      },
      OPA_AUTH_TYPE: {
        type: 'choice',
        label: 'OPA auth type',
        category: 'Policyascode',
        category_slug: 'policyascode',
        choices: [],
        help_text: 'Auth type',
      },
    },
  },
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/settings/policyascode/'),
    () => HttpResponse.json(policySettingsOptions)
  ),
  http.get(
    ({ request }) => request.url.includes('/settings/policyascode/'),
    () => HttpResponse.json(policySettingsData)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PolicySettingsCategoryForm', () => {
  it('should render policy settings form', async () => {
    render(
      <MemoryRouter>
        <PolicySettingsCategoryForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Policy Settings');
    });
  });

  it('should render OPA server hostname field when loaded', async () => {
    render(
      <MemoryRouter>
        <PolicySettingsCategoryForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('OPA server hostname')).toBeInTheDocument();
    });
  });
});
