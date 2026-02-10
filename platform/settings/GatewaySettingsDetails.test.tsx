import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GatewaySettingsDetails } from './GatewaySettingsDetails';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: vi.fn(),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

    const categoriesModule = await import('./GatewaySettingsCategories');
    mockUseGatewaySettingsCategories = vi.mocked(categoriesModule).useGatewaySettingsCategories;
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
    it('should show edit button for admin user', () => {
      renderWithContext();

      const editButton = screen.getByRole('button', { name: 'Edit platform gateway settings' });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveTextContent('Edit platform gateway settings');
    });

    it('should have clickable edit button for admin user', () => {
      renderWithContext();

      const editButton = screen.getByRole('button', { name: 'Edit platform gateway settings' });
      expect(() => editButton.click()).not.toThrow();
      expect(editButton).not.toBeDisabled();
    });

    it('should navigate to edit page when edit button is clicked', () => {
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

    it('should not show edit button for platform auditor', () => {
      renderWithContext(auditorContext);

      const editButton = screen.queryByRole('button', { name: 'Edit platform gateway settings' });
      expect(editButton).not.toBeInTheDocument();
    });
  });
});
