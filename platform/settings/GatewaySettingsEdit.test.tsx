/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { GatewaySettingsEdit } from './GatewaySettingsEdit';
import { MemoryRouter } from 'react-router-dom';

// Mock react-router-dom
const mockPageNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: vi.fn(),
  };
});

// Mock usePageNavigate
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useGatewaySettingsCategories
vi.mock('./GatewaySettingsCategories', () => ({
  useGatewaySettingsCategories: vi.fn(),
}));

// Mock useRevertAllGatewaySettingsModal
vi.mock('./useRevertAllGatewaySettingsModal', () => ({
  useRevertAllGatewaySettingsModal: () => vi.fn(),
}));

// Mock requestPut
vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestPut: vi.fn(),
}));

// Mock useIsValidUrl
vi.mock('@ansible/common-ui/validation/useIsValidUrl', () => ({
  useIsValidUrl: () => true,
}));

// Mock gatewayAPI
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

    // Get the mocked function
    const categoriesModule = await import('./GatewaySettingsCategories');
    mockUseGatewaySettingsCategories = vi.mocked(categoriesModule).useGatewaySettingsCategories;

    // Default mock for useGatewaySettingsCategories (admin with PUT permissions)
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
    it('renders edit form for admin user', () => {
      renderWithContext();

      // Should render the edit form
      expect(screen.getByText('Platform gateway settings')).toBeInTheDocument();
      expect(screen.getByText('Platform gateway')).toBeInTheDocument();
      expect(screen.getByLabelText('Gateway proxy url')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Save platform gateway settings' })
      ).toBeInTheDocument();
    });

    it('shows revert all button for admin user', () => {
      renderWithContext();

      // Should show the revert all button
      expect(screen.getByRole('button', { name: 'Revert all to default' })).toBeInTheDocument();
    });

    it('allows admin to edit and submit settings', async () => {
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      mockRequestPut.mockResolvedValue({});

      renderWithContext();

      // Find the input field and change its value
      const input = screen.getByLabelText('Gateway proxy url');
      fireEvent.change(input, { target: { value: 'https://new-gateway.example.com' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Save platform gateway settings' });
      fireEvent.click(submitButton);

      // Wait for the form submission
      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalledWith(
          '/settings/all/',
          expect.objectContaining({
            gateway_proxy_url: 'https://new-gateway.example.com',
          })
        );
      });

      // Should navigate back to settings page
      expect(mockPageNavigate).toHaveBeenCalledWith('platform-gateway-settings');
    });

    it('allows admin to cancel editing', () => {
      renderWithContext();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      // Should navigate back to settings page
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
      // Mock useGatewaySettingsCategories to return empty array for auditor
      mockUseGatewaySettingsCategories.mockReturnValue([]);
    });

    it('does not render edit form for platform auditor', () => {
      renderWithContext(auditorContext);

      // Should not render any edit form elements
      expect(screen.queryByText('Platform gateway settings')).not.toBeInTheDocument();
      expect(screen.queryByText('Platform gateway')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Gateway proxy url')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Save platform gateway settings' })
      ).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles form submission errors gracefully', async () => {
      const mockRequestPut = vi.mocked(await import('@ansible/common-ui/crud/Data')).requestPut;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRequestPut.mockRejectedValue(new Error('API Error'));

      renderWithContext();

      // Find the input field and change its value
      const input = screen.getByLabelText('Gateway proxy url');
      fireEvent.change(input, { target: { value: 'https://new-gateway.example.com' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Save platform gateway settings' });
      fireEvent.click(submitButton);

      // Should handle the error gracefully
      await waitFor(() => {
        expect(mockRequestPut).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
