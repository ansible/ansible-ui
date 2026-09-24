/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useDownloadHostMetrics } from './useDownloadHostMetrics';

const { mockAddAlert, mockDownloadBlobFile } = vi.hoisted(() => ({
  mockAddAlert: vi.fn(),
  mockDownloadBlobFile: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return { ...actual, usePageAlertToaster: vi.fn(() => ({ addAlert: mockAddAlert })) };
});

vi.mock('@ansible/ansible-ui-framework/utils/download-file', () => ({
  downloadBlobFile: mockDownloadBlobFile,
}));

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe('useDownloadHostMetrics', () => {
  it('should page through filtered results and download a CSV blob', async () => {
    const urls: string[] = [];
    server.use(
      http.get(awxAPI`/host_metrics/`, ({ request }) => {
        urls.push(request.url);
        const page = new URL(request.url).searchParams.get('page');
        if (page === '1') {
          return HttpResponse.json({
            count: 2,
            next: '/api/v2/host_metrics/?page=2',
            previous: null,
            results: [
              {
                id: 1,
                hostname: 'host-a',
                url: '/api/v2/host_metrics/1/',
                first_automation: '2024-01-01T00:00:00Z',
                last_automation: '2024-02-01T00:00:00Z',
                last_deleted: null,
                automated_counter: 5,
                deleted_counter: 0,
                deleted: false,
                used_in_inventories: 1,
              },
            ],
          });
        }
        return HttpResponse.json({
          count: 2,
          next: null,
          previous: '/api/v2/host_metrics/?page=1',
          results: [
            {
              id: 2,
              hostname: 'host-b',
              url: '/api/v2/host_metrics/2/',
              first_automation: '2024-03-01T00:00:00Z',
              last_automation: '2024-04-01T00:00:00Z',
              last_deleted: null,
              automated_counter: 9,
              deleted_counter: 0,
              deleted: false,
              used_in_inventories: 1,
            },
          ],
        });
      })
    );

    const listUrl = `${awxAPI`/host_metrics/`}?not__deleted=true&hostname__icontains=host&page=1&page_size=10`;
    const { result } = renderHook(() => useDownloadHostMetrics(listUrl));

    await act(async () => {
      await result.current();
    });

    expect(urls).toHaveLength(2);
    expect(urls[0]).toContain('hostname__icontains=host');
    expect(urls[0]).toContain('not__deleted=true');
    expect(urls[0]).toContain('page_size=200');
    expect(urls[0]).toContain('page=1');
    expect(urls[1]).toContain('page=2');

    expect(mockDownloadBlobFile).toHaveBeenCalledOnce();
    const [filename, extension, blob] = mockDownloadBlobFile.mock.calls[0] as [
      string,
      string,
      Blob,
    ];
    expect(filename).toMatch(/^host-metrics-\d{4}-\d{2}-\d{2}$/);
    expect(extension).toBe('csv');
    const text = await blob.text();
    expect(text).toContain('Hostname,First Automated Date,Last Automated Date,Automated Count');
    expect(text).toContain('host-a');
    expect(text).toContain('host-b');
    expect(mockAddAlert).not.toHaveBeenCalled();
  });

  it('should show an error toast when the API request fails', async () => {
    server.use(
      http.get(awxAPI`/host_metrics/`, () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() =>
      useDownloadHostMetrics(`${awxAPI`/host_metrics/`}?not__deleted=true`)
    );

    await act(async () => {
      await result.current();
    });

    expect(mockDownloadBlobFile).not.toHaveBeenCalled();
    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to download host metrics.',
      })
    );
  });
});
