/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useJobTemplateIds } from './useJobTemplateIds';

// ─── Test Data ────────────────────────────────────────────────────────────────

const mockTemplates = [
  { id: 1, name: 'Template 1' },
  { id: 2, name: 'Template 2' },
  { id: 3, name: 'Template 3' },
];

// ─── MSW Server ───────────────────────────────────────────────────────────────

const server = setupServer(
  http.get(metricsAPI`/dashboard_reports/templates/`, () =>
    HttpResponse.json({ count: 3, next: null, results: mockTemplates })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useJobTemplateIds', () => {
  test('should return undefined templateIds and isLoading true initially', () => {
    const { result } = renderHook(() => useJobTemplateIds());
    expect(result.current.templateIds).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  test('should fetch and return template IDs as URLSearchParams format', async () => {
    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.templateIds).toBeDefined();
    });

    expect(result.current.templateIds).toEqual([
      ['template', '1'],
      ['template', '2'],
      ['template', '3'],
    ]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  test('should return empty array when API returns no results', async () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () =>
        HttpResponse.json({ count: 0, next: null, results: [] })
      )
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.templateIds).toEqual([]);
  });

  test('should expose error when API fails', async () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.templateIds).toBeUndefined();
  });

  test('should convert template IDs to strings', async () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () =>
        HttpResponse.json({
          count: 2,
          next: null,
          results: [
            { id: 123, name: 'Large ID Template' },
            { id: 456, name: 'Another Large ID' },
          ],
        })
      )
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.templateIds).toBeDefined();
    });

    expect(result.current.templateIds).toEqual([
      ['template', '123'],
      ['template', '456'],
    ]);

    expect(typeof result.current.templateIds![0][1]).toBe('string');
  });

  test('should paginate through multiple pages of templates', async () => {
    const page1Results = Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      name: `Template ${i + 1}`,
    }));
    const page2Results = Array.from({ length: 50 }, (_, i) => ({
      id: i + 201,
      name: `Template ${i + 201}`,
    }));

    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        if (page === '2') {
          return HttpResponse.json({ count: 250, next: null, results: page2Results });
        }
        return HttpResponse.json({
          count: 250,
          next: 'http://localhost/dashboard_reports/templates/?page=2',
          results: page1Results,
        });
      })
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.templateIds?.length).toBe(250);
    });

    expect(result.current.templateIds![0]).toEqual(['template', '1']);
    expect(result.current.templateIds![249]).toEqual(['template', '250']);
  });

  test('should stop paginating when next is null', async () => {
    let requestCount = 0;
    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () => {
        requestCount++;
        return HttpResponse.json({ count: 3, next: null, results: mockTemplates });
      })
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.templateIds).toBeDefined();
    });

    expect(requestCount).toBe(1);
  });
});
