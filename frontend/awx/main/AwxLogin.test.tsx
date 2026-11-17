import { SwrTestWrapper } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../common/api/awx-utils';
import type { AwxUser } from '../interfaces/User';

const activeUserState: {
  activeAwxUser: AwxUser | null | undefined;
  refreshActiveAwxUser: ReturnType<typeof vi.fn>;
} = {
  activeAwxUser: undefined,
  refreshActiveAwxUser: vi.fn(),
};

vi.mock('../common/useAwxActiveUser', () => ({
  useAwxActiveUser: () => activeUserState,
}));

vi.mock('../common/useAwxConfig', () => ({
  AwxConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../common/useAwxWebSocket', () => ({
  WebSocketProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@ansible/common-ui/utils/useDocsVersion', () => ({
  DocsVersionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@ansible/common-ui/AnsibleLogin/AnsibleLogin', () => ({
  AnsibleLogin: ({
    loginApiUrl,
    onSuccess,
    brandImg,
    authOptions,
  }: {
    loginApiUrl: string;
    onSuccess: () => void;
    brandImg?: React.ReactNode;
    authOptions?: { login_url: string; type: string }[];
  }) => (
    <div>
      <span>login-form</span>
      <span>{loginApiUrl}</span>
      <span>{brandImg}</span>
      {authOptions?.map((option) => (
        <span key={option.type}>{`${option.type}:${option.login_url}`}</span>
      ))}
      <button type="button" onClick={onSuccess}>
        complete-login
      </button>
    </div>
  ),
}));

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    mutate: vi.fn(),
  };
});

import { AwxLogin } from './AwxLogin';

const server = setupServer(
  http.get(awxAPI`/auth/`, () => HttpResponse.json({ basic: { login_url: '/login/basic/' } }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderAwxLogin(ui: React.ReactElement) {
  return render(<SwrTestWrapper>{ui}</SwrTestWrapper>);
}

describe('AwxLogin', () => {
  it('renders a loading state while the active user is unknown', () => {
    activeUserState.activeAwxUser = undefined;

    renderAwxLogin(
      <AwxLogin>
        <div>protected</div>
      </AwxLogin>
    );

    expect(screen.queryByText('protected')).not.toBeInTheDocument();
    expect(screen.queryByText('login-form')).not.toBeInTheDocument();
  });

  it('renders the login form when there is no active user', async () => {
    activeUserState.activeAwxUser = null;
    const { mutate } = await import('swr');

    renderAwxLogin(
      <AwxLogin
        loginApiUrl="/custom/login/"
        brandImg="custom-logo"
        baseLoginUrl="https://awx.example"
      >
        <div>protected</div>
      </AwxLogin>
    );

    expect(screen.getByText('login-form')).toBeInTheDocument();
    expect(screen.getByText('/custom/login/')).toBeInTheDocument();
    expect(screen.getByText('custom-logo')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('basic:https://awx.example/login/basic/')).toBeInTheDocument();
    });
    expect(screen.queryByText('protected')).not.toBeInTheDocument();

    screen.getByRole('button', { name: 'complete-login' }).click();
    expect(activeUserState.refreshActiveAwxUser).toHaveBeenCalled();
    expect(mutate).toHaveBeenCalled();
  });

  it('renders children when an active user is present', () => {
    activeUserState.activeAwxUser = { id: 1, username: 'admin' } as AwxUser;

    renderAwxLogin(
      <AwxLogin>
        <div>protected</div>
      </AwxLogin>
    );

    expect(screen.getByText('protected')).toBeInTheDocument();
    expect(screen.queryByText('login-form')).not.toBeInTheDocument();
  });
});
