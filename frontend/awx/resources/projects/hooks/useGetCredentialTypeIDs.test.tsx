import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGetCredentialTypeIDs } from './useGetCredentialTypeIDs';

const server = setupServer(
  http.get(awxAPI`/credential_types/`, ({ request }) => {
    const url = new URL(request.url);
    const kind = url.searchParams.get('kind');
    const name = url.searchParams.get('name');

    if (kind === 'scm') {
      return HttpResponse.json({
        count: 1,
        results: [{ id: 2, name: 'Source Control', kind: 'scm' }],
      });
    }
    if (name === 'Insights') {
      return HttpResponse.json({
        count: 1,
        results: [{ id: 13, name: 'Insights', kind: 'insights' }],
      });
    }
    if (kind === 'cryptography') {
      return HttpResponse.json({
        count: 1,
        results: [{ id: 14, name: 'Vault', kind: 'cryptography' }],
      });
    }
    if (kind === 'registry') {
      return HttpResponse.json({
        count: 1,
        results: [{ id: 17, name: 'Container Registry', kind: 'registry' }],
      });
    }
    if (kind === 'galaxy') {
      return HttpResponse.json({
        count: 1,
        results: [{ id: 18, name: 'Galaxy/Automation Hub', kind: 'galaxy' }],
      });
    }
    return HttpResponse.json({ count: 0, results: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useGetCredentialTypeIDs', () => {
  it('should return credential type IDs for all five types', async () => {
    const { result } = renderHook(() => useGetCredentialTypeIDs());

    await waitFor(() => {
      expect(result.current['scm']).toBeDefined();
    });

    expect(result.current).toEqual({
      scm: 2,
      insights: 13,
      cryptography: 14,
      registry: 17,
      galaxy: 18,
    });
  });

  it('should return partial results when some types have no data', async () => {
    server.use(
      http.get(awxAPI`/credential_types/`, ({ request }) => {
        const url = new URL(request.url);
        const kind = url.searchParams.get('kind');

        if (kind === 'scm') {
          return HttpResponse.json({ count: 1, results: [{ id: 2, name: 'SCM' }] });
        }
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { result } = renderHook(() => useGetCredentialTypeIDs());

    await waitFor(() => {
      expect(result.current['scm']).toBeDefined();
    });

    expect(result.current['scm']).toBe(2);
  });
});
