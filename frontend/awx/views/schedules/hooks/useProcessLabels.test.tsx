import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { getScheduleLabels, useProcessLabels } from './useProcessLabels';

type TestLabel = { id: number; name: string; organization: number | null };
const label = (id: number, name = `label-${id}`, organization: number | null = 5): TestLabel => ({
  id,
  name,
  organization,
});
let current: TestLabel[] = [];
let reads = 0;
type LabelPost = {
  id?: number;
  name?: string;
  organization?: number | null;
  disassociate?: boolean;
};
const posts: LabelPost[] = [];
const url = awxAPI`/schedules/42/labels/`;
const server = setupServer(
  http.get(url, () => {
    reads++;
    return HttpResponse.json({ results: current, next: null });
  }),
  http.post<never, LabelPost>(url, async ({ request }) => {
    const body = await request.json();
    posts.push(body);
    return new HttpResponse(null, { status: 204 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  current = [];
  reads = 0;
  posts.length = 0;
});
afterAll(() => server.close());

describe('schedule label reconciliation', () => {
  it('exports the same all-page reader for edit initialization', async () => {
    server.use(
      http.get(url, ({ request }) => {
        const requestUrl = new URL(request.url);
        expect(requestUrl.searchParams.get('page_size')).toBe(
          requestUrl.searchParams.has('page') ? null : '200'
        );
        return HttpResponse.json(
          requestUrl.searchParams.has('page')
            ? { results: [label(2)], next: null }
            : { results: [label(1)], next: new URL('?page=2', request.url).href }
        );
      })
    );

    const labels = await getScheduleLabels(42, new AbortController().signal);

    expect(labels).toEqual([label(1), label(2)]);
    expect(posts).toEqual([]);
  });

  it('does not read or mutate an undefined selection', async () => {
    current = [label(1)];
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, undefined, 5);

    expect(reads).toBe(0);
    expect(posts).toEqual([]);
  });

  it('removes A and adds C without touching retained B', async () => {
    current = [label(1, 'A'), label(2, 'B')];
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [label(2, 'B'), label(3, 'C')], 5);

    expect(reads).toBe(1);
    expect(posts).toEqual([{ id: 1, disassociate: true }, { id: 3 }]);
  });

  it('removes every label for an explicit empty selection', async () => {
    current = [label(1), label(2)];
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [], 5);

    expect(posts).toEqual([
      { id: 1, disassociate: true },
      { id: 2, disassociate: true },
    ]);
  });

  it('reads every next link before calculating the delta', async () => {
    server.use(
      http.get(url, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        reads++;
        return HttpResponse.json(
          page === '2'
            ? { results: [label(2)], next: null }
            : { results: [label(1)], next: `${url}?page=2` }
        );
      })
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [label(2)], 5);

    expect(reads).toBe(2);
    expect(posts).toEqual([{ id: 1, disassociate: true }]);
  });

  it('does not mutate when a later page fails', async () => {
    server.use(
      http.get(url, ({ request }) =>
        new URL(request.url).searchParams.has('page')
          ? HttpResponse.json({ detail: 'Cannot read labels' }, { status: 403 })
          : HttpResponse.json({ results: [label(1)], next: `${url}?page=2` })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await expect(result.current(42, [], 5)).rejects.toMatchObject({ statusCode: 403 });

    expect(posts).toEqual([]);
  });

  it('matches name-only values by organization, not just name', async () => {
    current = [label(1, 'dev', 5), label(2, 'dev', 6), label(3, 'dev', null)];
    const { result } = renderHook(() => useProcessLabels());

    await result.current(
      42,
      [
        { name: 'dev', organization: 6 },
        { name: 'dev', organization: null },
      ],
      5
    );

    expect(posts).toEqual([{ id: 1, disassociate: true }]);
  });

  it('matches an existing ID even if the supplied name or organization changed', async () => {
    current = [label(1)];
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ id: 1, name: 'renamed', organization: 99 }], 5);

    expect(posts).toEqual([]);
  });

  it('uses the resource organization for new labels and deduplicates selections', async () => {
    const { result } = renderHook(() => useProcessLabels());

    await result.current(
      42,
      [{ name: 'new', organization: 99 }, { name: 'new' }, label(2), label(2)],
      5
    );

    expect(posts).toEqual([{ name: 'new', organization: 5 }, { id: 2 }]);
  });

  it.each([undefined, null])(
    'rejects a missing organization for new labels before removing anything (%s)',
    async (organization) => {
      current = [label(1)];
      const { result } = renderHook(() => useProcessLabels());

      await expect(result.current(42, [{ name: 'new' }], organization)).rejects.toBeInstanceOf(
        RequestError
      );

      expect(posts).toEqual([]);
    }
  );

  it('starts all 100 removals in parallel and waits before starting all 100 additions', async () => {
    current = Array.from({ length: 100 }, (_, index) => label(index + 1));
    let releaseRemovals = () => {};
    let releaseAdds = () => {};
    const removalGate = new Promise<void>((resolve) => {
      releaseRemovals = resolve;
    });
    const additionGate = new Promise<void>((resolve) => {
      releaseAdds = resolve;
    });
    server.use(
      http.post<never, LabelPost>(url, async ({ request }) => {
        const body = await request.json();
        posts.push(body);
        await (body.disassociate ? removalGate : additionGate);
        return new HttpResponse(null, { status: 204 });
      })
    );
    const { result } = renderHook(() => useProcessLabels());
    const selected = Array.from({ length: 100 }, (_, index) => label(index + 101));

    const saving = result.current(42, selected, 5);
    try {
      await waitFor(() => expect(posts).toHaveLength(100));
      expect(posts.every((body) => body.disassociate)).toBe(true);
      releaseRemovals();
      await waitFor(() => expect(posts).toHaveLength(200));
      expect(posts.slice(100).every((body) => !body.disassociate)).toBe(true);
    } finally {
      releaseRemovals();
      releaseAdds();
      await saving;
    }
  });

  it('ignores only the exact AWX already-missing removal response', async () => {
    current = [label(1)];
    server.use(
      http.post<never, LabelPost>(url, async ({ request }) => {
        const body = await request.json();
        posts.push(body);
        return body.disassociate
          ? HttpResponse.json({ detail: 'Label matching query does not exist.' }, { status: 400 })
          : new HttpResponse(null, { status: 204 });
      })
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [label(2)], 5);

    expect(posts).toEqual([{ id: 1, disassociate: true }, { id: 2 }]);
  });

  it.each([
    [403, 'Label matching query does not exist.'],
    [404, 'Not found.'],
    [400, 'Organization matching query does not exist.'],
  ])('does not ignore removal error %s / %s', async (status, detail) => {
    current = [label(1)];
    server.use(http.post(url, () => HttpResponse.json({ detail }, { status })));
    const { result } = renderHook(() => useProcessLabels());

    await expect(result.current(42, [label(2)], 5)).rejects.toBeInstanceOf(RequestError);
  });

  it('aggregates only failed removals through the normal form adapter and blocks additions', async () => {
    current = [label(1), label(2), label(3)];
    server.use(
      http.post<never, LabelPost>(url, async ({ request }) => {
        const body = await request.json();
        posts.push(body);
        return body.id === 2
          ? new HttpResponse(null, { status: 204 })
          : HttpResponse.json({ detail: 'Permission denied' }, { status: 403 });
      })
    );
    const { result } = renderHook(() => useProcessLabels());

    const error = await result.current(42, [label(4)], 5).catch((error: unknown) => error);

    expect(error).toBeInstanceOf(RequestError);
    if (!(error instanceof RequestError)) return;
    const { genericErrors, fieldErrors } = awxErrorAdapter(error);
    expect(fieldErrors).toEqual([]);
    expect(error.message).toBe('Failed to remove labels');
    expect(genericErrors[0].message).toBe('Permission denied\nPermission denied');
    expect(posts).toHaveLength(3);
    expect(posts.every((body) => body.disassociate)).toBe(true);
  });

  it('keeps successful additions and re-reads the relationship on retry', async () => {
    current = [label(1)];
    let fail = true;
    server.use(
      http.post<never, LabelPost>(url, async ({ request }) => {
        const body = await request.json();
        posts.push(body);
        if (body.id === undefined) throw new Error('Expected a label ID');
        if (body.id === 3 && fail) {
          return HttpResponse.json(
            { msg: 'LAB_INJECTED_FAILURE: Maximum number of labels reached.' },
            { status: 400 }
          );
        }
        current = body.disassociate
          ? current.filter((item) => item.id !== body.id)
          : [...current, label(body.id)];
        return new HttpResponse(null, { status: 204 });
      })
    );
    const { result } = renderHook(() => useProcessLabels());

    const error = await result
      .current(42, [label(2), label(3)], 5)
      .catch((error: unknown) => error);

    expect(error).toBeInstanceOf(RequestError);
    if (!(error instanceof RequestError)) return;
    expect(error.message).toBe('Failed to add labels');
    expect(error.json).toEqual({
      detail: 'LAB_INJECTED_FAILURE: Maximum number of labels reached.',
    });
    expect(current).toEqual([label(2)]);
    posts.length = 0;
    fail = false;

    await result.current(42, [label(2), label(3)], 5);

    expect(reads).toBe(2);
    expect(posts).toEqual([{ id: 3 }]);
    expect(current).toEqual([label(2), label(3)]);
  });
});
