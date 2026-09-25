import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageNotification } from './PageNotification';
import { usePageNotifications } from './usePageNotifications';
import { usePageNotificationsRead } from './usePageNotificationsRead';

vi.mock('./usePageNotifications');
vi.mock('./usePageNotificationsRead');

describe('PageNotification', () => {
  const setNotificationsDrawerOpen = vi.fn();
  const setNotificationRead = vi.fn();

  beforeEach(() => {
    vi.mocked(usePageNotifications).mockReturnValue({
      notificationsDrawerOpen: true,
      setNotificationsDrawerOpen,
      notificationGroups: {},
      setNotificationGroups: vi.fn(),
    });
    vi.mocked(usePageNotificationsRead).mockReturnValue({
      markAllNotificationsRead: vi.fn(),
      markAllNotificationsUnread: vi.fn(),
      isNotificationRead: vi.fn(() => false),
      setNotificationRead,
    });
    setNotificationsDrawerOpen.mockClear();
    setNotificationRead.mockClear();
  });

  it('opens a notification target in a new tab with safe window features', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MemoryRouter>
        <PageNotification
          notification={{
            id: 'notification-1',
            title: 'Important update',
            to: '/details',
            newTab: true,
          }}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByText('Important update'));

    expect(open).toHaveBeenCalledWith('/details', '_blank', 'noopener,noreferrer');
    expect(setNotificationRead).toHaveBeenCalledWith('notification-1', true);
    open.mockRestore();
  });
});
