import { AwxConfigProvider } from '@ansible/awx-ui/common/useAwxConfig';
import { render, screen, waitFor } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { beforeAll, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import * as GatewayUIAuth from './GatewayUIAuth';
import * as PlatformActiveUserModule from './PlatformActiveUserProvider';
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

// Mock only what's needed to prevent import errors
vi.mock('./usePlatformNavigation', () => ({
  usePlatformNavigation: () => [],
}));

const mountPlatformApp = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <AwxConfigProvider>{component}</AwxConfigProvider>
      </SWRConfig>
    </MemoryRouter>
  );
};

interface ManagedCloudStub {
  returns: (value: boolean) => ManagedCloudStub;
}

describe('Platform Subscription and Session Validation Tests', () => {
  let useIsManagedCloudStub: MockInstance & ManagedCloudStub;
  let usePlatformActiveUserStub: MockInstance;
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

    // Default to superuser so existing tests see banners
    usePlatformActiveUserStub = vi
      .spyOn(PlatformActiveUserModule, 'usePlatformActiveUser')
      .mockReturnValue({ activePlatformUser: { is_superuser: true } as never });

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

    it('should not display compliance banners for non-admin users', async () => {
      // Arrange: Set user as non-superuser
      usePlatformActiveUserStub.mockReturnValue({
        activePlatformUser: { is_superuser: false },
      });

      // Override the config intercept to return non-compliant license
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

      // Act
      mountPlatformApp(<PlatformApp />);

      // Assert: No compliance banner should be shown to non-admin users
      await waitFor(() => {
        expect(
          screen.queryByText(/Your subscription is out of compliance/)
        ).not.toBeInTheDocument();
      });
    });

    it('should display compliance banners only for admin users', async () => {
      // Arrange: Set user as superuser
      usePlatformActiveUserStub.mockReturnValue({
        activePlatformUser: { is_superuser: true },
      });

      // Override the config intercept to return non-compliant license
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

      // Act
      mountPlatformApp(<PlatformApp />);

      // Assert: Compliance banner should be shown to admin users
      await waitFor(() => {
        expect(
          screen.getByText('Your subscription is out of compliance. 2 days grace period remaining.')
        ).toBeInTheDocument();
      });
    });

    it('should not display subscription expiry banners for non-admin users', async () => {
      // Arrange: Set user as non-superuser
      usePlatformActiveUserStub.mockReturnValue({
        activePlatformUser: { is_superuser: false },
      });

      // Override the config intercept to return expiring subscription
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

      // Act
      mountPlatformApp(<PlatformApp />);

      // Assert: No expiry banner should be shown to non-admin users
      await waitFor(() => {
        expect(screen.queryByText(/Your subscription will expire/)).not.toBeInTheDocument();
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
