import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { GatewayUIAuthProvider, useGatewayUIAuth, useIsManagedCloudInstall } from './GatewayUIAuth';

const uiAuth = {
  show_login_form: true,
  passwords: [],
  ssos: [],
  login_redirect_override: '',
  custom_login_info: '',
  custom_logo: '',
  managed_cloud_install: true,
  legacy_automation_hub_sso_url: '',
  legacy_controller_sso_url: '',
  legacy_auth_enabled: false,
};

const server = setupServer(http.get(gatewayAPI`/ui_auth/`, () => HttpResponse.json(uiAuth)));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function ManagedCloudFlag() {
  const isManaged = useIsManagedCloudInstall();
  return <span data-testid="managed-flag">{String(isManaged)}</span>;
}

function AuthConsumer() {
  const auth = useGatewayUIAuth();
  return <span data-testid="login-form">{String(auth?.show_login_form)}</span>;
}

describe('GatewayUIAuthProvider', () => {
  it('provides ui_auth data to context consumers', async () => {
    render(
      <GatewayUIAuthProvider>
        <AuthConsumer />
        <ManagedCloudFlag />
      </GatewayUIAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('managed-flag')).toHaveTextContent('true');
  });
});
