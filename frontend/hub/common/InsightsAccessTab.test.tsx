import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InsightsAccessTab } from './InsightsAccessTab';

// Mock the LoadingPage component (not needed but keeping for consistency)
vi.mock('@ansible/ansible-ui-framework', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
}));

describe('InsightsAccessTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show empty state when no users or groups have access', () => {
    render(<InsightsAccessTab users={[]} groups={[]} />);

    expect(screen.getByText('No access configured')).toBeInTheDocument();
    expect(
      screen.getByText('There are currently no users or groups with access to this resource.')
    ).toBeInTheDocument();
  });

  it('should display resource name in empty state when provided', () => {
    render(<InsightsAccessTab users={[]} groups={[]} resourceName="my-remote" />);

    expect(screen.getByText('No access configured')).toBeInTheDocument();
    expect(screen.getByText(/Resource: my-remote/)).toBeInTheDocument();
  });

  it('should display users with their roles', () => {
    render(
      <InsightsAccessTab
        users={[
          { username: 'alice', object_roles: ['admin', 'viewer'] },
          { username: 'bob', object_roles: ['viewer'] },
        ]}
        groups={[]}
      />
    );

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getAllByText('viewer')).toHaveLength(2);
  });

  it('should display groups with their roles', () => {
    render(
      <InsightsAccessTab
        users={[]}
        groups={[
          { name: 'admins', object_roles: ['admin'] },
          { name: 'viewers', object_roles: ['viewer'] },
        ]}
      />
    );

    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.getByText('admins')).toBeInTheDocument();
    expect(screen.getByText('viewers')).toBeInTheDocument();
  });

  it('should display both users and groups when both have access', () => {
    render(
      <InsightsAccessTab
        users={[{ username: 'alice', object_roles: ['admin'] }]}
        groups={[{ name: 'admins', object_roles: ['admin'] }]}
      />
    );

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('admins')).toBeInTheDocument();
  });

  it('should expand user row when clicked', () => {
    render(
      <InsightsAccessTab users={[{ username: 'alice', object_roles: ['admin'] }]} groups={[]} />
    );

    expect(screen.getByText('alice')).toBeInTheDocument();

    // Find and click the expand button
    const expandButton = screen
      .getAllByRole('button')
      .find((btn) => btn.className.includes('pf-m-plain'));
    if (!expandButton) {
      throw new Error('Expand button not found');
    }
    fireEvent.click(expandButton);

    expect(screen.getByText('Assigned Roles for alice')).toBeInTheDocument();
  });

  it('should expand group row when clicked', () => {
    render(<InsightsAccessTab users={[]} groups={[{ name: 'admins', object_roles: ['admin'] }]} />);

    expect(screen.getByText('admins')).toBeInTheDocument();

    // Find and click the expand button
    const expandButton = screen
      .getAllByRole('button')
      .find((btn) => btn.className.includes('pf-m-plain'));
    if (!expandButton) {
      throw new Error('Expand button not found');
    }
    fireEvent.click(expandButton);

    expect(screen.getByText('Assigned Roles for admins')).toBeInTheDocument();
  });

  it('should collapse expanded row when clicked again', () => {
    render(
      <InsightsAccessTab users={[{ username: 'alice', object_roles: ['admin'] }]} groups={[]} />
    );

    const expandButton = screen
      .getAllByRole('button')
      .find((btn) => btn.className.includes('pf-m-plain'));
    if (!expandButton) {
      throw new Error('Expand button not found');
    }

    // Expand
    fireEvent.click(expandButton);
    expect(screen.getByText('Assigned Roles for alice')).toBeInTheDocument();

    // Collapse (re-query because the DOM may have changed)
    const collapseButton = screen
      .getAllByRole('button')
      .find((btn) => btn.className.includes('pf-m-plain'));
    if (!collapseButton) {
      throw new Error('Collapse button not found');
    }
    fireEvent.click(collapseButton);
    expect(screen.queryByText('Assigned Roles for alice')).not.toBeInTheDocument();
  });

  it('should show only groups section when no users have access', () => {
    render(<InsightsAccessTab users={[]} groups={[{ name: 'admins', object_roles: ['admin'] }]} />);

    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('should show only users section when no groups have access', () => {
    render(
      <InsightsAccessTab users={[{ username: 'alice', object_roles: ['admin'] }]} groups={[]} />
    );

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.queryByText('Groups')).not.toBeInTheDocument();
  });

  it('should render immediately without loading state', () => {
    render(
      <InsightsAccessTab
        users={[{ username: 'alice', object_roles: ['admin'] }]}
        groups={[{ name: 'admins', object_roles: ['admin'] }]}
      />
    );

    // Should not show loading
    expect(screen.queryByTestId('loading-page')).not.toBeInTheDocument();
    // Should immediately show data
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('admins')).toBeInTheDocument();
  });
});
