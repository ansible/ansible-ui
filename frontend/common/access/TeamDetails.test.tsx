/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TeamDetails, TeamDetailsType } from './TeamDetails';

describe('TeamDetails', () => {
  const baseTeam: TeamDetailsType = {
    name: 'Test Team',
    id: 1,
  };

  it('should render the team name', () => {
    render(
      <MemoryRouter>
        <TeamDetails team={baseTeam} />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Team')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    const team: TeamDetailsType = {
      ...baseTeam,
      description: 'A description for the team',
    };

    render(
      <MemoryRouter>
        <TeamDetails team={team} />
      </MemoryRouter>
    );

    expect(screen.getByText('A description for the team')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    render(
      <MemoryRouter>
        <TeamDetails team={baseTeam} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('should render organization when present in summary_fields', () => {
    const team: TeamDetailsType = {
      ...baseTeam,
      summary_fields: {
        organization: { id: 10, name: 'Default Org' },
      },
    };

    render(
      <MemoryRouter>
        <TeamDetails team={team} />
      </MemoryRouter>
    );

    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('Default Org')).toBeInTheDocument();
  });

  it('should render organization as a link when organizationDetailsUrl is provided', () => {
    const team: TeamDetailsType = {
      ...baseTeam,
      summary_fields: {
        organization: { id: 10, name: 'Linked Org' },
      },
    };

    render(
      <MemoryRouter>
        <TeamDetails team={team} organizationDetailsUrl="/orgs/10" />
      </MemoryRouter>
    );

    expect(screen.getByText('Linked Org')).toBeInTheDocument();
  });

  it('should render created date when available', () => {
    const team: TeamDetailsType = {
      ...baseTeam,
      created: '2024-01-15T10:30:00Z',
    };

    render(
      <MemoryRouter>
        <TeamDetails team={team} />
      </MemoryRouter>
    );

    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render created_on date when created is not available', () => {
    const team: TeamDetailsType = {
      ...baseTeam,
      created_on: '2024-02-20T14:00:00Z',
    };

    render(
      <MemoryRouter>
        <TeamDetails team={team} />
      </MemoryRouter>
    );

    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render modified date when available', () => {
    const team: TeamDetailsType = {
      ...baseTeam,
      modified: '2024-03-01T08:00:00Z',
    };

    render(
      <MemoryRouter>
        <TeamDetails team={team} />
      </MemoryRouter>
    );

    expect(screen.getByText('Last modified')).toBeInTheDocument();
  });

  it('should render created_by user in the date cell', () => {
    const team: TeamDetailsType = {
      ...baseTeam,
      created: '2024-01-15T10:30:00Z',
      summary_fields: {
        created_by: {
          id: 5,
          username: 'admin',
          first_name: 'Admin',
          last_name: 'User',
        },
      },
    };

    render(
      <MemoryRouter>
        <TeamDetails team={team} createdByUserDetailsUrl="/users/5" />
      </MemoryRouter>
    );

    expect(screen.getByText('Created')).toBeInTheDocument();
  });
});
