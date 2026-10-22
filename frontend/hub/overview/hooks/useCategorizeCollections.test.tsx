/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CollectionCategory } from '../CollectionCategory';
import { useCategorizeCollections } from './useCategorizeCollections';

const categories: CollectionCategory[] = [
  { id: 'application', name: 'Application', searchKey: 'tags', searchValue: 'application' },
];

const server = setupServer(
  http.get('*/v3/plugin/ansible/search/collection-versions/*', () =>
    HttpResponse.json({ meta: { count: 0 }, data: [] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useCategorizeCollections', () => {
  it('fetches collections for managed categories', async () => {
    const setCategorizedCollections = vi.fn();

    renderHook(() => useCategorizeCollections(categories, setCategorizedCollections));

    await waitFor(() => {
      expect(setCategorizedCollections).toHaveBeenCalled();
    });

    expect(setCategorizedCollections).toHaveBeenCalledWith(
      expect.objectContaining({ application: [] })
    );
  });
});
