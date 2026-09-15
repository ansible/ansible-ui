/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useJobTemplateIds } from './useJobTemplateIds';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';

// ─── Test Data ────────────────────────────────────────────────────────────────

interface TemplateRecord {
  id: number;
  name: string;
}

const mockTemplates: TemplateRecord[] = [
  { id: 1, name: 'Template 1' },
  { id: 2, name: 'Template 2' },
  { id: 3, name: 'Template 3' },
];

const mockResponse: AwxItemsResponse<TemplateRecord> = {
  count: 3,
  results: mockTemplates,
};

// ─── MSW Server ───────────────────────────────────────────────────────────────

const server = setupServer(
  http.get(metricsAPI`/dashboard_reports/templates/`, () => HttpResponse.json(mockResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useJobTemplateIds', () => {
  test('should return empty array initially', () => {
    const { result } = renderHook(() => useJobTemplateIds());
    expect(result.current).toEqual([]);
  });

  test('should fetch and return template IDs as URLSearchParams format', async () => {
    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    expect(result.current).toEqual([
      ['template', '1'],
      ['template', '2'],
      ['template', '3'],
    ]);
  });

  test('should return empty array when API returns no results', async () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  test('should return empty array when API returns undefined results', async () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () =>
        HttpResponse.json({ count: 0, results: undefined })
      )
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  test('should handle API errors gracefully', () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const { result } = renderHook(() => useJobTemplateIds());

    // Should return empty array on error
    expect(result.current).toEqual([]);
  });

  test('should convert template IDs to strings', async () => {
    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () =>
        HttpResponse.json({
          count: 2,
          results: [
            { id: 123, name: 'Large ID Template' },
            { id: 456, name: 'Another Large ID' },
          ],
        })
      )
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.length).toBe(2);
    });

    expect(result.current).toEqual([
      ['template', '123'],
      ['template', '456'],
    ]);

    // Verify they are strings, not numbers
    expect(typeof result.current[0][1]).toBe('string');
  });

  test('should handle large number of templates', async () => {
    const largeTemplateList = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `Template ${i + 1}`,
    }));

    server.use(
      http.get(metricsAPI`/dashboard_reports/templates/`, () =>
        HttpResponse.json({
          count: 1000,
          results: largeTemplateList,
        })
      )
    );

    const { result } = renderHook(() => useJobTemplateIds());

    await waitFor(() => {
      expect(result.current.length).toBe(1000);
    });

    expect(result.current[0]).toEqual(['template', '1']);
    expect(result.current[999]).toEqual(['template', '1000']);
  });
});
