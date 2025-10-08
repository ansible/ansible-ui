import { render, screen } from '@testing-library/react';
import { t } from 'i18next';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { setEdaApiPath } from '@ansible/eda-ui/common/eda-utils';
import { PlatformOverview } from './PlatformOverview';

// Mock dependencies
vi.mock('../main/GatewayServices', () => ({
  useHasAwxService: () => true,
  useHasEdaService: () => true,
}));

vi.mock('./useManagedPlatformOverview', () => ({
  useManagedPlatformOverview: () => ({
    openManageDashboard: vi.fn(),
    managedResources: [
      { id: 'counts', name: 'Resource counts' },
      { id: 'job_activity', name: 'Job activity' },
      { id: 'recent-rulebook-activations' },
      { id: 'recent-rule-audits' },
      { id: 'recent-decision-environments' },
    ],
  }),
}));

// Mock all the card components
vi.mock('./cards/PlatformCountsCard', () => ({
  PlatformCountsCard: () => (
    <div data-testid="platform-counts-card">{t('Platform Counts Card')}</div>
  ),
}));

vi.mock('@ansible/awx-ui/overview/cards/AwxJobActivityCard', () => ({
  AwxJobActivityCard: () => <div data-testid="awx-job-activity-card">{t('Job Activity Card')}</div>,
}));

// Mock window.location for redirects
const mockLocationHref = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
  configurable: true,
});
Object.defineProperty(window.location, 'href', {
  set: mockLocationHref,
  configurable: true,
});

describe('PlatformOverview', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockLocationHref.mockClear();
  });

  it('should render overview page normally when no sessionStorage redirect URL', () => {
    render(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to the Ansible Automation Platform')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Empower, automate, connect: Unleash possibilities with the Ansible Automation Platform.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Manage view')).toBeInTheDocument();
  });

  it('should redirect when sessionStorage contains social auth redirect URL', () => {
    const redirectUrl = '/execution/projects?page=1&perPage=10&sort=name';
    sessionStorage.setItem('social_auth_redirect_url', redirectUrl);

    render(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    // Should redirect to the stored URL
    expect(mockLocationHref).toHaveBeenCalledWith(redirectUrl);

    // Should clear the sessionStorage after redirect
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBeNull();
  });

  it('should redirect to complex URLs with query parameters', () => {
    const redirectUrl = '/platform/users?page=3&sort=username&filter=active&organization=1';
    sessionStorage.setItem('social_auth_redirect_url', redirectUrl);

    render(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    expect(mockLocationHref).toHaveBeenCalledWith(redirectUrl);
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBeNull();
  });

  it('should redirect to paths with special characters', () => {
    const redirectUrl = '/platform/organizations/Test%20Org/details';
    sessionStorage.setItem('social_auth_redirect_url', redirectUrl);

    render(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    expect(mockLocationHref).toHaveBeenCalledWith(redirectUrl);
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBeNull();
  });

  it('should handle empty sessionStorage redirect URL gracefully', () => {
    sessionStorage.setItem('social_auth_redirect_url', '');

    render(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    // Should not redirect for empty string
    expect(mockLocationHref).not.toHaveBeenCalled();
    expect(screen.getByText('Welcome to the Ansible Automation Platform')).toBeInTheDocument();
  });

  it('should not clear sessionStorage for empty redirect URLs (correct behavior)', () => {
    sessionStorage.setItem('social_auth_redirect_url', '');

    render(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    // Should not redirect for empty string and should leave sessionStorage as-is
    expect(mockLocationHref).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBe('');
    expect(screen.getByText('Welcome to the Ansible Automation Platform')).toBeInTheDocument();
  });

  it('should only redirect once - not on re-renders', () => {
    const redirectUrl = '/execution/projects';
    sessionStorage.setItem('social_auth_redirect_url', redirectUrl);

    const { rerender } = render(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    // First render should redirect
    expect(mockLocationHref).toHaveBeenCalledTimes(1);
    expect(mockLocationHref).toHaveBeenCalledWith(redirectUrl);

    // Clear the mock and rerender
    mockLocationHref.mockClear();

    rerender(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    // Should not redirect again since sessionStorage was cleared
    expect(mockLocationHref).not.toHaveBeenCalled();
  });

  it('should render dashboard cards when no redirect needed', () => {
    render(
      <MemoryRouter>
        <PlatformOverview />
      </MemoryRouter>
    );

    expect(screen.getByTestId('platform-counts-card')).toBeInTheDocument();
    expect(screen.getByTestId('awx-job-activity-card')).toBeInTheDocument();
  });

  describe('SAML Redirect Integration', () => {
    it('should complete the full SAML redirect flow', () => {
      // Simulate the sessionStorage being set by SocialAuthLogin
      const originalUrl = '/platform/access/users?page=2&sort=username';
      sessionStorage.setItem('social_auth_redirect_url', originalUrl);

      // Simulate landing on overview page after OAuth
      render(
        <MemoryRouter initialEntries={['/overview']}>
          <PlatformOverview />
        </MemoryRouter>
      );

      // Should redirect back to original URL
      expect(mockLocationHref).toHaveBeenCalledWith(originalUrl);

      // Should clean up sessionStorage
      expect(sessionStorage.getItem('social_auth_redirect_url')).toBeNull();
    });

    it('should handle multiple authentication types redirect URLs', () => {
      const testCases = [
        '/execution/projects',
        '/automation/collections',
        '/platform/settings/authenticators',
        '/automation/analytics/clusters',
      ];

      testCases.forEach((url) => {
        // Clear and setup for each test case
        sessionStorage.clear();
        mockLocationHref.mockClear();

        sessionStorage.setItem('social_auth_redirect_url', url);

        const { unmount } = render(
          <MemoryRouter>
            <PlatformOverview />
          </MemoryRouter>
        );

        expect(mockLocationHref).toHaveBeenCalledWith(url);
        expect(sessionStorage.getItem('social_auth_redirect_url')).toBeNull();

        unmount();
      });
    });
  });

  describe('Platform EDA overview cards', () => {
    const server = setupServer();

    beforeAll(() => {
      setEdaApiPath('/api/eda/v1');
      server.listen({ onUnhandledRequest: 'error' });
    });

    afterAll(() => {
      server.close();
    });

    it('should display EDA cards in platform overview', () => {
      server.use(
        http.get(edaAPI`/activations/`, () =>
          HttpResponse.json({
            count: 0,
            results: [],
            next: null,
            previous: null,
          })
        ),
        http.get(edaAPI`/decision-environments/`, () =>
          HttpResponse.json({
            count: 0,
            results: [],
            next: null,
            previous: null,
          })
        ),
        http.get(edaAPI`/audit-rules/`, () =>
          HttpResponse.json({
            count: 0,
            results: [],
            next: null,
            previous: null,
          })
        )
      );
      render(
        <MemoryRouter>
          <PlatformOverview />
        </MemoryRouter>
      );

      expect(screen.getByText('Rulebook Activations')).toBeInTheDocument();
      expect(screen.getByText('Recently updated rulebook activations')).toBeInTheDocument();

      expect(screen.getByText('Rule Audit')).toBeInTheDocument();
      expect(screen.getByText('Recently fired rules')).toBeInTheDocument();

      expect(screen.getByText('Decision Environments')).toBeInTheDocument();
      expect(screen.getByText('Recently updated decision environments')).toBeInTheDocument();
    });
  });
});
