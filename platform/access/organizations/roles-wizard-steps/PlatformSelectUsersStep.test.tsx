import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSelectUsersStep } from './PlatformSelectUsersStep';

let capturedOptions: { queryParams?: Record<string, string> } = {};

vi.mock('../../../common/usePlatformMultiSelectListView', () => ({
  usePlatformMultiSelectListView: vi.fn((options: typeof capturedOptions) => {
    capturedOptions = options;
    return { pageItems: [], itemCount: 0 };
  }),
}));

vi.mock('../../users/hooks/useUsersFilters', () => ({
  useUsersFilters: () => [],
}));

vi.mock('@ansible/ansible-ui-framework/PageTable/PageMultiSelectList', () => ({
  PageMultiSelectList: () => <div data-testid="multi-select-list">list</div>,
}));

describe('PlatformSelectUsersStep', () => {
  beforeEach(() => {
    capturedOptions = {};
  });

  it('renders heading, default description, and user list', () => {
    render(<PlatformSelectUsersStep />);

    expect(screen.getByRole('heading', { name: 'Select user(s)' })).toBeInTheDocument();
    expect(
      screen.getByText('Select the user(s) that you want to apply new roles to.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('multi-select-list')).toBeInTheDocument();
    expect(capturedOptions.queryParams).toEqual({ is_superuser: 'false' });
  });

  it('shows custom description when provided', () => {
    render(<PlatformSelectUsersStep descriptionForUsersSelection="Choose admins only" />);
    expect(screen.getByText('Choose admins only')).toBeInTheDocument();
  });
});
