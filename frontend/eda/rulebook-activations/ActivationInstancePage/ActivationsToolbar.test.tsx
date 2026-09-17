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
    isClearLogsDisabled: false,
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

  it('should render the dangerous Clear logs action when allowed', () => {
    render(<RulebookActivationToolbar {...defaultProps} />);

    const clearLogs = screen.getByRole('button', { name: 'Clear logs' });
    expect(clearLogs).toBeEnabled();
    expect(clearLogs).toHaveClass('pf-m-secondary');
  });

  it('should keep Clear logs aria-disabled when clearing is not allowed', async () => {
    const user = userEvent.setup();
    const onClearLogs = vi.fn();
    render(
      <RulebookActivationToolbar
        {...defaultProps}
        isClearLogsDisabled={true}
        onClearLogs={onClearLogs}
      />
    );

    const clearLogs = screen.getByRole('button', { name: 'Clear logs' });
    expect(clearLogs).toHaveAttribute('aria-disabled', 'true');
    await user.click(clearLogs);
    expect(onClearLogs).not.toHaveBeenCalled();
  });

  it('should call onClearLogs when the allowed Clear logs action is clicked', async () => {
    const user = userEvent.setup();
    const onClearLogs = vi.fn();
    render(<RulebookActivationToolbar {...defaultProps} onClearLogs={onClearLogs} />);

    await user.click(screen.getByRole('button', { name: 'Clear logs' }));

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
