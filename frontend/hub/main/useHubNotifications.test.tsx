/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { useHubContext } from '../common/useHubContext';
import { useHubNotifications } from './HubMasthead';

const setNotificationGroups = vi.fn(
  (updater: (groups: Record<string, unknown>) => Record<string, unknown>) => updater({})
);

vi.mock('@ansible/ansible-ui-framework/PageNotifications/usePageNotifications', () => ({
  usePageNotifications: () => ({ setNotificationGroups }),
}));

vi.mock('../common/useHubContext', () => ({
  useHubContext: vi.fn(() => ({
    hasPermission: () => true,
  })),
}));

const server = setupServer(
  http.get('*/v3/plugin/ansible/search/collection-versions/*', () =>
    HttpResponse.json({
      meta: { count: 1 },
      data: [
        {
          collection_version: { name: 'staging-col', namespace: 'demo' },
        },
      ],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  setNotificationGroups.mockClear();
  vi.mocked(useHubContext).mockReturnValue({
    hasPermission: () => true,
  });
});
afterAll(() => server.close());

describe('useHubNotifications', () => {
  it('populates collection approvals in notification groups when permitted', async () => {
    renderHook(() => useHubNotifications(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    await waitFor(() => {
      expect(setNotificationGroups).toHaveBeenCalled();
    });

    const updater = setNotificationGroups.mock.calls.at(-1)?.[0] as (
      groups: Record<string, { title: string; notifications: unknown[] }>
    ) => Record<string, { title: string; notifications: unknown[] }>;
    const groups = updater({});
    expect(groups['collection-approvals'].title).toBe('Collection Approvals');
    expect(groups['collection-approvals'].notifications).toHaveLength(1);
  });

  it('does not fetch approvals when the user lacks permission', async () => {
    vi.mocked(useHubContext).mockReturnValue({
      hasPermission: () => false,
    });

    const { result } = renderHook(() => useHubNotifications(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    await waitFor(() => {
      expect(setNotificationGroups).toHaveBeenCalled();
    });

    expect(result.current).toEqual(0);
  });
});
