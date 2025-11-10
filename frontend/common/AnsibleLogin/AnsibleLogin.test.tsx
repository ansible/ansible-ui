import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogin } from './AnsibleLogin';

const mockLocationReplace = vi.fn();
Object.defineProperty(window, 'location', {
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

    it('should remove dangerous HTML tags', () => {
      const dangerousContent = '<p>Safe text</p><script>console.log("xss")</script>';

      const { container } = render(
        <MemoryRouter>
          <AnsibleLogin {...defaultProps} textContent={dangerousContent} />
        </MemoryRouter>
      );

      const footer = container.querySelector('.pf-v6-c-login__footer');
      expect(footer).toBeInTheDocument();
      expect(footer?.innerHTML).toContain('Safe text');
      expect(footer?.innerHTML).not.toContain('<script>');
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
