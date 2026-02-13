import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { InsightsSelectRoles, Role } from './InsightsSelectRoles';

// Mock framework hooks
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
    useGetPageUrl: () => () => '/mock-url',
  };
});

const mockRoles: Role[] = [
  {
    name: 'galaxy.admin',
    description: 'Administrator role',
    pulp_href: '/api/roles/1/',
    permissions: ['galaxy.change_namespace', 'galaxy.delete_namespace'],
  },
  {
    name: 'galaxy.editor',
    description: 'Editor role',
    pulp_href: '/api/roles/2/',
    permissions: ['galaxy.change_namespace'],
  },
  {
    name: 'galaxy.viewer',
    description: 'Viewer role',
    pulp_href: '/api/roles/3/',
    permissions: ['galaxy.view_namespace'],
  },
];

const server = setupServer(
  http.get('*/pulp/api/v3/roles/', () => {
    return HttpResponse.json({
      count: 3,
      results: mockRoles,
      next: null,
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InsightsSelectRoles', () => {
  const defaultProps = {
    assignedRoles: [] as string[],
    selectedRoles: [] as Role[],
    onSelectRoles: vi.fn(),
    pulpObjectType: 'pulp_ansible/namespaces',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <InsightsSelectRoles {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  describe('Empty State', () => {
    it('should show empty state when no roles available', async () => {
      server.use(
        http.get('*/pulp/api/v3/roles/', () => {
          return HttpResponse.json({
            count: 0,
            results: [],
            next: null,
          });
        })
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No roles found')).toBeInTheDocument();
      });
    });
  });

  describe('Role List Display', () => {
    it('should display roles from API', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('galaxy.admin')).toBeInTheDocument();
        expect(screen.getByText('galaxy.editor')).toBeInTheDocument();
        expect(screen.getByText('galaxy.viewer')).toBeInTheDocument();
      });
    });

    it('should show Role and Description column headers', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
      });
    });

    it('should display role descriptions', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Administrator role')).toBeInTheDocument();
        expect(screen.getByText('Editor role')).toBeInTheDocument();
        expect(screen.getByText('Viewer role')).toBeInTheDocument();
      });
    });
  });

  describe('Selected Roles Display', () => {
    it('should show selected roles label when roles are selected', () => {
      renderComponent({ selectedRoles: [mockRoles[0]] });

      expect(screen.getByText('Selected roles')).toBeInTheDocument();
    });

    it('should allow removing selected roles', async () => {
      const onSelectRoles = vi.fn();
      renderComponent({ selectedRoles: [mockRoles[0], mockRoles[1]], onSelectRoles });

      // Find and click the remove button for galaxy.admin
      const removeButtons = screen.getAllByRole('button', { name: /close/i });
      await userEvent.click(removeButtons[0]);

      expect(onSelectRoles).toHaveBeenCalledWith([mockRoles[1]]);
    });
  });

  describe('Filtering Assigned Roles', () => {
    it('should filter out already assigned roles from the list', async () => {
      renderComponent({ assignedRoles: ['galaxy.editor'] });

      await waitFor(() => {
        expect(screen.getByText('galaxy.admin')).toBeInTheDocument();
        expect(screen.getByText('galaxy.viewer')).toBeInTheDocument();
      });

      // galaxy.editor should be filtered out - check that it's not in any table cell
      const cells = screen.queryAllByRole('cell');
      const editorCell = cells.find((cell) => cell.textContent === 'galaxy.editor');
      expect(editorCell).toBeUndefined();
    });
  });

  describe('Message Display', () => {
    it('should display custom message when provided', async () => {
      const customMessage = 'Select roles for this specific resource';
      renderComponent({ message: customMessage });

      await waitFor(() => {
        expect(screen.getByText(customMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Role Selection', () => {
    it('should call onSelectRoles when a role checkbox is clicked', async () => {
      const onSelectRoles = vi.fn();
      renderComponent({ onSelectRoles });

      await waitFor(() => {
        expect(screen.getByText('galaxy.admin')).toBeInTheDocument();
      });

      // Click on the checkbox for galaxy.admin
      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);

      expect(onSelectRoles).toHaveBeenCalled();
    });
  });
});
