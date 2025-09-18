/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { GatewaySettings } from './GatewaySettings';
import type { SWRResponse, SWRConfiguration, BareFetcher } from 'swr';

// Mock the dependencies
vi.mock('@ansible/common-ui/crud/useOptions');
vi.mock('swr');
vi.mock('react-router-dom', () => ({
  Outlet: ({ context }: { context: Record<string, unknown> }) => {
    const outletContext = 'outlet-context';
    const contextData = JSON.stringify(context);
    const mockText = 'Mock Outlet';

    return (
      <div data-testid={outletContext} data-context={contextData}>
        {mockText}
      </div>
    );
  },
}));

const mockUseOptions = vi.mocked(await import('@ansible/common-ui/crud/useOptions')).useOptions;
const mockUseSWR = vi.mocked(await import('swr')).default;

// Helper function to create proper SWR mock responses
const createSWRResponse = <T,>(
  data: T | null,
  error: Error | null = null,
  isLoading = false
): SWRResponse<
  unknown,
  unknown,
  SWRConfiguration<unknown, unknown, BareFetcher<unknown>> | undefined
> => ({
  data: data ?? undefined,
  error: error ?? undefined,
  isLoading,
  isValidating: false,
  mutate: vi.fn(),
});

// Type for outlet context
interface OutletContext {
  options: Record<string, unknown>;
  hasWritePermissions: boolean;
  settings: Record<string, unknown>;
}

// Real API response for admin user (has both GET and PUT)
const adminApiResponse = {
  name: 'Setting Section',
  description: 'A view class for managing and displaying a group of settings...',
  renders: ['application/json', 'text/html'],
  parses: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'],
  actions: {
    GET: {
      gateway_token_name: {
        type: 'string',
        required: false,
        read_only: false,
        label: 'Gateway token name',
        help_text: 'The header name to push from the proxy to the backend service.',
        default: 'X-DAB-JW-TOKEN',
      },
      gateway_access_token_expiration: {
        type: 'integer',
        required: false,
        read_only: false,
        label: 'Gateway access token expiration',
        help_text: 'How long the access tokens are valid for.',
        default: 600,
      },
      jwt_public_key: {
        type: 'string',
        required: false,
        read_only: true,
        label: 'Jwt public key',
        help_text: 'The JWT public key (read-only).',
        default: '',
      },
      gateway_proxy_url: {
        type: 'url',
        required: false,
        read_only: false,
        label: 'Gateway proxy url',
        help_text: 'The URL to the gateway proxy layer.',
        default: 'https://localhost:9080',
      },
    },
    PUT: {
      gateway_token_name: {
        type: 'string',
        required: false,
        read_only: false,
        label: 'Gateway token name',
        help_text: 'The header name to push from the proxy to the backend service.',
        default: 'X-DAB-JW-TOKEN',
      },
      gateway_access_token_expiration: {
        type: 'integer',
        required: false,
        read_only: false,
        label: 'Gateway access token expiration',
        help_text: 'How long the access tokens are valid for.',
        default: 600,
      },
      jwt_public_key: {
        type: 'string',
        required: false,
        read_only: true,
        label: 'Jwt public key',
        help_text: 'The JWT public key (read-only).',
        default: '',
      },
      gateway_proxy_url: {
        type: 'url',
        required: false,
        read_only: false,
        label: 'Gateway proxy url',
        help_text: 'The URL to the gateway proxy layer.',
        default: 'https://localhost:9080',
      },
    },
  },
};

// Real API response for platform auditor (only GET, no PUT)
const auditorApiResponse = {
  name: 'Setting Section',
  description: 'A view class for managing and displaying a group of settings...',
  renders: ['application/json', 'text/html'],
  parses: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'],
  actions: {
    GET: {
      gateway_token_name: {
        type: 'string',
        required: false,
        read_only: false,
        label: 'Gateway token name',
        help_text: 'The header name to push from the proxy to the backend service.',
        default: 'X-DAB-JW-TOKEN',
      },
      gateway_access_token_expiration: {
        type: 'integer',
        required: false,
        read_only: false,
        label: 'Gateway access token expiration',
        help_text: 'How long the access tokens are valid for.',
        default: 600,
      },
      jwt_public_key: {
        type: 'string',
        required: false,
        read_only: true,
        label: 'Jwt public key',
        help_text: 'The JWT public key (read-only).',
        default: '',
      },
      gateway_proxy_url: {
        type: 'url',
        required: false,
        read_only: false,
        label: 'Gateway proxy url',
        help_text: 'The URL to the gateway proxy layer.',
        default: 'https://localhost:9080',
      },
    },
    // No PUT section for auditor
  },
};

const mockSettings = {
  gateway_token_name: 'X-DAB-JW-TOKEN',
  gateway_access_token_expiration: 600,
  jwt_public_key: '-----BEGIN PUBLIC KEY----- ...',
  gateway_proxy_url: 'https://localhost:9080',
};

describe('GatewaySettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin User Permissions', () => {
    beforeEach(() => {
      mockUseOptions.mockReturnValue({
        data: adminApiResponse,
        error: undefined,
        isLoading: false,
      });
      mockUseSWR.mockReturnValue(createSWRResponse(mockSettings));
    });

    it('uses PUT actions when admin has both GET and PUT permissions', () => {
      const { getByTestId } = render(<GatewaySettings />);

      const outletContext = JSON.parse(
        getByTestId('outlet-context').dataset.context!
      ) as OutletContext;

      // Should pass entire actions object (admin has both GET and PUT)
      expect(outletContext.options).toEqual(adminApiResponse.actions);
      expect(outletContext.hasWritePermissions).toBe(true);
      expect(outletContext.settings).toEqual(mockSettings);
    });

    it('calculates hasWritePermissions correctly for admin', () => {
      const { getByTestId } = render(<GatewaySettings />);

      const outletContext = JSON.parse(
        getByTestId('outlet-context').dataset.context!
      ) as OutletContext;

      // Admin has PUT permissions, so should have write permissions
      expect(outletContext.hasWritePermissions).toBe(true);
    });
  });

  describe('Platform Auditor Permissions', () => {
    beforeEach(() => {
      mockUseOptions.mockReturnValue({
        data: auditorApiResponse,
        error: undefined,
        isLoading: false,
      });
      mockUseSWR.mockReturnValue(createSWRResponse(mockSettings));
    });
    it('uses GET actions when auditor has only GET permissions', () => {
      const { getByTestId } = render(<GatewaySettings />);

      const outletContext = JSON.parse(
        getByTestId('outlet-context').dataset.context!
      ) as OutletContext;

      // Should pass entire actions object (auditor only has GET, no PUT)
      expect(outletContext.options).toEqual(auditorApiResponse.actions);
      expect(outletContext.hasWritePermissions).toBe(false);
      expect(outletContext.settings).toEqual(mockSettings);
    });

    it('calculates hasWritePermissions correctly for auditor', () => {
      const { getByTestId } = render(<GatewaySettings />);

      const outletContext = JSON.parse(
        getByTestId('outlet-context').dataset.context!
      ) as OutletContext;

      // Auditor has no PUT permissions, so should not have write permissions
      expect(outletContext.hasWritePermissions).toBe(false);
    });
  });

  describe('Normal User (No Permissions)', () => {
    beforeEach(() => {
      // Mock 403 response or no data for normal user
      mockUseOptions.mockReturnValue({
        data: null,
        error: new Error('403 Forbidden'),
        isLoading: false,
      });
      mockUseSWR.mockReturnValue(createSWRResponse(null, new Error('403 Forbidden')));
    });

    it('shows loading state when normal user has no permissions', () => {
      const { container } = render(<GatewaySettings />);

      // Should show loading state (Spinner) when no permissions
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    it('shows loading state when options are missing', () => {
      mockUseOptions.mockReturnValue({
        data: null,
        error: undefined,
        isLoading: true,
      });
      mockUseSWR.mockReturnValue(createSWRResponse(mockSettings));

      const { container } = render(<GatewaySettings />);

      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });

    it('shows loading state when settings are missing', () => {
      mockUseOptions.mockReturnValue({
        data: adminApiResponse,
        error: undefined,
        isLoading: false,
      });
      mockUseSWR.mockReturnValue(createSWRResponse(null, null, true));

      const { container } = render(<GatewaySettings />);

      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });
  });
});
