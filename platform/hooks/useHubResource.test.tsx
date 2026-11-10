import { renderHook, waitFor } from '@testing-library/react';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useHubResource } from './useHubResource';

const platformResource = {
  id: 1,
  summary_fields: {
    resource: { ansible_id: 'hub-team-1', resource_type: 'shared.team' },
  },
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useHubResource', () => {
  test('should return the first matching hub resource', async () => {
    server.use(
      http.get(hubAPI`/teams/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('resource__ansible_id')).toBe('hub-team-1');
        return HttpResponse.json({ count: 1, results: [{ id: 3, name: 'hub-team' }] });
      })
    );

    const { result } = renderHook(() => useHubResource<{ id: number }>('teams', platformResource));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.resource).toEqual({ id: 3, name: 'hub-team' });
  });
});
