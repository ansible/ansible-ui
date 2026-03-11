import { AwxConfigProvider } from '@ansible/awx-ui/common/useAwxConfig';
import { render, screen, waitFor } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
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

  describe('Controller Down Banner', () => {
    const mockErrorFetch = (configStatus: number) => {
      fetchMock.mockImplementation((url: string | URL) => {
        const urlString = url.toString();

        if (
          urlString.includes('/config/') &&
          (urlString.includes('/api/controller/v2/') || urlString.includes('/api/v2/'))
        ) {
          return Promise.resolve({
            ok: false,
            status: configStatus,
            statusText: 'Error',
            headers: new Headers({ 'content-type': 'application/json' }),
            json: () => Promise.resolve({ detail: 'Error detail from server' }),
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
    };

    it('should display JWT/service key hint for 401 errors', async () => {
      mockErrorFetch(401);
      mountPlatformApp(<PlatformApp />);

      await waitFor(() => {
        expect(screen.getByTestId('controller-down-banner')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/HTTP 401:.*misconfigured JWT key or service key/)
      ).toBeInTheDocument();
    });

    it('should display unavailable message for 502 errors', async () => {
      mockErrorFetch(502);
      mountPlatformApp(<PlatformApp />);

      await waitFor(() => {
        expect(screen.getByTestId('controller-down-banner')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/HTTP 502:.*Controller service appears to be unavailable/)
      ).toBeInTheDocument();
    });

    it('should display unavailable message for 503 errors', async () => {
      mockErrorFetch(503);
      mountPlatformApp(<PlatformApp />);

      await waitFor(() => {
        expect(screen.getByTestId('controller-down-banner')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/HTTP 503:.*Controller service appears to be unavailable/)
      ).toBeInTheDocument();
    });

    it('should display not responding message for 504 errors', async () => {
      mockErrorFetch(504);
      mountPlatformApp(<PlatformApp />);

      await waitFor(() => {
        expect(screen.getByTestId('controller-down-banner')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/HTTP 504:.*Controller service is not responding/)
      ).toBeInTheDocument();
    });

    it('should display generic message for other error status codes', async () => {
      mockErrorFetch(500);
      mountPlatformApp(<PlatformApp />);

      await waitFor(() => {
        expect(screen.getByTestId('controller-down-banner')).toBeInTheDocument();
      });

      expect(screen.getByText(/HTTP 500:.*Error connecting to Controller API/)).toBeInTheDocument();
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
