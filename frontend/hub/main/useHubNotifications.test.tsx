/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { useHubNotifications } from './HubMasthead';

vi.mock('../common/useHubContext', () => ({
  useHubContext: () => ({
    hasPermission: () => true,
  }),
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

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useHubNotifications', () => {
  it('returns staging collection approvals for users with permission', async () => {
    const { result } = renderHook(() => useHubNotifications(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
    });
  });
});
