/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AwxUser } from '../../../interfaces/User';
import { UserRoles } from './UserRoles';

const createMockUser = (overrides: Partial<AwxUser> = {}): AwxUser =>
  ({
    id: 1,
    username: 'testuser',
    is_superuser: false,
    created: '',
    modified: '',
    summary_fields: { user_capabilities: {} },
    ...overrides,
  }) as AwxUser;

describe('UserRoles', () => {
  it('should render System administrator label for superuser', () => {
    const user = createMockUser({ is_superuser: true });

    render(
      <MemoryRouter>
        <UserRoles user={user} />
      </MemoryRouter>
    );

    expect(screen.getByText('System administrator')).toBeInTheDocument();
  });

  it('should render Normal user label for non-superuser', () => {
    const user = createMockUser({ is_superuser: false });

    render(
      <MemoryRouter>
        <UserRoles user={user} />
      </MemoryRouter>
    );

    expect(screen.getByText('Normal user')).toBeInTheDocument();
  });
});
