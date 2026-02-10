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
