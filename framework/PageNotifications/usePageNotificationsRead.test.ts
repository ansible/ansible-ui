import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePageNotifications } from './usePageNotifications';
import { usePageNotificationsRead } from './usePageNotificationsRead';

describe('usePageNotificationsRead', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      usePageNotifications.setState({ notificationGroups: {}, notificationsDrawerOpen: false });
    });
    const { result } = renderHook(() => usePageNotificationsRead());
    act(() => {
      result.current.markAllNotificationsUnread();
    });
  });

  it('marks individual notifications read and unread', () => {
    const { result } = renderHook(() => usePageNotificationsRead());

    act(() => {
      result.current.setNotificationRead('n-1', true);
    });
    expect(result.current.isNotificationRead('n-1')).toBe(true);

    act(() => {
      result.current.setNotificationRead('n-1', false);
    });
    expect(result.current.isNotificationRead('n-1')).toBe(false);
  });

  it('marks all notifications read from grouped state', () => {
    act(() => {
      usePageNotifications.setState({
        notificationGroups: {
          main: {
            title: 'Main',
            notifications: [
              { id: 'a', title: 'A' },
              { id: 'b', title: 'B' },
            ],
          },
        },
      });
    });

    const { result } = renderHook(() => usePageNotificationsRead());
    act(() => {
      result.current.markAllNotificationsRead();
    });

    expect(result.current.isNotificationRead('a')).toBe(true);
    expect(result.current.isNotificationRead('b')).toBe(true);

    act(() => {
      result.current.markAllNotificationsUnread();
    });
    expect(result.current.isNotificationRead('a')).toBe(false);
  });
});
