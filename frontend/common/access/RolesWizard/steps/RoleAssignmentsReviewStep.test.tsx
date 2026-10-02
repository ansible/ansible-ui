/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RoleAssignmentsReviewStep } from './RoleAssignmentsReviewStep';

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
      platformRoles: [
        {
          id: 4,
          name: 'Platform Admin',
          description: 'Full platform access',
          content_type: 'shared.organization',
        },
      ],
    },
  })),
}));

vi.mock('@ansible/platform-ui/access/roles/hooks/useContentTypeComponentNames', () => ({
  useContentTypeComponentNames: () => () => ['Component A'],
}));

describe('RoleAssignmentsReviewStep', () => {
  it('should render the review title', () => {
    render(
      <MemoryRouter>
        <RoleAssignmentsReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
  });

  it('should render resource type detail', () => {
    render(
      <MemoryRouter>
        <RoleAssignmentsReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Resource type')).toBeInTheDocument();
  });

  it('should render user details when selectedUser is provided', () => {
    render(
      <MemoryRouter>
        <RoleAssignmentsReviewStep selectedUser={{ id: 1, username: 'reviewuser999' }} />
      </MemoryRouter>
    );

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('reviewuser999')).toBeInTheDocument();
  });

  it('should render team details when selectedTeam is provided', () => {
    render(
      <MemoryRouter>
        <RoleAssignmentsReviewStep selectedTeam={{ id: 1, name: 'Review Team 42' }} />
      </MemoryRouter>
    );

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Review Team 42')).toBeInTheDocument();
  });

  it('should render expandable sections for roles', () => {
    render(
      <MemoryRouter>
        <RoleAssignmentsReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByTestId('expandable-section-resources')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-users')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-teams')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-edaRoles')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-awxRoles')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-hubRoles')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section-platformRoles')).toBeInTheDocument();
  });

  it('should render custom labels for roles sections', () => {
    render(
      <MemoryRouter>
        <RoleAssignmentsReviewStep
          edaRolesLabel="Custom EDA"
          awxRolesLabel="Custom AWX"
          hubRolesLabel="Custom Hub"
          platformRolesLabel="Custom Platform"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Custom EDA')).toBeInTheDocument();
    expect(screen.getByText('Custom AWX')).toBeInTheDocument();
    expect(screen.getByText('Custom Hub')).toBeInTheDocument();
    expect(screen.getByText('Custom Platform')).toBeInTheDocument();
  });
});
