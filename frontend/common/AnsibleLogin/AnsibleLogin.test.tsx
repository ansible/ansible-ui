import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogin } from './AnsibleLogin';

const mockLocationReplace = vi.fn();
Object.defineProperty(globalThis, 'location', {
  value: { replace: mockLocationReplace },
  writable: true,
});

// Mock useFrameworkTranslations
vi.mock('@ansible/ansible-ui-framework', () => ({
  useFrameworkTranslations: () => [{ errorText: 'An error occurred' }],
}));

describe('AnsibleLogin', () => {
  const defaultProps = {
    loginApiUrl: '/api/gateway/login/',
    brandImgAlt: 'Test Brand',
    showLoginForm: true,
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationReplace.mockClear();
  });

  it('should always show login form regardless of path', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AnsibleLogin {...defaultProps} loginTitle="Log in to your account" />
      </MemoryRouter>
    );

    expect(mockLocationReplace).not.toHaveBeenCalled();
    expect(screen.getByText('Log in to your account')).toBeInTheDocument();
  });

  it('should not render show password toggle button', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AnsibleLogin {...defaultProps} />
      </MemoryRouter>
    );

    const showPasswordButton = screen.queryByRole('button', { name: /show password/i });
    expect(showPasswordButton).not.toBeInTheDocument();
  });

  describe('when externalLoginUrl is provided', () => {
    it('should redirect to external url', () => {
      const externalUrl = 'https://sso.example.com/login';

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AnsibleLogin {...defaultProps} externalLoginUrl={externalUrl} />
        </MemoryRouter>
      );

      // Should redirect to external URL and return null (no content)
      expect(mockLocationReplace).toHaveBeenCalledWith(externalUrl);
      expect(screen.queryByRole('form')).not.toBeInTheDocument();
    });

    it('should not redirect when on /login path', () => {
      const externalUrl = 'https://sso.example.com/login';

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AnsibleLogin
            {...defaultProps}
            externalLoginUrl={externalUrl}
            loginTitle="Log in to your account"
          />
        </MemoryRouter>
      );

      expect(mockLocationReplace).not.toHaveBeenCalled();
      expect(screen.getByText('Log in to your account')).toBeInTheDocument();
    });
  });

  describe('autocomplete attributes on login form inputs', () => {
    it('should set autocomplete="new-password" on password input', () => {
      const { container } = render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} loginTitle="Log in to your account" />
        </MemoryRouter>
      );

      const passwordInput = container.querySelector('#pf-login-password-id') as HTMLInputElement;
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should set autocomplete="off" on username input', () => {
      const { container } = render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} loginTitle="Log in to your account" />
        </MemoryRouter>
      );

      const usernameInput = container.querySelector('#pf-login-username-id') as HTMLInputElement;
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('autocomplete', 'off');
    });
  });

  describe('social auth error handling', () => {
    it('should render error message when auth_failed url param present', () => {
      render(
        <MemoryRouter initialEntries={['/?auth_failed']}>
          <AnsibleLogin
            {...defaultProps}
            authOptions={[{ login_url: 'bar', type: 'foo' }]}
            loginTitle="Log in"
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId('social-error')).toHaveTextContent(
        'Unable to complete social auth login'
      );
    });
  });

  describe('textContent HTML sanitization', () => {
    it('should render custom footer content', () => {
      const htmlContent = 'Welcome to AAP';

      const { container } = render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} textContent={htmlContent} />
        </MemoryRouter>
      );

      const footer = container.querySelector('.pf-v6-c-login__footer');
      expect(footer).toBeInTheDocument();
      expect(footer?.innerHTML).toEqual('Welcome to AAP');
    });

    it('should sanitize and render allowed HTML tags', () => {
      const htmlContent = '<p>Welcome to <strong>AAP</strong>. <a href="/docs">Read docs</a></p>';

      const { container } = render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} textContent={htmlContent} />
        </MemoryRouter>
      );

      const footer = container.querySelector('.pf-v6-c-login__footer');
      expect(footer).toBeInTheDocument();
      expect(footer?.innerHTML).toContain('<strong>AAP</strong>');
      expect(footer?.innerHTML).toContain('<a href="/docs">Read docs</a>');
    });

    it('should call DOMPurify.sanitize for dangerous HTML', async () => {
      const dangerousContent = '<p>Safe text</p><script>console.log("xss")</script>';

      // Dynamically import DOMPurify to spy on it
      const DOMPurifyModule = await import('dompurify');
      const sanitizeSpy = vi.spyOn(DOMPurifyModule.default, 'sanitize');

      render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} textContent={dangerousContent} />
        </MemoryRouter>
      );

      // Verify DOMPurify.sanitize was called with the dangerous content
      expect(sanitizeSpy).toHaveBeenCalledWith(dangerousContent);

      // Verify the sanitized output removes script tags and preserves safe content
      const returnValue = sanitizeSpy.mock.results[0]?.value as string;
      expect(returnValue).not.toContain('<script>');
      expect(returnValue).toContain('Safe text');

      sanitizeSpy.mockRestore();
    });

    it('should not render footer when textContent is not provided', () => {
      const { container } = render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} />
        </MemoryRouter>
      );

      const footer = container.querySelector('.pf-v6-c-login__footer');
      expect(footer).not.toBeInTheDocument();
    });
  });
});
