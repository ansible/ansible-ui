/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { UserDateDetail } from './UserDateDetail';

const mockUser = {
  id: 42,
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
};

describe('UserDateDetail', () => {
  const createdLabel = 'Created';
  const modifiedLabel = 'Modified';

  test('should render label and date', () => {
    render(
      <MemoryRouter>
        <UserDateDetail label={createdLabel} date="2024-01-15T10:30:00Z" user={mockUser} />
      </MemoryRouter>
    );

    expect(screen.getByText(createdLabel)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('should render user name', () => {
    render(
      <MemoryRouter>
        <UserDateDetail label={modifiedLabel} date="2024-01-15T10:30:00Z" user={mockUser} />
      </MemoryRouter>
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
  });
});
