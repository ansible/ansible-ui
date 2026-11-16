/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Authenticator } from '../../../interfaces/Authenticator';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import authenticators from '../components/authenticators.fixture.json';
import { AuthenticatorPage } from './AuthenticatorPage';

const authenticator = authenticators.results[0] as unknown as Authenticator;

const server = setupServer(
  http.get(gatewayAPI`/authenticators/1/`, () => HttpResponse.json(authenticator)),
  http.options(gatewayAPI`/authenticators/1/`, () =>
    HttpResponse.json({ actions: { GET: {}, PATCH: {}, PUT: {} } })
  ),
  http.get(gatewayAPI`/authenticator_plugins/`, () => HttpResponse.json({ authenticators: [] }))
);

describe('AuthenticatorPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/access/authenticators/1']}>
        <Routes>
          <Route path="/access/authenticators/:id" element={<AuthenticatorPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('exports the AuthenticatorPage component', () => {
    expect(AuthenticatorPage).toBeDefined();
    expect(typeof AuthenticatorPage).toBe('function');
  });

  it('renders authenticator title and tabs when data loads', async () => {
    renderComponent();

    expect(await screen.findByTestId('page-title')).toHaveTextContent(
      'Local Database Authenticator'
    );
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Mapping')).toBeInTheDocument();
    expect(screen.getByText('Back to Authentication Methods')).toBeInTheDocument();
  });

  it('renders error state when authenticator fetch fails', async () => {
    server.use(
      http.get(gatewayAPI`/authenticators/1/`, () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    });
  });
});
