import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockOpenRevertAllModal = vi.fn();

vi.mock('./useRevertAllGatewaySettingsModal', () => ({
  useRevertAllGatewaySettingsModal: () => mockOpenRevertAllModal,
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
      const user = userEvent.setup();
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      mockRequestPut.mockResolvedValue({});

      renderWithContext();

      const input = screen.getByLabelText('Gateway proxy url');
      await user.clear(input);
      await user.type(input, 'https://new-gateway.example.com');

      const submitButton = screen.getByRole('button', { name: 'Save platform gateway settings' });
      await user.click(submitButton);

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

    it('should allow admin to cancel editing', async () => {
      const user = userEvent.setup();
      renderWithContext();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

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
      const user = userEvent.setup();
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
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalled();
      });

      const submittedData = mockRequestPut.mock.calls[0][1] as Record<string, unknown>;
      expect(submittedData).toHaveProperty('LOGIN_REDIRECT_OVERRIDE');
      expect(submittedData).not.toHaveProperty('CONFIRM_LOGIN_REDIRECT_OVERRIDE');
    });
  });
  describe('float settings type', () => {
    beforeEach(() => {
      mockUseGatewaySettingsCategories.mockReturnValue([
        {
          id: 'platform',
          title: 'Platform gateway settings',
          description: 'Edit platform gateway settings',
          sections: [
            {
              title: 'Platform gateway',
              options: {
                resource_client_request_timeout: {
                  type: 'float',
                  label: 'Resource Client Request Timeout',
                  help_text:
                    'The timeout (in seconds) before the resource client will drop requests after forming connections.',
                  default: 10,
                  min_value: 0,
                  required: false,
                  read_only: false,
                },
              },
            },
          ],
        },
      ]);
    });

    const floatContext = {
      options: {
        GET: {
          resource_client_request_timeout: {
            type: 'float',
            label: 'Resource Client Request Timeout',
            help_text:
              'The timeout (in seconds) before the resource client will drop requests after forming connections.',
            default: 10,
            min_value: 0,
            required: false,
            read_only: false,
          },
        },
        PUT: {
          resource_client_request_timeout: {
            type: 'float',
            label: 'Resource Client Request Timeout',
            help_text:
              'The timeout (in seconds) before the resource client will drop requests after forming connections.',
            default: 10,
            min_value: 0,
            required: false,
            read_only: false,
          },
        },
      },
      settings: {
        resource_client_request_timeout: 10,
      },
      refresh: vi.fn(),
    };

    it('should render a number input for float settings', () => {
      renderWithContext(floatContext);

      expect(screen.getByLabelText('Resource Client Request Timeout')).toBeInTheDocument();
      expect(screen.queryByText('Unsupported settings type')).not.toBeInTheDocument();
    });

    it('should submit a decimal float value', async () => {
      const user = userEvent.setup();
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      mockRequestPut.mockResolvedValue({});

      renderWithContext(floatContext);

      const input = screen.getByLabelText('Resource Client Request Timeout');
      await user.clear(input);
      await user.type(input, '18.5');

      await user.click(screen.getByRole('button', { name: 'Save platform gateway settings' }));

      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalledWith(
          '/settings/all/',
          expect.objectContaining({
            resource_client_request_timeout: 18.5,
          })
        );
      });
    });
  });

  describe('OPTIONS-driven pattern validation', () => {
    const patternDescription = 'Letters, numbers, underscores, and hyphens only';

    beforeEach(() => {
      mockUseGatewaySettingsCategories.mockReturnValue([
        {
          id: 'platform',
          title: 'Platform gateway settings',
          description: 'Edit platform gateway settings',
          sections: [
            {
              title: 'Platform gateway',
              options: {
                platform_analytics_state: {
                  type: 'string',
                  label: 'Platform analytics state',
                  help_text: 'Analytics state identifier.',
                  default: 'enabled',
                  required: false,
                  read_only: false,
                },
              },
            },
          ],
        },
      ]);
    });

    it('should show validation message on blur and block submit for invalid input', async () => {
      const user = userEvent.setup();
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      mockRequestPut.mockResolvedValue({});

      const contextWithPattern = {
        ...adminContext,
        options: {
          GET: {
            platform_analytics_state: {
              type: 'string',
              label: 'Platform analytics state',
              help_text: 'Analytics state identifier.',
              default: 'enabled',
            },
          },
          PUT: {
            platform_analytics_state: {
              type: 'string',
              label: 'Platform analytics state',
              help_text: 'Analytics state identifier.',
              default: 'enabled',
              required: false,
              read_only: false,
              pattern: '^[a-zA-Z0-9_-]+$',
              pattern_description: patternDescription,
            },
          },
        },
        settings: {
          platform_analytics_state: 'enabled',
        },
        refresh: vi.fn(),
      };

      renderWithContext(contextWithPattern);

      const input = screen.getByLabelText('Platform analytics state');
      await user.clear(input);
      await user.type(input, 'invalid@name');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(patternDescription)).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Save platform gateway settings' }));

      await waitFor(() => {
        expect(mockRequestPut).not.toHaveBeenCalled();
      });
    });
  });

  describe('Category and settings types', () => {
    it('should render null when the category id is not found', () => {
      const { container } = renderWithContext(adminContext, 'unknown-category');
      expect(container).toBeEmptyDOMElement();
    });

    it('should render boolean settings using a select input', () => {
      mockUseGatewaySettingsCategories.mockReturnValue([
        {
          id: 'platform',
          title: 'Platform gateway settings',
          description: 'Edit platform gateway settings',
          sections: [
            {
              title: 'Platform gateway',
              options: {
                analytics_collection_enabled: {
                  type: 'boolean',
                  label: 'Analytics collection enabled',
                  help_text: 'Collect analytics.',
                  default: true,
                  required: false,
                  read_only: false,
                },
              },
            },
          ],
        },
      ]);

      const booleanContext = {
        options: {
          GET: {
            analytics_collection_enabled: {
              type: 'boolean',
              label: 'Analytics collection enabled',
              default: true,
            },
          },
          PUT: {
            analytics_collection_enabled: {
              type: 'boolean',
              label: 'Analytics collection enabled',
              help_text: 'Collect analytics.',
              default: true,
              required: false,
              read_only: false,
            },
          },
        },
        settings: { analytics_collection_enabled: true },
        refresh: vi.fn(),
      };

      renderWithContext(booleanContext);

      expect(screen.getByText('Analytics collection enabled')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enabled' })).toBeInTheDocument();
    });

    it('should render file upload control for field settings type', () => {
      mockUseGatewaySettingsCategories.mockReturnValue([
        {
          id: 'platform',
          title: 'Platform gateway settings',
          description: 'Edit platform gateway settings',
          sections: [
            {
              title: 'Branding',
              options: {
                custom_logo: {
                  type: 'field',
                  label: 'Custom logo',
                  help_text: 'Upload a logo image.',
                  default: null,
                  required: false,
                  read_only: false,
                },
              },
            },
          ],
        },
      ]);

      const fileContext = {
        options: {
          GET: {
            custom_logo: { type: 'field', label: 'Custom logo', default: null },
          },
          PUT: {
            custom_logo: {
              type: 'field',
              label: 'Custom logo',
              help_text: 'Upload a logo image.',
              default: null,
              required: false,
              read_only: false,
            },
          },
        },
        settings: { custom_logo: null },
        refresh: vi.fn(),
      };

      renderWithContext(fileContext);

      expect(screen.getByText('Custom logo')).toBeInTheDocument();
    });

    it('should show unsupported settings type for unknown option types', () => {
      mockUseGatewaySettingsCategories.mockReturnValue([
        {
          id: 'platform',
          title: 'Platform gateway settings',
          description: 'Edit platform gateway settings',
          sections: [
            {
              title: 'Platform gateway',
              options: {
                mystery_option: {
                  type: 'unknown_type',
                  label: 'Mystery',
                  help_text: '',
                  default: null,
                  required: false,
                  read_only: false,
                },
              },
            },
          ],
        },
      ]);

      const unknownTypeContext = {
        options: {
          GET: {
            mystery_option: { type: 'unknown_type', label: 'Mystery', default: null },
          },
          PUT: {
            mystery_option: {
              type: 'unknown_type',
              label: 'Mystery',
              help_text: '',
              default: null,
              required: false,
              read_only: false,
            },
          },
        },
        settings: { mystery_option: null },
        refresh: vi.fn(),
      };

      renderWithContext(unknownTypeContext);

      expect(screen.getByText('Unsupported settings type')).toBeInTheDocument();
    });

    it('should call revert-all modal opener when revert button is clicked', async () => {
      const user = userEvent.setup();
      renderWithContext();

      await user.click(screen.getByRole('button', { name: 'Revert all to default' }));

      expect(mockOpenRevertAllModal).toHaveBeenCalledWith(
        expect.objectContaining({
          onComplete: expect.any(Function) as () => void,
        })
      );
    });
  });

  describe('CSRF trusted origins', () => {
    beforeEach(() => {
      mockUseGatewaySettingsCategories.mockReturnValue([
        {
          id: 'platform',
          title: 'Platform gateway settings',
          description: 'Edit platform gateway settings',
          sections: [
            {
              title: 'Platform gateway',
              options: {
                CSRF_TRUSTED_ORIGINS: {
                  type: 'list',
                  label: 'CSRF trusted origins',
                  help_text: '',
                  default: [],
                  required: false,
                  read_only: false,
                },
              },
            },
          ],
        },
      ]);
    });

    const csrfContext = {
      options: {
        GET: {
          CSRF_TRUSTED_ORIGINS: {
            type: 'list',
            label: 'CSRF trusted origins',
            default: [],
          },
        },
        PUT: {
          CSRF_TRUSTED_ORIGINS: {
            type: 'list',
            label: 'CSRF trusted origins',
            help_text: '',
            default: [],
            required: false,
            read_only: false,
          },
        },
      },
      settings: { CSRF_TRUSTED_ORIGINS: ['https://trusted.example.com'] },
      refresh: vi.fn(),
    };

    it('should render CSRF trusted origins inputs and submit trimmed values', async () => {
      const user = userEvent.setup();
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      mockRequestPut.mockResolvedValue({});

      renderWithContext(csrfContext);

      expect(screen.getByText('CSRF trusted origins list')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://trusted.example.com')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Save platform gateway settings' }));

      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalledWith(
          '/settings/all/',
          expect.objectContaining({
            CSRF_TRUSTED_ORIGINS: ['https://trusted.example.com'],
          })
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle form submission errors gracefully', async () => {
      const user = userEvent.setup();
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRequestPut.mockRejectedValue(new Error('API Error'));

      renderWithContext();

      const input = screen.getByLabelText('Gateway proxy url');
      await user.clear(input);
      await user.type(input, 'https://new-gateway.example.com');

      const submitButton = screen.getByRole('button', { name: 'Save platform gateway settings' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
