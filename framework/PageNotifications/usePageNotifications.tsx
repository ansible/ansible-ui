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
      return { notificationGroups };
    });
  },
}));
