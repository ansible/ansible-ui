/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@ansible/common-ui/crud/useGet');
vi.mock('swr');
vi.mock('@ansible/ansible-ui-framework/PageNotifications/usePageNotifications');
vi.mock('xml2js');

import { usePageNotifications } from '@ansible/ansible-ui-framework/PageNotifications/usePageNotifications';
import { useGet } from '@ansible/common-ui/crud/useGet';
import useSWR from 'swr';
import { parseStringPromise } from 'xml2js';
import { useRssNotifications } from './useRssNotifications';

describe('useRssNotifications', () => {
  const mockSetNotificationGroups = vi.fn();

  // Helper function to setup gateway settings mock
  function setupGatewaySettings({
    deploymentType = 'standalone',
    feedUrl,
    feedEnabled = true,
  }: {
    deploymentType?: string;
    feedUrl?: string;
    feedEnabled?: boolean;
  }) {
    vi.mocked(useGet).mockReturnValue({
      data: {
        AAP_DEPLOYMENT_TYPE: deploymentType,
        NOTIFICATION_RSS_FEED_URL: feedUrl,
        NOTIFICATION_RSS_FEED_ENABLED: feedEnabled,
      },
      error: undefined,
      refresh: () => undefined,
      isLoading: false,
    });
  }

  // Helper function to setup SWR mock
  function setupSWRMock(data?: string, error?: any) {
    vi.mocked(useSWR).mockReturnValue({
      data,
      error,
      mutate: vi.fn(),
      isValidating: false,
      isLoading: false,
    } as any);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNotifications).mockReturnValue({
      setNotificationGroups: mockSetNotificationGroups,
    });
  });

  test('should not fetch RSS when disabled', () => {
    setupGatewaySettings({
      feedUrl: 'https://example.com/feed.xml',
      feedEnabled: false,
    });
    setupSWRMock();

    renderHook(() => useRssNotifications());

    expect(useSWR).toHaveBeenCalledWith(false, expect.any(Object));
  });

  test('should not fetch RSS when URL is not provided', () => {
    setupGatewaySettings({ feedUrl: undefined });
    setupSWRMock();

    renderHook(() => useRssNotifications());

    // The actual call is: gatewaySettings?.NOTIFICATION_RSS_FEED_ENABLED && gatewaySettings?.NOTIFICATION_RSS_FEED_URL
    // Which evaluates to: true && undefined = undefined
    expect(useSWR).toHaveBeenCalledWith(undefined, expect.any(Object));
  });

  test('should fetch RSS when enabled and URL provided', () => {
    const feedUrl = 'https://example.com/feed.xml';
    setupGatewaySettings({ feedUrl });
    setupSWRMock();

    renderHook(() => useRssNotifications());

    expect(useSWR).toHaveBeenCalledWith(feedUrl, expect.any(Object));
  });

  test('should parse RSS feed and set notifications', async () => {
    const feedUrl = 'https://example.com/feed.xml';
    const feedContent = '<xml>sample feed</xml>';

    setupGatewaySettings({ feedUrl });
    setupSWRMock(feedContent);

    const parsedFeed = {
      feed: {
        title: 'Test Feed',
        entry: {
          id: 'notification-1',
          title: 'Test Notification',
          content: 'Test description',
          updated: '2024-01-01T00:00:00Z',
          'aap:notification': {
            'aap:title': 'AAP Notification Title',
            'aap:description': 'AAP description',
            'aap:publish': '2024-01-01T00:00:00Z',
            'aap:deployment_type': 'standalone',
          },
        },
      },
    };

    vi.mocked(parseStringPromise).mockResolvedValue(parsedFeed);

    renderHook(() => useRssNotifications());

    await vi.waitFor(() => {
      expect(mockSetNotificationGroups).toHaveBeenCalled();
    });

    expect(parseStringPromise).toHaveBeenCalledWith(feedContent, {
      trim: true,
      explicitArray: false,
    });
  });

  test('should filter notifications by deployment type', async () => {
    const feedUrl = 'https://example.com/feed.xml';
    const feedContent = '<xml>sample feed</xml>';

    setupGatewaySettings({ feedUrl });
    setupSWRMock(feedContent);

    const parsedFeed = {
      feed: {
        title: 'Test Feed',
        entry: [
          {
            id: 'notification-1',
            title: 'Standalone Notification',
            content: 'For standalone only',
            updated: '2024-01-01T00:00:00Z',
            'aap:notification': {
              'aap:deployment_type': 'standalone',
            },
          },
          {
            id: 'notification-2',
            title: 'Cloud Notification',
            content: 'For cloud only',
            updated: '2024-01-01T00:00:00Z',
            'aap:notification': {
              'aap:deployment_type': 'cloud',
            },
          },
        ],
      },
    };

    vi.mocked(parseStringPromise).mockResolvedValue(parsedFeed);

    renderHook(() => useRssNotifications());

    await vi.waitFor(() => {
      expect(mockSetNotificationGroups).toHaveBeenCalled();
    });

    // Check that only the matching deployment type notification is included
    const callArgs = mockSetNotificationGroups.mock.calls[0][0];
    const updatedGroups = callArgs({});

    expect(updatedGroups['Test Feed'].notifications).toHaveLength(1);
    expect(updatedGroups['Test Feed'].notifications[0].title).toBe('Standalone Notification');
  });

  test('should skip unpublished notifications', () => {
    const feedUrl = 'https://example.com/feed.xml';
    const feedContent = '<xml>sample feed</xml>';

    setupGatewaySettings({ feedUrl });
    setupSWRMock(feedContent);

    const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday

    const parsedFeed = {
      feed: {
        title: 'Test Feed',
        entry: {
          id: 'notification-1',
          title: 'Unpublished Notification',
          content: 'This should not appear',
          updated: '2024-01-01T00:00:00Z',
          'aap:notification': {
            'aap:unpublish': pastDate,
          },
        },
      },
    };

    vi.mocked(parseStringPromise).mockResolvedValue(parsedFeed);

    renderHook(() => useRssNotifications());

    expect(parseStringPromise).toHaveBeenCalled();

    // Should not set notifications for unpublished items
    expect(mockSetNotificationGroups).not.toHaveBeenCalled();
  });

  test('should handle XML parsing errors gracefully', () => {
    const feedUrl = 'https://example.com/feed.xml';
    const feedContent = 'invalid xml content';

    setupGatewaySettings({ feedUrl });
    setupSWRMock(feedContent);

    vi.mocked(parseStringPromise).mockRejectedValue(new Error('Invalid XML'));

    renderHook(() => useRssNotifications());

    expect(parseStringPromise).toHaveBeenCalled();

    // Should not crash and not set notifications
    expect(mockSetNotificationGroups).not.toHaveBeenCalled();
  });

  test('should handle multiple entries in RSS feed', async () => {
    const feedUrl = 'https://example.com/feed.xml';
    const feedContent = '<xml>sample feed</xml>';

    setupGatewaySettings({ feedUrl });
    setupSWRMock(feedContent);

    const parsedFeed = {
      feed: {
        title: 'Test Feed',
        entry: [
          {
            id: 'notification-1',
            title: 'First Notification',
            content: 'First description',
            updated: '2024-01-01T00:00:00Z',
            'aap:notification': {},
          },
          {
            id: 'notification-2',
            title: 'Second Notification',
            content: 'Second description',
            updated: '2024-01-02T00:00:00Z',
            'aap:notification': {},
          },
        ],
      },
    };

    vi.mocked(parseStringPromise).mockResolvedValue(parsedFeed);

    renderHook(() => useRssNotifications());

    await vi.waitFor(() => {
      expect(mockSetNotificationGroups).toHaveBeenCalled();
    });

    const callArgs = mockSetNotificationGroups.mock.calls[0][0];
    const updatedGroups = callArgs({});

    expect(updatedGroups['Test Feed'].notifications).toHaveLength(2);
    expect(updatedGroups['Test Feed'].notifications[0].title).toBe('First Notification');
    expect(updatedGroups['Test Feed'].notifications[1].title).toBe('Second Notification');
  });

  test('should handle array deployment types', async () => {
    const feedUrl = 'https://example.com/feed.xml';
    const feedContent = '<xml>sample feed</xml>';

    setupGatewaySettings({ feedUrl });
    setupSWRMock(feedContent);

    const parsedFeed = {
      feed: {
        title: 'Test Feed',
        entry: {
          id: 'notification-1',
          title: 'Multi-deployment Notification',
          content: 'For multiple deployments',
          updated: '2024-01-01T00:00:00Z',
          'aap:notification': {
            'aap:deployment_type': ['standalone', 'cloud'],
          },
        },
      },
    };

    vi.mocked(parseStringPromise).mockResolvedValue(parsedFeed);

    renderHook(() => useRssNotifications());

    await vi.waitFor(() => {
      expect(mockSetNotificationGroups).toHaveBeenCalled();
    });

    const callArgs = mockSetNotificationGroups.mock.calls[0][0];
    const updatedGroups = callArgs({});

    expect(updatedGroups['Test Feed'].notifications).toHaveLength(1);
    expect(updatedGroups['Test Feed'].notifications[0].title).toBe('Multi-deployment Notification');
  });
});
