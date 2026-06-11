import { render, screen, waitFor } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import React from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { PlatformActiveUserProvider } from './PlatformActiveUserProvider';
import { PlatformLogin } from './PlatformLogin';
import { PlatformMainInternal } from './PlatformMain';

global.fetch = vi.fn();

vi.mock('@ansible/common-ui/AnsibleLogin/AnsibleLogin', () => ({
  AnsibleLogin: ({
    authOptions,
    children,
  }: {
    authOptions?: { name: string; type: string }[];
    children?: React.ReactNode;
  }) => (
    <div data-testid="ansible-login">
      {authOptions?.map((option) => <button key={option.type}>{option.name}</button>)}
      {children}
    </div>
  ),
}));

vi.mock('./PlatformActiveUserProvider', () => ({
  PlatformActiveUserProvider: ({ children }: { children: React.ReactNode }) => children,
  usePlatformActiveUser: () => ({ activePlatformUser: null }),
}));

vi.mock('./PlatformMain', () => ({
  PlatformMainInternal: () => <div data-testid="platform-main-internal" />,
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (url: string) => {
    if (url.includes('/ui_auth/')) {
      return {
        data: {
          show_login_form: true,
          ssos: [
            {
              name: 'Github OAuth',
              type: 'ansible_base.authentication.authenticator_plugins.github',
            },
          ],
        },
      };
    }
    return { data: undefined };
  },
}));

describe('PlatformLogin', () => {
  let fetchMock: MockInstance;

  beforeAll(async () => {
    await i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      debug: false,
      interpolation: { escapeValue: false },
    });
  });

  beforeEach(() => {
    fetchMock = vi.mocked(fetch);
    fetchMock.mockClear();

    render(
      <PlatformActiveUserProvider>
        <PlatformLogin>
          <PlatformMainInternal />
        </PlatformLogin>
      </PlatformActiveUserProvider>
    );
  });

  it('should render correct AAP SSO options', async () => {
    await waitFor(() => {
      const githubAuthButton = screen.getByRole('button', { name: 'Github OAuth' });
      expect(githubAuthButton).toBeInTheDocument();
    });
  });
});
