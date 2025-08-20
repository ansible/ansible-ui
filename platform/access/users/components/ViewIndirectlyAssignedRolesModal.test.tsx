import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { ViewIndirectlyAssignedRolesModal } from './ViewIndirectlyAssignedRolesModal';

// Mock Modal component to prevent focus trap errors
vi.mock('@patternfly/react-core', async () => {
  const actual = await vi.importActual('@patternfly/react-core');
  return {
    ...actual,
    Modal: ({
      children,
      isOpen,
      ...props
    }: {
      children: React.ReactNode;
      isOpen: boolean;
      [key: string]: unknown;
    }) =>
      isOpen ? (
        <div data-testid="mock-modal" {...props}>
          {children}
        </div>
      ) : null,
  };
});

const mockUserTeams = {
  results: [
    {
      id: 1,
      name: 'Test Team',
    },
  ],
};

const mockEmptyUserTeams = {
  results: [],
};

const mockTeamRoleAssignments = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      url: gatewayAPI`/role_team_assignments/1/`,
      created: '2024-01-01T00:00:00Z',
      created_by: 1,
      role_definition: 1,
      team: 1,
      content_type: 'platform.organization',
      object_id: '1',
      summary_fields: {
        role_definition: {
          id: 1,
          name: 'Organization Admin',
          description: 'Administer organization',
        },
        team: {
          id: 1,
          name: 'Test Team',
        },
        content_object: {
          id: 1,
          name: 'Test Organization',
        },
      },
    },
    {
      id: 2,
      url: gatewayAPI`/role_team_assignments/2/`,
      created: '2024-01-01T00:00:00Z',
      created_by: 1,
      role_definition: 2,
      team: 1,
      content_type: 'platform.project',
      object_id: '2',
      summary_fields: {
        role_definition: {
          id: 2,
          name: 'Project Member',
          description: 'Member of project',
        },
        team: {
          id: 1,
          name: 'Test Team',
        },
        content_object: {
          id: 2,
          name: 'Test Project',
        },
      },
    },
  ],
};

const mockEmptyTeamRoleAssignments = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('ViewIndirectlyAssignedRolesModal', () => {
  const server = setupServer(
    // Default handlers
    http.get(gatewayAPI`/users/1/teams/`, () => {
      return HttpResponse.json(mockUserTeams);
    }),
    http.get(gatewayAPI`/role_team_assignments/`, () => {
      return HttpResponse.json(mockTeamRoleAssignments);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should display correct modal title and description text', () => {
    const mockOnClose = vi.fn();

    render(
      <MemoryRouter>
        <ViewIndirectlyAssignedRolesModal
          isOpen={true}
          onClose={mockOnClose}
          userId="1"
          username="test-user"
        />
      </MemoryRouter>
    );

    // Check modal is rendered
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

    // Check modal title
    expect(screen.getByText('Indirectly assigned roles for test-user')).toBeInTheDocument();

    // Check modal description
    expect(
      screen.getByText(
        "Below is a list of roles indirectly assigned to this user through a team assignment. To modify roles assigned to the user from a team assignment manage the team's assignments."
      )
    ).toBeInTheDocument();

    // Check close button exists
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  test('should show empty state when user has no indirectly assigned roles', async () => {
    const mockOnClose = vi.fn();

    // Mock empty responses
    server.use(
      http.get(gatewayAPI`/users/1/teams/`, () => {
        return HttpResponse.json(mockEmptyUserTeams);
      }),
      http.get(gatewayAPI`/role_team_assignments/`, () => {
        return HttpResponse.json(mockEmptyTeamRoleAssignments);
      })
    );

    render(
      <MemoryRouter>
        <ViewIndirectlyAssignedRolesModal
          isOpen={true}
          onClose={mockOnClose}
          userId="1"
          username="test-user"
        />
      </MemoryRouter>
    );

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText('No indirectly assigned roles found.')).toBeInTheDocument();
    });

    expect(
      screen.getByText('This user has no roles inherited through team assignments.')
    ).toBeInTheDocument();
  });

  test('should display list of indirectly assigned roles when user has team assignments', async () => {
    const mockOnClose = vi.fn();

    render(
      <MemoryRouter>
        <ViewIndirectlyAssignedRolesModal
          isOpen={true}
          onClose={mockOnClose}
          userId="1"
          username="test-user"
        />
      </MemoryRouter>
    );

    // Wait for role assignments to load and display
    await waitFor(() => {
      expect(screen.getByText('Organization Admin')).toBeInTheDocument();
    });

    // Check that both role assignments are displayed
    expect(screen.getByText('Organization Admin')).toBeInTheDocument();
    expect(screen.getByText('Project Member')).toBeInTheDocument();

    // Check that team names are displayed in "Inherited from" column
    const testTeamLinks = screen.getAllByText('Test Team');
    expect(testTeamLinks.length).toBeGreaterThan(0);
  });

  test('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <MemoryRouter>
        <ViewIndirectlyAssignedRolesModal
          isOpen={true}
          onClose={mockOnClose}
          userId="1"
          username="test-user"
        />
      </MemoryRouter>
    );

    // Wait for modal to render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    // Click close button
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should not render when isOpen is false', () => {
    const mockOnClose = vi.fn();

    render(
      <MemoryRouter>
        <ViewIndirectlyAssignedRolesModal
          isOpen={false}
          onClose={mockOnClose}
          userId="1"
          username="test-user"
        />
      </MemoryRouter>
    );

    // Modal should not be visible
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Indirectly assigned roles for test-user')).not.toBeInTheDocument();
  });
});
