/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePageNotifications } from './usePageNotifications';

describe('usePageNotifications', () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePageNotifications());
    act(() => {
      result.current.setNotificationsDrawerOpen(false);
      result.current.setNotificationGroups(() => ({}));
    });
  });

  describe('notificationsDrawerOpen', () => {
    it('should default to false', () => {
      const { result } = renderHook(() => usePageNotifications());
      expect(result.current.notificationsDrawerOpen).toBe(false);
    });

    it('should set drawer open with boolean', () => {
      const { result } = renderHook(() => usePageNotifications());
      act(() => result.current.setNotificationsDrawerOpen(true));
      expect(result.current.notificationsDrawerOpen).toBe(true);
    });

    it('should toggle drawer with function setter', () => {
      const { result } = renderHook(() => usePageNotifications());
      act(() => result.current.setNotificationsDrawerOpen(true));
      act(() => result.current.setNotificationsDrawerOpen((prev) => !prev));
      expect(result.current.notificationsDrawerOpen).toBe(false);
    });
  });

  describe('notificationGroups', () => {
    it('should default to empty object', () => {
      const { result } = renderHook(() => usePageNotifications());
      expect(result.current.notificationGroups).toEqual({});
    });

    it('should sort groups by title', () => {
      const { result } = renderHook(() => usePageNotifications());
      act(() =>
        result.current.setNotificationGroups(() => ({
          z: { title: 'Zebra', notifications: [] },
          a: { title: 'Apple', notifications: [] },
          m: { title: 'Mango', notifications: [] },
        }))
      );

      const keys = Object.keys(result.current.notificationGroups);
      expect(keys).toEqual(['a', 'm', 'z']);
    });

    it('should sort notifications within group by timestamp descending', () => {
      const { result } = renderHook(() => usePageNotifications());
      act(() =>
        result.current.setNotificationGroups(() => ({
          group1: {
            title: 'Group',
            notifications: [
              { id: '1', title: 'Old', timestamp: '2024-01-01T00:00:00Z', variant: 'info' },
              { id: '2', title: 'New', timestamp: '2024-06-01T00:00:00Z', variant: 'info' },
              { id: '3', title: 'Mid', timestamp: '2024-03-01T00:00:00Z', variant: 'info' },
            ],
          },
        }))
      );

      const notifications = result.current.notificationGroups['group1'].notifications;
      expect(notifications[0].title).toBe('New');
      expect(notifications[1].title).toBe('Mid');
      expect(notifications[2].title).toBe('Old');
    });

    it('should handle notifications with missing timestamps', () => {
      const { result } = renderHook(() => usePageNotifications());
      act(() =>
        result.current.setNotificationGroups(() => ({
          group1: {
            title: 'Group',
            notifications: [
              { id: '1', title: 'No timestamp', variant: 'info' },
              {
                id: '2',
                title: 'Has timestamp',
                timestamp: '2024-01-01T00:00:00Z',
                variant: 'success',
              },
            ],
          },
        }))
      );

      const notifications = result.current.notificationGroups['group1'].notifications;
      expect(notifications).toHaveLength(2);
    });
  });
});
