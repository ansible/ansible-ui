/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PlatformIdForUsername } from './platformIdForUsername';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PlatformIdForUsername', () => {
  it('should return the user id when API returns results', async () => {
    server.use(
      http.get('*/users/', () => {
        return HttpResponse.json({
          count: 1,
          results: [{ id: 42, username: 'admin', first_name: 'Admin', last_name: 'User' }],
        });
      })
    );

    const { result } = renderHook(() => PlatformIdForUsername('admin'));

    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it('should return undefined when API returns no results', async () => {
    server.use(
      http.get('*/users/', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { result } = renderHook(() => PlatformIdForUsername('nonexistent'));

    await waitFor(() => {
      expect(result.current).toBeUndefined();
    });
  });
});
