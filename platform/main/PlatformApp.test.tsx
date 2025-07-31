import { AwxConfigProvider } from '@ansible/awx-ui/common/useAwxConfig';
import { render, screen, waitFor } from '@testing-library/react';
import i18n, { t } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SWRConfig } from 'swr';
import { beforeAll, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import * as GatewayUIAuth from './GatewayUIAuth';
import { PlatformApp } from './PlatformApp';

// Mock fetch globally
global.fetch = vi.fn();

// Mock only the problematic components while preserving banner logic
vi.mock('@ansible/ansible-ui-framework', () => ({
  PageApp: ({ banner, children }: { banner: React.ReactNode; children: React.ReactNode }) => (
    <div data-testid="page-app">
      {banner}
      {children}
    </div>
  ),
}));

vi.mock('./PlatformMasthead', () => ({
  PlatformMasthead: () => <div data-testid="platform-masthead">{t`PlatformMasthead`}</div>,
}));

vi.mock('./persona-view/PersonaViewSwitcher', () => ({
  PersonaViewSwitcher: () => (
    <div data-testid="persona-view-switcher">{t`PersonaViewSwitcher`}</div>
  ),
}));

vi.mock('../settings/ui-flags/useUIFlag', () => ({
  useUIFlag: () => ({ enabled: false }),
}));

// Mock only what's needed to prevent import errors
vi.mock('./usePlatformNavigation', () => ({
  usePlatformNavigation: () => [],
}));

vi.mock('../hooks/useUserInteraction', () => ({
  useUserInteraction: () => ({}),
}));

const mountPlatformApp = (component: React.ReactNode) => {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <AwxConfigProvider>{component}</AwxConfigProvider>
    </SWRConfig>
  );
};

interface ManagedCloudStub {
  returns: (value: boolean) => ManagedCloudStub;
}

describe('Platform Subscription and Session Validation Tests', () => {
  let useIsManagedCloudStub: MockInstance & ManagedCloudStub;
  let fetchMock: MockInstance;

  beforeAll(async () => {
    // Simple i18n mock that returns the key with interpolated values
    await i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      // Simple fallback that returns the key with interpolated values
      returnNull: false,
      returnEmptyString: false,
    });

    // Mock the t function to handle interpolation
    vi.spyOn(i18n, 't').mockImplementation(((...args: unknown[]): string => {
      const [key, ...rest] = args;
      const keyStr = Array.isArray(key) ? (key[0] as string) : (key as string);
      if (typeof keyStr !== 'string') return String(keyStr);

      // Handle different argument patterns
      let options: Record<string, unknown> = {};
      if (rest.length > 0) {
        if (typeof rest[0] === 'string') {
          // [key, defaultValue, options?] pattern
          options = (rest[1] as Record<string, unknown>) || {};
        } else {
          // [key, options] pattern
          options = (rest[0] as Record<string, unknown>) || {};
        }
      }

      // Handle simple interpolation
      return keyStr.replace(/\{\{(\w+)\}\}/g, (_, prop: string) => {
        return (options[prop] as string) || `{{${prop}}}`;
      });
    }) as unknown as typeof i18n.t);
  });

  beforeEach(() => {
    fetchMock = vi.mocked(fetch);
    fetchMock.mockClear();

    useIsManagedCloudStub = vi
      .spyOn(GatewayUIAuth, 'useIsManagedCloudInstall')
      .mockReturnValue(false) as MockInstance & ManagedCloudStub;

    // Add the returns method to match Cypress stub interface
    useIsManagedCloudStub.returns = (value: boolean) => {
      useIsManagedCloudStub.mockReturnValue(value);
      return useIsManagedCloudStub;
    };

    // Default intercepts matching the original Cypress test
    fetchMock.mockImplementation((url: string | URL) => {
      const urlString = url.toString();

      // Handle both possible AWX API prefixes
      if (
        urlString.includes('/config/') &&
        (urlString.includes('/api/controller/v2/') || urlString.includes('/api/v2/'))
      ) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              license_info: {
                compliant: true,
                grace_period_remaining: 54672800,
                time_remaining: 100 * 24 * 60 * 60,
              },
            }),
        } as Response);
      }

      if (urlString.includes('/api/gateway/v1/session/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ expires_in_seconds: 3600 }),
        } as Response);
      }

      return Promise.reject(new Error(`Unmocked URL: ${urlString}`));
    });
  });

  describe('Subscription Banners', () => {
    it('should not display any subscription banners if license info is compliant', async () => {
      mountPlatformApp(<PlatformApp />);

      // Check that no subscription banners are displayed
      await waitFor(() => {
        expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      });
    });

    it('should display a gold banner if the subscription will expire in less than 15 days', async () => {
      // Override the config intercept for this test
      fetchMock.mockImplementation((url: string | URL) => {
        const urlString = url.toString();

        if (
          urlString.includes('/config/') &&
          (urlString.includes('/api/controller/v2/') || urlString.includes('/api/v2/'))
        ) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                license_info: {
                  compliant: true,
                  time_remaining: 14 * 24 * 60 * 60,
                },
              }),
          } as Response);
        }

        if (urlString.includes('/api/gateway/v1/session/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ expires_in_seconds: 3600 }),
          } as Response);
        }

        return Promise.reject(new Error(`Unmocked URL: ${urlString}`));
      });

      mountPlatformApp(<PlatformApp />);

      // Check for subscription expiry banner
      await waitFor(() => {
        const banner = screen.getByText('Your subscription will expire in 14 days.');
        expect(banner).toBeInTheDocument();
      });
    });

    it('should display a red banner with no grace period if the subscription is not compliant', async () => {
      // Override the config intercept for this test
      fetchMock.mockImplementation((url: string | URL) => {
        const urlString = url.toString();

        if (
          urlString.includes('/config/') &&
          (urlString.includes('/api/controller/v2/') || urlString.includes('/api/v2/'))
        ) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                license_info: {
                  compliant: false,
                  grace_period_remaining: 0,
                },
              }),
          } as Response);
        }

        if (urlString.includes('/api/gateway/v1/session/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ expires_in_seconds: 3600 }),
          } as Response);
        }

        return Promise.reject(new Error(`Unmocked URL: ${urlString}`));
      });

      mountPlatformApp(<PlatformApp />);

      // Check for subscription out of compliance banner
      await waitFor(() => {
        const banner = screen.getByText('Your subscription is out of compliance.');
        expect(banner).toBeInTheDocument();
      });
    });

    it('should display a red banner with grace period if the subscription is not compliant', async () => {
      // Override the config intercept for this test
      fetchMock.mockImplementation((url: string | URL) => {
        const urlString = url.toString();

        if (
          urlString.includes('/config/') &&
          (urlString.includes('/api/controller/v2/') || urlString.includes('/api/v2/'))
        ) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                license_info: {
                  compliant: false,
                  grace_period_remaining: 2 * 24 * 60 * 60,
                },
              }),
          } as Response);
        }

        if (urlString.includes('/api/gateway/v1/session/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ expires_in_seconds: 3600 }),
          } as Response);
        }

        return Promise.reject(new Error(`Unmocked URL: ${urlString}`));
      });

      mountPlatformApp(<PlatformApp />);

      // Check for subscription grace period banner
      await waitFor(() => {
        const banner = screen.getByText(
          'Your subscription is out of compliance. 2 days grace period remaining.'
        );
        expect(banner).toBeInTheDocument();
      });
    });

    it('should not display any subscription banners when managedCloudInstall is true', async () => {
      useIsManagedCloudStub.returns(true);

      // Override the config intercept for this test
      fetchMock.mockImplementation((url: string | URL) => {
        const urlString = url.toString();

        if (
          urlString.includes('/config/') &&
          (urlString.includes('/api/controller/v2/') || urlString.includes('/api/v2/'))
        ) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                license_info: {
                  compliant: false,
                  grace_period_remaining: 2 * 24 * 60 * 60,
                },
              }),
          } as Response);
        }

        if (urlString.includes('/api/gateway/v1/session/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ expires_in_seconds: 3600 }),
          } as Response);
        }

        return Promise.reject(new Error(`Unmocked URL: ${urlString}`));
      });

      mountPlatformApp(<PlatformApp />);

      // Check that no subscription banners are displayed when managed cloud is enabled
      await waitFor(() => {
        expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Session Banner', () => {
    it('should fetch the session data and display the session expiry warning', async () => {
      // Override the session intercept for this test
      fetchMock.mockImplementation((url: string | URL) => {
        const urlString = url.toString();

        if (
          urlString.includes('/config/') &&
          (urlString.includes('/api/controller/v2/') || urlString.includes('/api/v2/'))
        ) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                license_info: {
                  compliant: true,
                  grace_period_remaining: 54672800,
                  time_remaining: 100 * 24 * 60 * 60,
                },
              }),
          } as Response);
        }

        if (urlString.includes('/api/gateway/v1/session/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ expires_in_seconds: 199 }),
          } as Response);
        }

        return Promise.reject(new Error(`Unmocked URL: ${urlString}`));
      });

      mountPlatformApp(<PlatformApp />);

      // Check for session expiry banner and button
      await waitFor(() => {
        const banner = screen.getByText('Your session will expire in 3 minutes.');
        expect(banner).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Refresh session' })).toBeInTheDocument();
    });
  });
});
