/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RulebookActivationToolbar } from './ActivationsToolbar';

describe('RulebookActivationToolbar', () => {
  const defaultProps = {
    toolbarFilters: [],
    filterState: {},
    setFilterState: vi.fn(),
    isFollowModeEnabled: false,
    setIsFollowModeEnabled: vi.fn(),
    isRunning: false,
    onClearLogs: vi.fn(),
  };

  it('should render toolbar without follow button when not running', () => {
    render(<RulebookActivationToolbar {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /Follow/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Unfollow/i })).not.toBeInTheDocument();
  });

  it('should render Follow button when running and follow mode is disabled', () => {
    render(<RulebookActivationToolbar {...defaultProps} isRunning={true} />);
    expect(screen.getByRole('button', { name: /Follow/i })).toBeInTheDocument();
  });

  it('should render Unfollow button when running and follow mode is enabled', () => {
    render(
      <RulebookActivationToolbar {...defaultProps} isRunning={true} isFollowModeEnabled={true} />
    );
    expect(screen.getByRole('button', { name: /Unfollow/i })).toBeInTheDocument();
  });

  it('should render the dangerous Delete logs action when allowed', () => {
    render(<RulebookActivationToolbar {...defaultProps} />);

    const deleteLogs = screen.getByRole('button', { name: 'Delete logs' });
    expect(deleteLogs).toBeEnabled();
    expect(deleteLogs).toHaveClass('pf-m-secondary');
  });

  it('should call onClearLogs when the allowed Delete logs action is clicked', async () => {
    const user = userEvent.setup();
    const onClearLogs = vi.fn();
    render(<RulebookActivationToolbar {...defaultProps} onClearLogs={onClearLogs} />);

    await user.click(screen.getByRole('button', { name: 'Delete logs' }));

    expect(onClearLogs).toHaveBeenCalledOnce();
  });

  it('should call setIsFollowModeEnabled(true) when Follow is clicked', async () => {
    const user = userEvent.setup();
    const setIsFollowModeEnabled = vi.fn();
    render(
      <RulebookActivationToolbar
        {...defaultProps}
        isRunning={true}
        setIsFollowModeEnabled={setIsFollowModeEnabled}
      />
    );

    await user.click(screen.getByRole('button', { name: /Follow/i }));
    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(true);
  });

  it('should call setIsFollowModeEnabled(false) when Unfollow is clicked', async () => {
    const user = userEvent.setup();
    const setIsFollowModeEnabled = vi.fn();
    render(
      <RulebookActivationToolbar
        {...defaultProps}
        isRunning={true}
        isFollowModeEnabled={true}
        setIsFollowModeEnabled={setIsFollowModeEnabled}
      />
    );

    await user.click(screen.getByRole('button', { name: /Unfollow/i }));
    expect(setIsFollowModeEnabled).toHaveBeenCalledWith(false);
  });
});
