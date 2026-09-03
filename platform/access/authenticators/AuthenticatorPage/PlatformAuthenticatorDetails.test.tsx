/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Authenticator } from '../../../interfaces/Authenticator';
import type { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import authenticator_plugins from '../components/authenticatorPlugins.fixture.json';
import authenticators from '../components/authenticators.fixture.json';
import { PlatformAuthenticatorDetails } from './PlatformAuthenticatorDetails';

const localAuthenticator = {
  ...authenticators.results[0],
  enabled: true,
  create_objects: true,
  remove_users: false,
} as unknown as Authenticator;

const server = setupServer(
  http.get(gatewayAPI`/authenticators/1/`, () => {
    return HttpResponse.json(localAuthenticator);
  }),
  http.get(gatewayAPI`/authenticators/`, () => {
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.get(gatewayAPI`/authenticator_plugins/`, () => {
    return HttpResponse.json(authenticator_plugins as AuthenticatorPlugins);
  })
);

describe('PlatformAuthenticatorDetails', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/access/authenticators/1/details']}>
        <Routes>
          <Route
            path="/access/authenticators/:id/details"
            element={<PlatformAuthenticatorDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

  it('exports the PlatformAuthenticatorDetails component', () => {
    expect(PlatformAuthenticatorDetails).toBeDefined();
    expect(typeof PlatformAuthenticatorDetails).toBe('function');
  });

  it('displays authenticator option fields on the details page', async () => {
    renderComponent();

    expect(await screen.findByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Create objects')).toBeInTheDocument();
    expect(screen.getByText('Remove users')).toBeInTheDocument();
    expect(screen.getAllByText('On')).toHaveLength(2);
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('displays Off when all authenticator options are disabled', async () => {
    server.use(
      http.get(gatewayAPI`/authenticators/1/`, () => {
        return HttpResponse.json({
          ...localAuthenticator,
          enabled: false,
          create_objects: false,
          remove_users: false,
        });
      })
    );

    renderComponent();

    expect(await screen.findByText('Enabled')).toBeInTheDocument();
    expect(screen.getAllByText('Off')).toHaveLength(3);
  });
});
