/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { GatewaySettingsDetails } from './GatewaySettingsDetails';
import { MemoryRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: vi.fn(),
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

describe('GatewaySettingsDetails Component', () => {
  const mockUseOutletContext = vi.fn();
  let mockUseGatewaySettingsCategories: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const routerModule = await import('react-router-dom');
    vi.mocked(routerModule).useOutletContext = mockUseOutletContext;

    // Get the mocked function
    const categoriesModule = await import('./GatewaySettingsCategories');
    mockUseGatewaySettingsCategories = vi.mocked(categoriesModule).useGatewaySettingsCategories;

    // Default mock for useGatewaySettingsCategories
    mockUseGatewaySettingsCategories.mockReturnValue([
      {
        id: 'test-category',
        title: 'Test Category',
        sections: [
          {
            title: 'Test Section',
            options: {
              test_option: {
                type: 'string',
                label: 'Test Option',
                help_text: 'Test help text',
              },
            },
          },
        ],
      },
    ]);
  });

  const mockContext = {
    options: {
      GET: {
        test_option: {
          type: 'string',
          label: 'Test Option',
          help_text: 'Test help text',
        },
      },
      PUT: {
        test_option: {
          type: 'string',
          label: 'Test Option',
          help_text: 'Test help text',
        },
      },
    },
    settings: {
      test_option: 'test value',
    },
    hasWritePermissions: true,
  } as {
    options: {
      GET: Record<string, unknown>;
      PUT?: Record<string, unknown>;
    };
    settings: Record<string, unknown>;
    hasWritePermissions: boolean;
  };

  const renderWithContext = (context = mockContext) => {
    mockUseOutletContext.mockReturnValue(context);

    return render(
      <MemoryRouter>
        <GatewaySettingsDetails categoryId="test-category" />
      </MemoryRouter>
    );
  };

  describe('Admin User (hasWritePermissions: true)', () => {
    it('shows edit button for admin user', () => {
      renderWithContext();

      const editButton = screen.getByRole('button', { name: 'Edit platform gateway settings' });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveTextContent('Edit platform gateway settings');
    });

    it('edit button is clickable for admin user', () => {
      renderWithContext();

      const editButton = screen.getByRole('button', { name: 'Edit platform gateway settings' });

      // Click the edit button - should not throw an error
      expect(() => editButton.click()).not.toThrow();

      // Verify the button is enabled and clickable
      expect(editButton).not.toBeDisabled();
    });

    it('navigates to edit page when edit button is clicked', () => {
      renderWithContext();

      const editButton = screen.getByRole('button', { name: 'Edit platform gateway settings' });
      editButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('./edit');
    });
  });

  describe('Platform Auditor (hasWritePermissions: false)', () => {
    const auditorContext = {
      ...mockContext,
      hasWritePermissions: false,
      options: {
        GET: mockContext.options.GET,
        // No PUT section for auditor
      },
    } as {
      options: {
        GET: Record<string, unknown>;
        PUT?: Record<string, unknown>;
      };
      settings: Record<string, unknown>;
      hasWritePermissions: boolean;
    };

    it('does not show edit button for platform auditor', () => {
      renderWithContext(auditorContext);

      const editButton = screen.queryByRole('button', { name: 'Edit platform gateway settings' });
      expect(editButton).not.toBeInTheDocument();
    });
  });
});
