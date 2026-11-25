import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { PlatformActiveUserProvider } from './PlatformActiveUserProvider';
import { PlatformLogin } from './PlatformLogin';

const capturedLoginProps: Record<string, unknown>[] = [];

vi.mock('@ansible/common-ui/AnsibleLogin/AnsibleLogin', () => ({
  AnsibleLogin: (props: Record<string, unknown>) => {
    capturedLoginProps.push(props);
    return (
      <div data-testid="ansible-login">
        {(props.authOptions as { name: string; type: string }[] | undefined)?.map((option) => (
          <button key={option.type} type="button">
            {option.name}
          </button>
        ))}
        {props.brandImg as React.ReactNode}
      </div>
    );
  },
}));

const defaultUiAuth = {
  show_login_form: true,
  ssos: [
    {
      name: 'Github OAuth',
      type: 'ansible_base.authentication.authenticator_plugins.github',
    },
  ],
};

const server = setupServer(
  http.get(gatewayAPI`/ui_auth/`, () => HttpResponse.json(defaultUiAuth)),
  http.get(gatewayAPI`/me/`, () => HttpResponse.json({ count: 0, results: [] }))
);

function renderPlatformLogin() {
  return render(
    <PlatformActiveUserProvider>
      <PlatformLogin>
        <div data-testid="platform-main-internal" />
      </PlatformLogin>
    </PlatformActiveUserProvider>
  );
}

describe('PlatformLogin', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    capturedLoginProps.length = 0;
  });
  afterAll(() => server.close());

  it('should render correct AAP SSO options', async () => {
    renderPlatformLogin();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Github OAuth' })).toBeInTheDocument();
    });
    expect(screen.getByTestId('ansible-login')).toBeInTheDocument();
  });

  it('should render children when an active platform user is present', async () => {
    server.use(
      http.get(gatewayAPI`/me/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 1, username: 'admin' }],
        })
      )
    );

    renderPlatformLogin();

    await waitFor(() => {
      expect(screen.getByTestId('platform-main-internal')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('ansible-login')).not.toBeInTheDocument();
  });

  it('should use a custom logo image when ui_auth provides custom_logo', async () => {
    server.use(
      http.get(gatewayAPI`/ui_auth/`, () =>
        HttpResponse.json({
          ...defaultUiAuth,
          custom_logo: 'data:image/png;base64,abc',
        })
      )
    );

    renderPlatformLogin();

    await waitFor(() => {
      expect(screen.getByAltText('Custom logo')).toBeInTheDocument();
    });
  });

  it('passes undefined authOptions when ui_auth has no SSO providers', async () => {
    server.use(
      http.get(gatewayAPI`/ui_auth/`, () =>
        HttpResponse.json({
          show_login_form: true,
          ssos: [],
        })
      )
    );

    renderPlatformLogin();

    await waitFor(() => {
      expect(capturedLoginProps.at(-1)?.authOptions).toBeUndefined();
    });
  });

  it('passes login_redirect_override to AnsibleLogin', async () => {
    server.use(
      http.get(gatewayAPI`/ui_auth/`, () =>
        HttpResponse.json({
          ...defaultUiAuth,
          login_redirect_override: 'https://sso.example.com/start',
        })
      )
    );

    renderPlatformLogin();

    await waitFor(() => {
      expect(capturedLoginProps.at(-1)?.externalLoginUrl).toBe('https://sso.example.com/start');
    });
  });
});
