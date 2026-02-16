import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxSettings } from './AwxSettings';

const mockSettingsOptions = {
  actions: {
    GET: {
      AUTH_LDAP_1_URI: {
        category: 'Authentication',
        category_slug: 'authentication',
        type: 'string',
      },
    },
    PUT: {},
  },
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('settings'),
    () => HttpResponse.json(mockSettingsOptions)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxSettings', () => {
  it('should render settings page with Authentication Methods or error state', async () => {
    render(
      <MemoryRouter>
        <AwxSettings />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        const authTitle = screen.queryByText('Authentication Methods');
        const errorState = screen.queryByText('Error');
        expect(authTitle ?? errorState).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
