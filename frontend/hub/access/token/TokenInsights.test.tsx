import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenInsights } from './TokenInsights';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
  const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
    <textarea
      id={props.id as string}
      name={props.id as string}
      value={props.value as string}
      onChange={props.onChange as () => void}
      className={props.className as string}
      onFocus={props.onFocus as () => void}
      onBlur={props.onBlur as () => void}
    />
  ));
  return { DataEditor: FakeDataEditor };
});

const mockTokenData = {
  access_token: 'mock-access-token',
  expires_in: 3600,
  id_token: 'mock-id-token',
  refresh_expires_in: 2592000,
  refresh_token: 'mock-refresh-token-abc123',
  scope: 'openid',
  session_state: 'mock-session-state',
  token_type: 'Bearer',
};

describe('TokenInsights Component', () => {
  const mockDoOffline = vi.fn();
  const mockGetOfflineToken = vi.fn();

  beforeEach(() => {
    // Reset mocks
    mockDoOffline.mockReset();
    mockGetOfflineToken.mockReset();

    // Default: token not loaded yet (getOfflineToken rejects)
    mockGetOfflineToken.mockRejectedValue(new Error('Token not available'));

    // Setup window.insights mock
    (globalThis as typeof globalThis & { insights?: unknown }).insights = {
      chrome: {
        auth: {
          doOffline: mockDoOffline,
          getOfflineToken: mockGetOfflineToken,
        },
      },
    };
  });

  afterEach(() => {
    // Clean up window.insights
    delete (globalThis as typeof globalThis & { insights?: unknown }).insights;
    vi.clearAllMocks();
  });

  it('should render the page with Connect to Hub title', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Connect to Hub' })).toBeInTheDocument();
  });

  it('should render all main sections', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    // Check all section headings are present
    expect(
      screen.getByRole('heading', { name: 'Connect Private Automation Hub' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Connect the ansible-galaxy client' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Offline token' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Manage tokens' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Server URL' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SSO URL' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CRC public key' })).toBeInTheDocument();
  });

  it('should render Load token button when token is not loaded', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    const loadTokenButton = screen.getByTestId('load-token');
    expect(loadTokenButton).toBeInTheDocument();
    expect(loadTokenButton).toHaveTextContent('Load token');
  });

  it('should call doOffline when Load token button is clicked', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    const loadTokenButton = screen.getByTestId('load-token');
    fireEvent.click(loadTokenButton);

    expect(mockDoOffline).toHaveBeenCalledTimes(1);
  });

  it('should display token when getOfflineToken succeeds', async () => {
    mockGetOfflineToken.mockResolvedValue({ data: mockTokenData });

    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    // Wait for token to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('offline-token')).toBeInTheDocument();
    });

    // Token should be displayed
    expect(screen.getByText(mockTokenData.refresh_token)).toBeInTheDocument();

    // Load token button should not be visible
    expect(screen.queryByTestId('load-token')).not.toBeInTheDocument();
  });

  it('should render the renewal command section when token not loaded', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    const renewCommand = screen.getByTestId('renew-token-command');
    expect(renewCommand).toBeInTheDocument();
  });

  it('should render the renewal command section when token is loaded', async () => {
    mockGetOfflineToken.mockResolvedValue({ data: mockTokenData });

    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('offline-token')).toBeInTheDocument();
    });

    const renewCommand = screen.getByTestId('renew-token-command');
    expect(renewCommand).toBeInTheDocument();
  });

  it('should render Server URL section with certified and validated URLs', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    expect(screen.getByTestId('certified-url')).toBeInTheDocument();
    expect(screen.getByTestId('validated-url')).toBeInTheDocument();
  });

  it('should render SSO URL', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    const ssoUrl = screen.getByTestId('sso-url');
    expect(ssoUrl).toBeInTheDocument();
    expect(ssoUrl).toHaveTextContent(
      'https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token'
    );
  });

  it('should render external links for documentation', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    // Check for external links (they should have target="_blank")
    const externalLinks = screen.getAllByRole('link');
    expect(externalLinks.length).toBeGreaterThan(0);

    // Check that at least one link points to the token management page
    const tokenManagementLink = externalLinks.find((link) =>
      link.getAttribute('href')?.includes('sso.redhat.com')
    );
    expect(tokenManagementLink).toBeInTheDocument();
  });

  it('should not call insights APIs when window.insights is not available', () => {
    // Remove window.insights
    delete (globalThis as typeof globalThis & { insights?: unknown }).insights;

    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    // Should still render the component without errors
    expect(screen.getByRole('heading', { name: 'Connect to Hub' })).toBeInTheDocument();

    // Load token button should be visible
    const loadTokenButton = screen.getByTestId('load-token');
    expect(loadTokenButton).toBeInTheDocument();

    // Clicking should not throw error
    fireEvent.click(loadTokenButton);

    // APIs should not be called
    expect(mockDoOffline).not.toHaveBeenCalled();
  });

  it('should call getOfflineToken on mount', () => {
    render(
      <MemoryRouter>
        <TokenInsights />
      </MemoryRouter>
    );

    expect(mockGetOfflineToken).toHaveBeenCalledTimes(1);
  });
});
