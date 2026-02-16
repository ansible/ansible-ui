import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { TimezoneToggle } from './TimezoneToggle';

describe('TimezoneToggle', () => {
  test('should render with local timezone and UTC options', () => {
    const setIsLocal = vi.fn();
    render(
      <TimezoneToggle isLocal={true} setIsLocal={setIsLocal} localTimezone="America/New_York" />
    );

    expect(screen.getByText('America/New_York')).toBeInTheDocument();
    expect(screen.getByText('UTC')).toBeInTheDocument();
  });

  test('should show local as selected when isLocal is true', () => {
    render(<TimezoneToggle isLocal={true} setIsLocal={() => {}} localTimezone="Europe/London" />);

    const localToggle = screen.getByTestId('toggle-local');
    const button = localToggle.querySelector('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  test('should show UTC as selected when isLocal is false', () => {
    render(
      <TimezoneToggle isLocal={false} setIsLocal={() => {}} localTimezone="America/New_York" />
    );

    const utcButton = screen.getByRole('button', { name: /Toggle to UTC/i });
    expect(utcButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should call setIsLocal with true when local timezone is clicked', async () => {
    const user = userEvent.setup();
    const setIsLocal = vi.fn();
    render(
      <TimezoneToggle isLocal={false} setIsLocal={setIsLocal} localTimezone="America/New_York" />
    );

    await user.click(screen.getByText('America/New_York'));

    expect(setIsLocal).toHaveBeenCalledWith(true);
  });

  test('should call setIsLocal with false when UTC is clicked', async () => {
    const user = userEvent.setup();
    const setIsLocal = vi.fn();
    render(
      <TimezoneToggle isLocal={true} setIsLocal={setIsLocal} localTimezone="America/New_York" />
    );

    await user.click(screen.getByText('UTC'));

    expect(setIsLocal).toHaveBeenCalledWith(false);
  });
});
