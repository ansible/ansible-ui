import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useDownloadJobOutput } from './useDownloadJobOutput';

vi.mock('@ansible/ansible-ui-framework/utils/download-file', () => ({
  downloadTextFile: vi.fn(),
}));

import { downloadTextFile } from '@ansible/ansible-ui-framework/utils/download-file';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe('useDownloadJobOutput', () => {
  const mockJob = {
    name: 'Test Job',
    related: { stdout: '/api/v2/jobs/26/stdout/' },
  } as unknown as UnifiedJob;

  it('should download job output on success', async () => {
    server.use(
      http.get('*/jobs/26/stdout/', () => new HttpResponse('line1\nline2\nline3', { status: 200 }))
    );

    const { result } = renderHook(() => useDownloadJobOutput());
    await result.current(mockJob);

    expect(downloadTextFile).toHaveBeenCalledWith('Test Job', 'line1\nline2\nline3');
  });

  it('should throw a RequestError when the API returns an error', async () => {
    server.use(
      http.get('*/jobs/26/stdout/', () =>
        HttpResponse.json({ detail: 'Not Found' }, { status: 404 })
      )
    );

    const { result } = renderHook(() => useDownloadJobOutput());

    await expect(result.current(mockJob)).rejects.toThrow();
    expect(downloadTextFile).not.toHaveBeenCalled();
  });

  it('should use format=txt_download query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/jobs/26/stdout/', ({ request }) => {
        capturedUrl = request.url;
        return new HttpResponse('output content', { status: 200 });
      })
    );

    const { result } = renderHook(() => useDownloadJobOutput());
    await result.current(mockJob);

    expect(capturedUrl).toContain('format=txt_download');
  });
});
