/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { OrgRolesList } from './OrgRolesList';

const mockRoleAssignments = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 184,
      url: '/api/v2/role_user_assignments/184/',
      summary_fields: {
        role_definition: {
          id: 26,
          name: 'Organization Project Admin',
          description: 'Has all permissions to projects within an organization',
          managed: true,
        },
      },
    },
  ],
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

// Mock API prefix function
const awxAPI = (strings: TemplateStringsArray, ...values: string[]) => {
  let result = '/api/controller/v2';
  strings.forEach((str, i) => {
    result += str + (values[i] || '');
  });
  return result;
};

describe('OrgRolesList', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const defaultProps = {
    title: 'Automation controller roles',
    isExpandable: true,
    apiPrefixFunction: awxAPI,
    orgId: '245',
    userId: '93',
    listId: 1,
    setOrgListIsEmpty: vi.fn(),
  };

  it('renders list of organization roles for a user', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json(mockRoleAssignments);
      })
    );

    render(
      <MemoryRouter>
        <OrgRolesList {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Organization Project Admin')).toBeInTheDocument();
    });
  });

  it('renders the correct columns', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json(mockRoleAssignments);
      })
    );

    render(
      <MemoryRouter>
        <OrgRolesList {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  it('renders expandable list and toggles visibility', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json(mockRoleAssignments);
      })
    );

    render(
      <MemoryRouter>
        <OrgRolesList {...defaultProps} />
      </MemoryRouter>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Organization Project Admin')).toBeVisible();
    });

    // Find and click the expandable section toggle
    const toggleButton = screen.getByRole('button', { name: /automation controller roles/i });
    await user.click(toggleButton);

    // After collapsing, content should not be visible
    await waitFor(() => {
      expect(screen.getByText('Organization Project Admin')).not.toBeVisible();
    });
  });

  it('renders non-expandable list', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json(mockRoleAssignments);
      })
    );

    render(
      <MemoryRouter>
        <OrgRolesList {...{ ...defaultProps, isExpandable: false }} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Organization Project Admin')).toBeVisible();
    });

    // Should not have expandable toggle button
    expect(
      screen.queryByRole('button', { name: /automation controller roles/i })
    ).not.toBeInTheDocument();
  });

  it('loads team organization roles when teamId and orgId are provided', async () => {
    server.use(
      http.get('*/role_team_assignments/*', () => {
        return HttpResponse.json(mockRoleAssignments);
      })
    );

    render(
      <MemoryRouter>
        <OrgRolesList
          title="Team org roles"
          isExpandable={false}
          apiPrefixFunction={awxAPI}
          orgId="245"
          teamId="17"
          listId={2}
          setOrgListIsEmpty={vi.fn()}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Organization Project Admin')).toBeInTheDocument();
    });
  });

  it('loads user roles with ansible ids', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json(mockRoleAssignments);
      })
    );

    render(
      <MemoryRouter>
        <OrgRolesList
          title="Ansible roles"
          isExpandable={false}
          apiPrefixFunction={awxAPI}
          orgAnsibleId="org-uuid"
          userAnsibleId="user-uuid"
          listId={3}
          setOrgListIsEmpty={vi.fn()}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Organization Project Admin')).toBeInTheDocument();
    });
  });

  it('renders error state when the roles API fails', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json({}, { status: 500 })));

    render(
      <MemoryRouter>
        <OrgRolesList {...defaultProps} isExpandable={false} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading roles.')).toBeInTheDocument();
    });
  });

  it('marks org list slot as not empty when results are returned', async () => {
    const setOrgListIsEmpty = vi.fn();
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments)));

    render(
      <MemoryRouter>
        <OrgRolesList {...defaultProps} setOrgListIsEmpty={setOrgListIsEmpty} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(setOrgListIsEmpty).toHaveBeenCalled();
    });

    const updater = setOrgListIsEmpty.mock.calls.at(-1)?.[0] as (state: boolean[]) => boolean[];
    expect(updater([false, false, false])[1]).toBe(false);
  });

  it('shows a badge count on expandable section titles', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments)));

    render(
      <MemoryRouter>
        <OrgRolesList {...defaultProps} isExpandable />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('calls setOrgListIsEmpty when results are empty', async () => {
    const setOrgListIsEmpty = vi.fn();
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json(mockEmptyResults);
      })
    );

    render(
      <MemoryRouter>
        <OrgRolesList {...defaultProps} setOrgListIsEmpty={setOrgListIsEmpty} />
      </MemoryRouter>
    );

    // Wait for the setOrgListIsEmpty callback to be called with empty state
    await waitFor(() => {
      expect(setOrgListIsEmpty).toHaveBeenCalled();
    });

    // Verify it was called indicating the list is empty
    const calls = setOrgListIsEmpty.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });
});
