import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      const expectedSanitized = '<p>Safe text</p>';

      // Dynamically import DOMPurify to spy on it
      const DOMPurifyModule = await import('dompurify');
      const sanitizeSpy = vi
        .spyOn(DOMPurifyModule.default, 'sanitize')
        .mockReturnValue(expectedSanitized);

      render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} textContent={dangerousContent} />
        </MemoryRouter>
      );

      // Verify DOMPurify.sanitize was called with the dangerous content
      expect(sanitizeSpy).toHaveBeenCalledWith(dangerousContent);

      // Verify the mocked sanitized output removes script tags and preserves safe content
      expect(expectedSanitized).not.toContain('<script>');
      expect(expectedSanitized).toContain('Safe text');

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

  describe('login form validation and submit', () => {
    it('should require username and password before submitting', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} loginTitle="Log in" />
        </MemoryRouter>
      );

      await user.click(screen.getByRole('button', { name: 'Log in' }));
      expect(screen.getByText('Username is required')).toBeInTheDocument();

      const usernameInput = document.querySelector('#pf-login-username-id') as HTMLInputElement;
      await user.type(usernameInput, 'admin');
      await user.click(screen.getByRole('button', { name: 'Log in' }));
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should call onSuccess after successful login', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: true, status: 204 });
      vi.stubGlobal('fetch', fetchMock);
      document.cookie = 'csrftoken=test-token; path=/';

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AnsibleLogin {...defaultProps} onSuccess={onSuccess} loginTitle="Log in" />
        </MemoryRouter>
      );

      const usernameInput = document.querySelector('#pf-login-username-id') as HTMLInputElement;
      const passwordInput = document.querySelector('#pf-login-password-id') as HTMLInputElement;
      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password');
      await user.click(screen.getByRole('button', { name: 'Log in' }));

      await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
      vi.unstubAllGlobals();
    });

    it('should show invalid credentials message for 401 response', async () => {
      const user = userEvent.setup();
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'bad' }), { status: 401 }));
      vi.stubGlobal('fetch', fetchMock);
      document.cookie = 'csrftoken=test-token; path=/';

      render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} loginTitle="Log in" />
        </MemoryRouter>
      );

      const usernameInput = document.querySelector('#pf-login-username-id') as HTMLInputElement;
      const passwordInput = document.querySelector('#pf-login-password-id') as HTMLInputElement;
      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'wrong');
      await user.click(screen.getByRole('button', { name: 'Log in' }));

      await vi.waitFor(() =>
        expect(
          screen.getByText('Invalid username or password. Please try again.')
        ).toBeInTheDocument()
      );
      vi.unstubAllGlobals();
    });

    it('should render other login options', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <MemoryRouter>
          <AnsibleLogin
            {...defaultProps}
            otherOptions={[{ label: 'Forgot password', onClick }]}
            loginTitle="Log in"
          />
        </MemoryRouter>
      );

      await user.click(screen.getByRole('link', { name: 'Forgot password' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
