import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IPageNotification } from './PageNotification';
import { IPageNotificationGroup } from './PageNotificationGroup';
import { usePageNotifications } from './usePageNotifications';

interface IPageNotificationsRead {
  readMap: Record<string, boolean | undefined>;
  setNotificationRead: (to: string, read: boolean) => void;
}

const usePageNotificationsReadState = create<IPageNotificationsRead>()(
  persist(
    (set) => ({
      readMap: {},
      setNotificationRead: (to, read) => {
        set((state) => {
          const readMap = { ...state.readMap, [to]: read };
          return { readMap };
        });
      },
    }),
    { name: 'notifications-read' }
  )
);

export function usePageNotificationsRead() {
  const { readMap } = usePageNotificationsReadState();
  const { notificationGroups } = usePageNotifications();
  return {
    markAllNotificationsRead: () => {
      usePageNotificationsReadState.setState({
        readMap: Object.values(notificationGroups).reduce(
          (acc: Record<string, boolean>, group: IPageNotificationGroup) => {
            group.notifications.forEach((notification: IPageNotification) => {
              acc[notification.id] = true;
            });
            return acc;
          },
          {} as Record<string, boolean>
        ),
      });
    },
    markAllNotificationsUnread: () => {
      usePageNotificationsReadState.setState({ readMap: {} });
    },
    setNotificationRead: (to: string, read: boolean) => {
      usePageNotificationsReadState.getState().setNotificationRead(to, read);
    },
    isNotificationRead: (to: string) => {
      return readMap[to] === true;
    },
  };
}
