import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GatewaySettingsEdit } from './GatewaySettingsEdit';

const mockPageNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: vi.fn(),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('./GatewaySettingsCategories', () => ({
  useGatewaySettingsCategories: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestPut: vi.fn(),
}));

vi.mock('../utils/gateway-api-utils', () => ({
  gatewayAPI: (template: TemplateStringsArray) => template.join('').replace(/\$\{.*?\}/g, ''),
}));

describe('GatewaySettingsEdit Component', () => {
  const mockUseOutletContext = vi.fn();
  let mockUseGatewaySettingsCategories: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const routerModule = await import('react-router-dom');
    vi.mocked(routerModule).useOutletContext = mockUseOutletContext;

    const categoriesModule = await import('./GatewaySettingsCategories');
    mockUseGatewaySettingsCategories = vi.mocked(categoriesModule).useGatewaySettingsCategories;
    mockUseGatewaySettingsCategories.mockReturnValue([
      {
        id: 'platform',
        title: 'Platform gateway settings',
        description: 'Edit platform gateway settings',
        sections: [
          {
            title: 'Platform gateway',
            options: {
              gateway_proxy_url: {
                type: 'url',
                label: 'Gateway proxy url',
                help_text: 'The URL to the gateway proxy layer.',
                default: 'https://localhost:9080',
                required: false,
                read_only: false,
              },
            },
          },
        ],
      },
    ]);
  });

  const adminContext = {
    options: {
      GET: {
        gateway_proxy_url: {
          type: 'url',
          label: 'Gateway proxy url',
          help_text: 'The URL to the gateway proxy layer.',
          default: 'https://localhost:9080',
        },
      },
      PUT: {
        gateway_proxy_url: {
          type: 'url',
          label: 'Gateway proxy url',
          help_text: 'The URL to the gateway proxy layer.',
          default: 'https://localhost:9080',
        },
      },
    },
    settings: {
      gateway_proxy_url: 'https://localhost:9080',
    },
    refresh: vi.fn(),
  } as {
    options: {
      GET: Record<string, unknown>;
      PUT?: Record<string, unknown>;
    };
    settings: Record<string, unknown>;
    refresh: () => Promise<void>;
  };

  const renderWithContext = (context = adminContext, categoryId = 'platform') => {
    mockUseOutletContext.mockReturnValue(context);

    return render(
      <MemoryRouter>
        <GatewaySettingsEdit categoryId={categoryId} />
      </MemoryRouter>
    );
  };

  describe('Admin User (has PUT permissions)', () => {
    it('should render edit form for admin user', () => {
      renderWithContext();

      expect(screen.getByText('Platform gateway settings')).toBeInTheDocument();
      expect(screen.getByText('Platform gateway')).toBeInTheDocument();
      expect(screen.getByLabelText('Gateway proxy url')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Save platform gateway settings' })
      ).toBeInTheDocument();
    });

    it('should show revert all button for admin user', () => {
      renderWithContext();

      expect(screen.getByRole('button', { name: 'Revert all to default' })).toBeInTheDocument();
    });

    it('should allow admin to edit and submit settings', async () => {
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      mockRequestPut.mockResolvedValue({});

      renderWithContext();

      const input = screen.getByLabelText('Gateway proxy url');
      fireEvent.change(input, { target: { value: 'https://new-gateway.example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Save platform gateway settings' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalledWith(
          '/settings/all/',
          expect.objectContaining({
            gateway_proxy_url: 'https://new-gateway.example.com',
          })
        );
      });

      expect(mockPageNavigate).toHaveBeenCalledWith('platform-gateway-settings');
    });

    it('should allow admin to cancel editing', () => {
      renderWithContext();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockPageNavigate).toHaveBeenCalledWith('platform-gateway-settings');
    });
  });

  describe('Platform Auditor (no PUT permissions)', () => {
    const auditorContext = {
      options: {
        GET: {
          gateway_proxy_url: {
            type: 'url',
            label: 'Gateway proxy url',
            help_text: 'The URL to the gateway proxy layer.',
            default: 'https://localhost:9080',
          },
        },
        // No PUT property - auditor has no write permissions
      },
      settings: {
        gateway_proxy_url: 'https://localhost:9080',
      },
      refresh: vi.fn(),
    } as {
      options: {
        GET: Record<string, unknown>;
        PUT?: Record<string, unknown>;
      };
      settings: Record<string, unknown>;
      refresh: () => Promise<void>;
    };

    beforeEach(() => {
      mockUseGatewaySettingsCategories.mockReturnValue([]);
    });

    it('should not render edit form for platform auditor', () => {
      renderWithContext(auditorContext);

      expect(screen.queryByText('Platform gateway settings')).not.toBeInTheDocument();
      expect(screen.queryByText('Platform gateway')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Gateway proxy url')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Save platform gateway settings' })
      ).not.toBeInTheDocument();
    });
  });

  describe('LOGIN_REDIRECT_OVERRIDE confirmation field', () => {
    beforeEach(() => {
      mockUseGatewaySettingsCategories.mockReturnValue([
        {
          id: 'authentication',
          title: 'Authentication settings',
          description: 'Edit authentication settings',
          sections: [
            {
              title: 'Authentication',
              options: {
                LOGIN_REDIRECT_OVERRIDE: {
                  type: 'url',
                  label: 'Login redirect override',
                  help_text: 'URL to redirect to after login.',
                  default: '',
                  required: false,
                  read_only: false,
                },
              },
            },
          ],
        },
      ]);
    });

    it('should exclude CONFIRM_LOGIN_REDIRECT_OVERRIDE from form submission', async () => {
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      mockRequestPut.mockResolvedValue({});

      const contextWithRedirect = {
        ...adminContext,
        options: {
          GET: {
            LOGIN_REDIRECT_OVERRIDE: {
              type: 'url',
              label: 'Login redirect override',
              help_text: 'URL to redirect to after login.',
              default: '',
              required: false,
              read_only: false,
            },
          },
          PUT: {
            LOGIN_REDIRECT_OVERRIDE: {
              type: 'url',
              label: 'Login redirect override',
              help_text: 'URL to redirect to after login.',
              default: '',
              required: false,
              read_only: false,
            },
          },
        },
        settings: {
          LOGIN_REDIRECT_OVERRIDE: 'https://example.com/login',
        },
        refresh: vi.fn(),
      };

      renderWithContext(contextWithRedirect, 'authentication');

      const submitButton = screen.getByRole('button', { name: 'Save platform gateway settings' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalled();
      });

      const submittedData = mockRequestPut.mock.calls[0][1] as Record<string, unknown>;
      expect(submittedData).toHaveProperty('LOGIN_REDIRECT_OVERRIDE');
      expect(submittedData).not.toHaveProperty('CONFIRM_LOGIN_REDIRECT_OVERRIDE');
    });
  });

  describe('Edge Cases', () => {
    it('should handle form submission errors gracefully', async () => {
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRequestPut.mockRejectedValue(new Error('API Error'));

      renderWithContext();

      const input = screen.getByLabelText('Gateway proxy url');
      fireEvent.change(input, { target: { value: 'https://new-gateway.example.com' } });

      const submitButton = screen.getByRole('button', { name: 'Save platform gateway settings' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
