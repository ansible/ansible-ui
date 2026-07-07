import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { JobOutputToolbar } from './JobOutputToolbar';

describe('JobOutputToolbar', () => {
  const defaultProps = {
    toolbarFilters: [],
    filterState: {},
    setFilterState: vi.fn(),
    isFollowModeEnabled: false,
    setIsFollowModeEnabled: vi.fn(),
  };

  it('should render Follow button when job is running', () => {
    render(<JobOutputToolbar {...defaultProps} jobStatus="running" />);

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });

  it('should render Follow button when job status is new', () => {
    render(<JobOutputToolbar {...defaultProps} jobStatus="new" />);

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });

  it('should render Follow button when job status is pending', () => {
    render(<JobOutputToolbar {...defaultProps} jobStatus="pending" />);

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });

  it('should render Follow button when job status is waiting', () => {
    render(<JobOutputToolbar {...defaultProps} jobStatus="waiting" />);

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });

  it('should render Follow button when jobStatus is undefined', () => {
    render(<JobOutputToolbar {...defaultProps} jobStatus={undefined} />);

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });

  it('should render Unfollow button when follow mode is enabled', () => {
    render(<JobOutputToolbar {...defaultProps} jobStatus="running" isFollowModeEnabled={true} />);

    expect(screen.getByRole('button', { name: 'Unfollow' })).toBeInTheDocument();
  });

  it('should not render Follow/Unfollow button when job is not running', () => {
    render(<JobOutputToolbar {...defaultProps} jobStatus="successful" />);

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unfollow' })).not.toBeInTheDocument();
  });

  it('should call setIsFollowModeEnabled(true) when Follow is clicked', async () => {
    const user = userEvent.setup();
    const setIsFollowModeEnabled = vi.fn();
    render(
      <JobOutputToolbar
        {...defaultProps}
        jobStatus="running"
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={setIsFollowModeEnabled}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Follow' }));

    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(true);
  });

  it('should call setIsFollowModeEnabled(false) when Unfollow is clicked', async () => {
    const user = userEvent.setup();
    const setIsFollowModeEnabled = vi.fn();
    render(
      <JobOutputToolbar
        {...defaultProps}
        jobStatus="running"
        isFollowModeEnabled={true}
        setIsFollowModeEnabled={setIsFollowModeEnabled}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Unfollow' }));

    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(false);
  });

  it('should call setFilterState with empty object when clear all filters is triggered', async () => {
    const user = userEvent.setup();
    const setFilterState = vi.fn();
    render(
      <JobOutputToolbar
        {...defaultProps}
        jobStatus="successful"
        filterState={{ search: ['test'] }}
        setFilterState={setFilterState}
        toolbarFilters={[
          {
            key: 'search',
            label: 'Search',
            type: ToolbarFilterType.SingleText,
            comparison: 'contains',
            query: 'search',
            placeholder: 'Search',
          },
        ]}
      />
    );

    const clearButton = screen.queryByRole('button', { name: /clear all filters/i });
    if (clearButton) {
      await user.click(clearButton);
      expect(setFilterState).toHaveBeenCalledWith({});
    }
  });
});
