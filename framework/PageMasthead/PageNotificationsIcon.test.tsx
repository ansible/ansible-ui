import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../PageNotifications/usePageNotifications');
vi.mock('../PageNotifications/usePageNotificationsRead');

import { usePageNotifications } from '../PageNotifications/usePageNotifications';
import { usePageNotificationsRead } from '../PageNotifications/usePageNotificationsRead';
import { PageNotificationsIcon } from './PageNotificationsIcon';

describe('PageNotificationsIcon', () => {
  const mockSetNotificationsDrawerOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNotifications).mockReturnValue({
      setNotificationsDrawerOpen: mockSetNotificationsDrawerOpen,
      notificationGroups: {},
      notificationsDrawerOpen: false,
      setNotificationGroups: vi.fn(),
    });
    vi.mocked(usePageNotificationsRead).mockReturnValue({
      isNotificationRead: vi.fn().mockReturnValue(false),
      markAllNotificationsRead: vi.fn(),
      markAllNotificationsUnread: vi.fn(),
      setNotificationRead: vi.fn(),
    });
  });

  test('should render the notification badge with read variant when there are no notifications', () => {
    render(<PageNotificationsIcon />);
    const badge = screen.getByTestId('notification-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).not.toHaveClass('pf-m-unread');
  });

  test('should show unread variant when there are unread notifications', () => {
    vi.mocked(usePageNotifications).mockReturnValue({
      setNotificationsDrawerOpen: mockSetNotificationsDrawerOpen,
      notificationGroups: {
        group1: {
          title: 'Group 1',
          notifications: [
            { id: 'notif-1', title: 'Notification 1', variant: 'info' },
            { id: 'notif-2', title: 'Notification 2', variant: 'warning' },
          ],
        },
      },
      notificationsDrawerOpen: false,
      setNotificationGroups: vi.fn(),
    });

    render(<PageNotificationsIcon />);
    expect(screen.getByTestId('notification-badge')).toHaveClass('pf-m-unread');
  });

  test('should not count already-read notifications as unread', () => {
    vi.mocked(usePageNotifications).mockReturnValue({
      setNotificationsDrawerOpen: mockSetNotificationsDrawerOpen,
      notificationGroups: {
        group1: {
          title: 'Group 1',
          notifications: [{ id: 'notif-1', title: 'Notification 1', variant: 'info' }],
        },
      },
      notificationsDrawerOpen: false,
      setNotificationGroups: vi.fn(),
    });
    vi.mocked(usePageNotificationsRead).mockReturnValue({
      isNotificationRead: vi.fn().mockReturnValue(true),
      markAllNotificationsRead: vi.fn(),
      markAllNotificationsUnread: vi.fn(),
      setNotificationRead: vi.fn(),
    });

    render(<PageNotificationsIcon />);
    expect(screen.getByTestId('notification-badge')).not.toHaveClass('pf-m-unread');
  });

  test('should skip notifications with non-string ids from unread count', () => {
    vi.mocked(usePageNotifications).mockReturnValue({
      setNotificationsDrawerOpen: mockSetNotificationsDrawerOpen,
      notificationGroups: {
        group1: {
          title: 'Group 1',
          notifications: [
            { id: 42 as unknown as string, title: 'Notification 1', variant: 'info' },
          ],
        },
      },
      notificationsDrawerOpen: false,
      setNotificationGroups: vi.fn(),
    });

    render(<PageNotificationsIcon />);
    expect(screen.getByTestId('notification-badge')).not.toHaveClass('pf-m-unread');
  });

  test('should toggle the notifications drawer when badge is clicked', async () => {
    const user = userEvent.setup();
    render(<PageNotificationsIcon />);

    await user.click(screen.getByTestId('notification-badge'));

    expect(mockSetNotificationsDrawerOpen).toHaveBeenCalled();
    const toggleFn = mockSetNotificationsDrawerOpen.mock.calls[0][0] as (open: boolean) => boolean;
    expect(toggleFn(false)).toBe(true);
    expect(toggleFn(true)).toBe(false);
  });
});
