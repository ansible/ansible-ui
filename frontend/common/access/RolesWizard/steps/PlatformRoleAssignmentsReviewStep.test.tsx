/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlatformRoleAssignmentsReviewStep } from './PlatformRoleAssignmentsReviewStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: vi.fn(() => ({
    wizardData: {
      resourceType: 'credential',
      resources: [{ id: 1, name: 'Resource 1' }],
      users: [{ id: 1, username: 'admin' }],
      teams: [{ id: 1, name: 'Team A' }],
      edaRoles: [
        {
          id: 1,
          name: 'EDA Admin',
          description: 'Full EDA access',
          content_type: 'eda.activation',
        },
      ],
      awxRoles: [
        {
          id: 2,
          name: 'AWX Admin',
          description: 'Full AWX access',
          content_type: 'awx.credential',
        },
      ],
      hubRoles: [
        {
          id: 3,
          name: 'Hub Admin',
          description: 'Full Hub access',
          content_type: 'galaxy.namespace',
        },
      ],
    },
  })),
}));

vi.mock('@ansible/platform-ui/access/roles/hooks/useContentTypeComponentNames', () => ({
  useContentTypeComponentNames: () => () => ['Component A'],
}));

describe('PlatformRoleAssignmentsReviewStep', () => {
  it('should render the review title', () => {
    render(
      <MemoryRouter>
        <PlatformRoleAssignmentsReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
  });

  it('should render resource type detail', () => {
    render(
      <MemoryRouter>
        <PlatformRoleAssignmentsReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Resource type')).toBeInTheDocument();
  });

  it('should render user details when selectedUser is provided', () => {
    render(
      <MemoryRouter>
        <PlatformRoleAssignmentsReviewStep selectedUser={{ id: 1, username: 'testuser123' }} />
      </MemoryRouter>
    );

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('testuser123')).toBeInTheDocument();
  });

  it('should render team details when selectedTeam is provided', () => {
    render(
      <MemoryRouter>
        <PlatformRoleAssignmentsReviewStep selectedTeam={{ id: 1, name: 'Review Team' }} />
      </MemoryRouter>
    );

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Review Team')).toBeInTheDocument();
  });

  it('should render expandable sections for resources and roles', () => {
    render(
      <MemoryRouter>
        <PlatformRoleAssignmentsReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByTestId('expandable-section-resources')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-users')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-teams')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-edaRoles')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-awxRoles')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-hubRoles')).toBeInTheDocument();
  });

  it('should not render selectedUser section when no user', () => {
    render(
      <MemoryRouter>
        <PlatformRoleAssignmentsReviewStep />
      </MemoryRouter>
    );

    expect(screen.queryByText('User')).not.toBeInTheDocument();
  });

  it('should not render selectedTeam section when no team', () => {
    render(
      <MemoryRouter>
        <PlatformRoleAssignmentsReviewStep />
      </MemoryRouter>
    );

    expect(screen.queryByText('Team')).not.toBeInTheDocument();
  });
});
