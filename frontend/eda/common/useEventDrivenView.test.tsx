/* eslint-disable i18next/no-literal-string */
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from './eda-utils';
import { useEdaView } from './useEventDrivenView';

const server = setupServer();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    <MemoryRouter>{children}</MemoryRouter>
  </SWRConfig>
);

describe('useEdaView', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should load page items, update an item, and refresh selection', async () => {
    server.use(
      http.get(edaAPI`/event-streams/`, () =>
        HttpResponse.json({
          count: 2,
          results: [
            { id: 1, name: 'one' },
            { id: 2, name: 'two' },
          ],
        })
      )
    );

    const { result } = renderHook(
      () =>
        useEdaView<{ id: number; name: string }>({
          url: edaAPI`/event-streams/`,
          tableColumns: [
            { header: 'Name', sort: 'name', defaultSort: true, cell: (item) => item.name },
          ],
          defaultSelection: [{ id: 1, name: 'one' }],
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems?.map((item) => item.name)).toEqual(['one', 'two']);
    });
    expect(result.current.itemCount).toBe(2);

    act(() => {
      result.current.updateItem({ id: 1, name: 'updated' });
    });
    expect(result.current.pageItems?.[0].name).toBe('updated');

    act(() => {
      result.current.selectItemsAndRefresh([{ id: 2, name: 'two' }]);
      result.current.unselectItemsAndRefresh([{ id: 1, name: 'one' }]);
    });
  });

  it('should ignore updateItem when the item is missing from the page', async () => {
    server.use(
      http.get(edaAPI`/event-streams/`, () =>
        HttpResponse.json({ count: 1, results: [{ id: 1, name: 'one' }] })
      )
    );

    const { result } = renderHook(
      () => useEdaView<{ id: number; name: string }>({ url: edaAPI`/event-streams/` }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems).toHaveLength(1);
    });
    act(() => {
      result.current.updateItem(undefined as unknown as { id: number; name: string });
      result.current.updateItem({ id: 99, name: 'missing' });
    });
    expect(result.current.pageItems?.[0].name).toBe('one');
  });

  it('should clear a 404 error by resetting to page 1', async () => {
    let page = 1;
    server.use(
      http.get(edaAPI`/event-streams/`, ({ request }) => {
        const url = new URL(request.url);
        page = Number(url.searchParams.get('page') ?? '1');
        if (page > 1) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { result } = renderHook(
      () => useEdaView<{ id: number; name: string }>({ url: edaAPI`/event-streams/` }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems).toEqual([]);
    });

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
  });
});
