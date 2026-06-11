import { create } from 'zustand';
import { IPageNotificationGroup } from './PageNotificationGroup';

interface IPageNotifications {
  notificationsDrawerOpen: boolean;
  setNotificationsDrawerOpen: (
    setter: ((notificationsDrawerOpen: boolean) => boolean) | boolean
  ) => void;
  notificationGroups: Record<string, IPageNotificationGroup>;
  setNotificationGroups: (
    setter: (
      notificationGroups: Record<string, IPageNotificationGroup>
    ) => Record<string, IPageNotificationGroup>
  ) => void;
}

export const usePageNotifications = create<IPageNotifications>()((set) => ({
  notificationsDrawerOpen: false,
  setNotificationsDrawerOpen: (setter) => {
    set((state) => {
      const notificationsDrawerOpen =
        typeof setter === 'function' ? setter(state.notificationsDrawerOpen) : setter;
      return { notificationsDrawerOpen };
    });
  },
  notificationGroups: {},
  setNotificationGroups: (setter) => {
    set((state) => {
      const notificationGroups = setter(state.notificationGroups);
      const sortedGroups = Object.entries(notificationGroups)
        .sort(([_aKey, aGroup], [_bKey, bGroup]) => aGroup.title.localeCompare(bGroup.title))
        .reduce(
          (acc, [key, group]) => {
            // Sort notifications within each group by timestamp
            group.notifications.sort((a, b) => {
              return new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime();
            });
            acc[key] = group;
            return acc;
          },
          {} as Record<string, IPageNotificationGroup>
        );
      return { notificationGroups: sortedGroups };
    });
  },
}));
