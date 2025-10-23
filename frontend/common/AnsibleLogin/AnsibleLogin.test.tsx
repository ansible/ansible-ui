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
});
