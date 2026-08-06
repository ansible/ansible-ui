/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { UserDetails, UserDetailsType } from './UserDetails';

describe('UserDetails', () => {
  const baseUser: UserDetailsType = {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    username: 'jdoe',
  };

  it('should render user basic details', () => {
    render(
      <MemoryRouter>
        <UserDetails user={baseUser} />
      </MemoryRouter>
    );

    expect(screen.getByText('First name')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Last name')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('jdoe')).toBeInTheDocument();
  });

  it('should render organizations when provided', () => {
    render(
      <MemoryRouter>
        <UserDetails
          user={baseUser}
          organizations={[
            { name: 'Org A', link: '/orgs/1' },
            { name: 'Org B', link: '/orgs/2' },
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Org A')).toBeInTheDocument();
    expect(screen.getByText('Org B')).toBeInTheDocument();
  });

  it('should not render organizations when list is empty', () => {
    render(
      <MemoryRouter>
        <UserDetails user={baseUser} organizations={[]} />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Organization/)).not.toBeInTheDocument();
  });

  it('should render last login when available', () => {
    const user: UserDetailsType = {
      ...baseUser,
      last_login: '2024-06-15T10:30:00Z',
    };

    render(
      <MemoryRouter>
        <UserDetails user={user} />
      </MemoryRouter>
    );

    expect(screen.getByText('Last login')).toBeInTheDocument();
  });

  it('should render created date when available', () => {
    const user: UserDetailsType = {
      ...baseUser,
      created: '2024-01-15T10:30:00Z',
    };

    render(
      <MemoryRouter>
        <UserDetails user={user} />
      </MemoryRouter>
    );

    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render created date from date_joined', () => {
    const user: UserDetailsType = {
      ...baseUser,
      date_joined: '2024-01-15T10:30:00Z',
    };

    render(
      <MemoryRouter>
        <UserDetails user={user} />
      </MemoryRouter>
    );

    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render modified date when available', () => {
    const user: UserDetailsType = {
      ...baseUser,
      modified: '2024-03-01T08:00:00Z',
    };

    render(
      <MemoryRouter>
        <UserDetails user={user} />
      </MemoryRouter>
    );

    expect(screen.getByText('Last modified')).toBeInTheDocument();
  });
});
