import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageNotificationGroup } from './PageNotificationGroup';
import { PageNotificationsDrawer } from './PageNotificationsDrawer';
import { usePageNotifications } from './usePageNotifications';
import { usePageNotificationsRead } from './usePageNotificationsRead';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function SeedNotifications(props: { children: ReactNode }) {
  const { setNotificationGroups } = usePageNotifications();
  useEffect(() => {
    setNotificationGroups(() => ({
      main: {
        title: 'Main',
        notifications: [
          {
            id: 'navigate-id',
            title: 'Go internal',
            description: 'Open internal route',
            to: '/jobs',
            timestamp: '2024-06-01T12:00:00Z',
            variant: 'info',
          },
          {
            id: 'newtab-id',
            title: 'Open external',
            description: 'Open external',
            to: 'https://example.com/ext',
            newTab: true,
            timestamp: '2024-05-01T12:00:00Z',
          },
          {
            id: 'link-id',
            title: 'With link in body',
            description: (
              <a href="https://example.com/in-body" data-testid="in-body-link">
                In-body link
              </a>
            ),
            timestamp: '2024-04-01T12:00:00Z',
          },
        ],
      },
    }));
  }, [setNotificationGroups]);
  return <>{props.children}</>;
}

describe('PageNotifications', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();

    act(() => {
      usePageNotifications.setState({
        notificationsDrawerOpen: false,
        notificationGroups: {},
      });
    });

    const { result } = renderHook(() => usePageNotificationsRead());
    act(() => {
      result.current.markAllNotificationsUnread();
    });
  });

  it('shows empty state when a group has no notifications', () => {
    render(
      <MemoryRouter>
        <PageNotificationGroup group={{ title: 'Empty group', notifications: [] }} />
      </MemoryRouter>
    );
    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.getByText('There are currently no notifications.')).toBeInTheDocument();
  });

  it('marks all notifications read from the drawer header menu', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SeedNotifications>
          <PageNotificationsDrawer />
        </SeedNotifications>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('notifications-drawer')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Toggle notifications menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Mark all read' }));

    const read = renderHook(() => usePageNotificationsRead());
    expect(read.result.current.isNotificationRead('navigate-id')).toBe(true);
  });

  it('marks all unread from the drawer header menu', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <SeedNotifications>
          <PageNotificationsDrawer />
        </SeedNotifications>
      </MemoryRouter>
    );

    const read = renderHook(() => usePageNotificationsRead());
    act(() => {
      read.result.current.markAllNotificationsRead();
    });

    await user.click(screen.getByRole('button', { name: 'Toggle notifications menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Mark none read' }));

    expect(read.result.current.isNotificationRead('navigate-id')).toBe(false);
  });

  it('navigates internally when a notification with a route is activated', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SeedNotifications>
          <PageNotificationGroup
            group={{
              title: 'Jobs',
              notifications: [
                {
                  id: 'navigate-id',
                  title: 'Go internal',
                  to: '/jobs',
                  variant: 'info',
                },
              ],
            }}
          />
        </SeedNotifications>
      </MemoryRouter>
    );

    await user.click(screen.getByText('Go internal'));
    expect(mockNavigate).toHaveBeenCalledWith('/jobs');
  });

  it('opens external targets in a new tab when newTab is set', async () => {
    const user = userEvent.setup();
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MemoryRouter>
        <SeedNotifications>
          <PageNotificationGroup
            group={{
              title: 'External',
              notifications: [
                {
                  id: 'newtab-id',
                  title: 'Open external',
                  to: 'https://example.com/ext',
                  newTab: true,
                },
              ],
            }}
          />
        </SeedNotifications>
      </MemoryRouter>
    );

    await user.click(screen.getByText('Open external'));
    expect(windowOpen).toHaveBeenCalledWith('https://example.com/ext', '_blank');

    windowOpen.mockRestore();
  });

  it('opens links inside the description in a new window without navigating internally', async () => {
    const user = userEvent.setup();
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MemoryRouter>
        <SeedNotifications>
          <PageNotificationGroup
            group={{
              title: 'Rich',
              notifications: [
                {
                  id: 'link-id',
                  title: 'With link in body',
                  description: (
                    <a href="https://example.com/in-body" data-testid="in-body-link">
                      In-body link
                    </a>
                  ),
                  to: '/should-not-run',
                },
              ],
            }}
          />
        </SeedNotifications>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('in-body-link'));
    expect(windowOpen).toHaveBeenCalledWith(
      'https://example.com/in-body',
      '_blank',
      'noopener,noreferrer'
    );
    expect(mockNavigate).not.toHaveBeenCalled();

    windowOpen.mockRestore();
  });

  it('closes the drawer from the header close control', async () => {
    const user = userEvent.setup();
    act(() => {
      usePageNotifications.setState({ notificationsDrawerOpen: true });
    });

    render(
      <MemoryRouter>
        <SeedNotifications>
          <PageNotificationsDrawer />
        </SeedNotifications>
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(usePageNotifications.getState().notificationsDrawerOpen).toBe(false);
  });

  it('persists notification group expanded state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PageNotificationGroup
          group={{
            title: 'Jobs',
            notifications: [{ id: 'j1', title: 'Job finished' }],
          }}
        />
      </MemoryRouter>
    );

    const toggle = screen.getByRole('button', { name: /Jobs/ });
    await user.click(toggle);
    expect(localStorage.getItem('notifications-group-Jobs')).toBe('true');
  });

  it('marks an individual notification unread from its overflow menu', async () => {
    const user = userEvent.setup();

    const read = renderHook(() => usePageNotificationsRead());
    act(() => {
      read.result.current.setNotificationRead('two', true);
    });

    render(
      <MemoryRouter>
        <PageNotificationGroup
          group={{
            title: 'Items',
            notifications: [
              {
                id: 'two',
                title: 'Note two',
                timestamp: '2024-01-02T10:00:00Z',
                variant: 'warning',
              },
            ],
          }}
        />
      </MemoryRouter>
    );

    const row = screen.getByText('Note two').closest('li');
    const toggles = within(row as HTMLElement).getAllByRole('button', { hidden: true });
    await user.click(toggles[toggles.length - 1]);
    await user.click(screen.getByRole('menuitem', { name: 'Mark unread' }));

    expect(read.result.current.isNotificationRead('two')).toBe(false);
  });

  it('marks an individual notification read from its overflow menu', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PageNotificationGroup
          group={{
            title: 'Items',
            notifications: [{ id: 'one', title: 'Note one', variant: 'info' }],
          }}
        />
      </MemoryRouter>
    );

    const row = screen.getByText('Note one').closest('li');
    expect(row).toBeTruthy();

    const toggles = within(row as HTMLElement).getAllByRole('button', { hidden: true });
    const overflowToggle = toggles[toggles.length - 1];
    await user.click(overflowToggle);

    await user.click(screen.getByRole('menuitem', { name: 'Mark read' }));

    const read = renderHook(() => usePageNotificationsRead());
    expect(read.result.current.isNotificationRead('one')).toBe(true);
  });
});
