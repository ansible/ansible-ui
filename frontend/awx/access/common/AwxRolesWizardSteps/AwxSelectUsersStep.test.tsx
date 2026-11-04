import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AwxSelectUsersStep } from './AwxSelectUsersStep';

const mockView = { selectedItems: [], pageItems: [] };

vi.mock('../../../common/useAwxMultiSelectListView', () => ({
  useAwxMultiSelectListView: () => mockView,
}));

vi.mock('@ansible/ansible-ui-framework/PageTable/PageMultiSelectList', () => ({
  PageMultiSelectList: () => <div data-testid="users-list" />,
}));

describe('AwxSelectUsersStep', () => {
  it('renders user selection title and list', () => {
    render(<AwxSelectUsersStep descriptionForUsersSelection="Pick users for the team." />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Select user(s)');
    expect(screen.getByText('Pick users for the team.')).toBeInTheDocument();
    expect(screen.getByTestId('users-list')).toBeInTheDocument();
  });
});
