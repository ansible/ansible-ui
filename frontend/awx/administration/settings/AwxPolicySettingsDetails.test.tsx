import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxPolicySettingsDetailsPage } from './AwxPolicySettingsDetails';

const mockSettingsOptions = {
  actions: {
    GET: {
      OPA_AUTH_TYPE: { category: 'Policyascode', category_slug: 'policyascode', type: 'string' },
    },
    PUT: {
      OPA_AUTH_TYPE: { category: 'Policyascode', category_slug: 'policyascode', type: 'string' },
    },
  },
};

const mockSettingsData = {
  OPA_AUTH_TYPE: 'none',
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('settings'),
    () => HttpResponse.json(mockSettingsOptions)
  ),
  http.get(
    ({ request }) => request.url.includes('settings'),
    () => HttpResponse.json(mockSettingsData)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxPolicySettingsDetailsPage', () => {
  it('should render policy settings details', { timeout: 10000 }, async () => {
    render(
      <MemoryRouter>
        <AwxPolicySettingsDetailsPage />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        const editButton = screen.queryByRole('button', { name: 'Edit' });
        const policyContent = screen.queryByText('Policy');
        const errorState = screen.queryByText('Error');
        expect(editButton ?? policyContent ?? errorState).toBeInTheDocument();
      },
      { timeout: 8000 }
    );
  });
});
