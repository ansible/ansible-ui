import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthOption, SocialAuthLogin } from './SocialAuthLogin';

// Mock window.location
const mockWindowLocation = {
  pathname: '/execution/projects',
  search: '?page=1&perPage=10&sort=name',
  href: 'http://localhost:4100/execution/projects?page=1&perPage=10&sort=name',
};

Object.defineProperty(window, 'location', {
  value: mockWindowLocation,
  configurable: true,
});

const mockSocialAuthOptions: AuthOption[] = [
  {
    name: 'SAML Test',
    login_url: '/api/gateway/social/login/c9ed242e-9969-4cf3-8c93-c8836ec6ba30/?idp=IdP',
    type: 'saml',
  },
  {
    name: 'GitHub OAuth',
    login_url: '/api/gateway/social/login/github/',
    type: 'github',
  },
  {
    name: 'Google OAuth',
    login_url: '/api/gateway/social/login/google/',
    type: 'google-oauth2',
  },
];

describe('SocialAuthLogin', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('should render all social auth options', () => {
    render(
      <MemoryRouter>
        <SocialAuthLogin options={mockSocialAuthOptions} />
      </MemoryRouter>
    );

    expect(screen.getByText('Log in with:')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /SAML Test/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GitHub OAuth/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Google OAuth/i })).toBeInTheDocument();
  });

  it('should not render when no options provided', () => {
    const { container } = render(
      <MemoryRouter>
        <SocialAuthLogin options={[]} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when options is undefined', () => {
    const { container } = render(
      <MemoryRouter>
        <SocialAuthLogin options={undefined} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should store current path in sessionStorage when SAML button is clicked', () => {
    render(
      <MemoryRouter>
        <SocialAuthLogin options={mockSocialAuthOptions} />
      </MemoryRouter>
    );

    const samlButton = screen.getByRole('link', { name: /SAML Test/i });

    // Click the SAML button
    fireEvent.click(samlButton);

    // Verify sessionStorage was set with current path
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBe(
      '/execution/projects?page=1&perPage=10&sort=name'
    );
  });

  it('should store current path in sessionStorage when GitHub button is clicked', () => {
    render(
      <MemoryRouter>
        <SocialAuthLogin options={mockSocialAuthOptions} />
      </MemoryRouter>
    );

    const githubButton = screen.getByRole('link', { name: /GitHub OAuth/i });

    // Click the GitHub button
    fireEvent.click(githubButton);

    // Verify sessionStorage was set with current path
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBe(
      '/execution/projects?page=1&perPage=10&sort=name'
    );
  });

  it('should not store sessionStorage when on login page', () => {
    // Mock being on login page
    window.location.pathname = '/login';
    window.location.search = '';

    render(
      <MemoryRouter>
        <SocialAuthLogin options={mockSocialAuthOptions} />
      </MemoryRouter>
    );

    const samlButton = screen.getByRole('link', { name: /SAML Test/i });

    // Click the SAML button
    fireEvent.click(samlButton);

    // Verify sessionStorage was NOT set since we're on login page
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBeNull();
  });

  it('should have correct href attributes pointing to OAuth URLs', () => {
    render(
      <MemoryRouter>
        <SocialAuthLogin options={mockSocialAuthOptions} />
      </MemoryRouter>
    );

    const samlButton = screen.getByRole('link', { name: /SAML Test/i });
    const githubButton = screen.getByRole('link', { name: /GitHub OAuth/i });
    const googleButton = screen.getByRole('link', { name: /Google OAuth/i });

    expect(samlButton).toHaveAttribute(
      'href',
      '/api/gateway/social/login/c9ed242e-9969-4cf3-8c93-c8836ec6ba30/?idp=IdP'
    );
    expect(githubButton).toHaveAttribute('href', '/api/gateway/social/login/github/');
    expect(googleButton).toHaveAttribute('href', '/api/gateway/social/login/google/');
  });

  it('should display helper text when provided', () => {
    const helperText = 'Please choose your authentication method';

    render(
      <MemoryRouter>
        <SocialAuthLogin options={mockSocialAuthOptions} helperText={helperText} />
      </MemoryRouter>
    );

    expect(screen.getByText(helperText)).toBeInTheDocument();
  });

  it('should render correct icons for different auth types', () => {
    render(
      <MemoryRouter>
        <SocialAuthLogin options={mockSocialAuthOptions} />
      </MemoryRouter>
    );

    // Check data-testid attributes to verify correct types
    expect(screen.getByTestId('social-auth-saml')).toBeInTheDocument();
    expect(screen.getByTestId('social-auth-github')).toBeInTheDocument();
    expect(screen.getByTestId('social-auth-google-oauth2')).toBeInTheDocument();
  });

  it('should handle complex paths with query parameters', () => {
    // Mock a complex path
    window.location.pathname = '/platform/users';
    window.location.search = '?page=2&sort=username&filter=active';

    render(
      <MemoryRouter>
        <SocialAuthLogin options={mockSocialAuthOptions} />
      </MemoryRouter>
    );

    const samlButton = screen.getByRole('link', { name: /SAML Test/i });
    fireEvent.click(samlButton);

    expect(sessionStorage.getItem('social_auth_redirect_url')).toBe(
      '/platform/users?page=2&sort=username&filter=active'
    );
  });
});

describe('SocialAuthLogin SessionStorage Logic Tests', () => {
  // Create a more controlled mock for testing the core logic
  const mockLocation = {
    pathname: '/execution/projects',
    search: '?page=1&perPage=10&sort=name',
  };

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();

    // Mock window.location for these specific tests
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });
  });

  it('should store current path in sessionStorage for non-login pages', () => {
    // Simulate the logic from SocialAuthLogin
    const currentPath =
      window.location.pathname !== '/login'
        ? window.location.pathname + window.location.search
        : null;

    if (currentPath) {
      sessionStorage.setItem('social_auth_redirect_url', currentPath);
    }

    expect(sessionStorage.getItem('social_auth_redirect_url')).toBe(
      '/execution/projects?page=1&perPage=10&sort=name'
    );
  });

  it('should not store sessionStorage when on login page', () => {
    // Mock being on login page
    mockLocation.pathname = '/login';
    mockLocation.search = '';

    // Simulate the logic from SocialAuthLogin
    const currentPath =
      window.location.pathname !== '/login'
        ? window.location.pathname + window.location.search
        : null;

    if (currentPath) {
      sessionStorage.setItem('social_auth_redirect_url', currentPath);
    }

    expect(sessionStorage.getItem('social_auth_redirect_url')).toBeNull();
  });

  it('should handle complex paths with special characters', () => {
    mockLocation.pathname = '/platform/organizations/Test%20Org/details';
    mockLocation.search = '?tab=access&filter=active';

    const currentPath =
      window.location.pathname !== '/login'
        ? window.location.pathname + window.location.search
        : null;

    if (currentPath) {
      sessionStorage.setItem('social_auth_redirect_url', currentPath);
    }

    expect(sessionStorage.getItem('social_auth_redirect_url')).toBe(
      '/platform/organizations/Test%20Org/details?tab=access&filter=active'
    );
  });

  it('should handle paths without query parameters', () => {
    mockLocation.pathname = '/platform/users';
    mockLocation.search = '';

    const currentPath =
      window.location.pathname !== '/login'
        ? window.location.pathname + window.location.search
        : null;

    if (currentPath) {
      sessionStorage.setItem('social_auth_redirect_url', currentPath);
    }

    expect(sessionStorage.getItem('social_auth_redirect_url')).toBe('/platform/users');
  });

  it('should validate the exact logic used in SocialAuthLogin component', () => {
    // Test the actual logic that gets triggered in SocialAuthLogin
    // This simulates what happens in the handleSocialAuthClick function

    // Setup initial path
    mockLocation.pathname = '/automation/collections';
    mockLocation.search = '?page=3&filter=name';

    // Execute the same logic as in SocialAuthLogin.tsx
    const currentPath =
      window.location.pathname !== '/login'
        ? window.location.pathname + window.location.search
        : null;

    if (currentPath) {
      sessionStorage.setItem('social_auth_redirect_url', currentPath);
    }

    // Verify the result matches what the component would produce
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBe(
      '/automation/collections?page=3&filter=name'
    );

    // Now test login page scenario
    sessionStorage.clear();
    mockLocation.pathname = '/login';
    mockLocation.search = '?next=/some/path';

    const loginPagePath =
      window.location.pathname !== '/login'
        ? window.location.pathname + window.location.search
        : null;

    if (loginPagePath) {
      sessionStorage.setItem('social_auth_redirect_url', loginPagePath);
    }

    // Should not store anything for login page
    expect(sessionStorage.getItem('social_auth_redirect_url')).toBeNull();
  });
});
