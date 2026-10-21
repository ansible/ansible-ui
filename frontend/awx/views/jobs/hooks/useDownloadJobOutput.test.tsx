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
    id: 26,
    type: 'job',
    name: 'Test Job',
    related: { stdout: '/api/v2/jobs/26/stdout/' },
  } as unknown as UnifiedJob;

  it('should download job output on success', async () => {
    server.use(
      http.get('*/jobs/26/stdout/', () => new HttpResponse('line1\nline2\nline3', { status: 200 }))
    );

    const { result } = renderHook(() => useDownloadJobOutput());
    await result.current(mockJob);

    expect(downloadTextFile).toHaveBeenCalledWith('job_Test Job_26', 'line1\nline2\nline3');
  });

  it('should give two logs from the same template distinct filenames', async () => {
    server.use(
      http.get('*/jobs/26/stdout/', () => new HttpResponse('first run', { status: 200 })),
      http.get('*/jobs/27/stdout/', () => new HttpResponse('second run', { status: 200 }))
    );

    const { result } = renderHook(() => useDownloadJobOutput());
    await result.current(mockJob);
    await result.current({
      ...mockJob,
      id: 27,
      related: { stdout: '/api/v2/jobs/27/stdout/' },
    } as unknown as UnifiedJob);

    expect(downloadTextFile).toHaveBeenNthCalledWith(1, 'job_Test Job_26', 'first run');
    expect(downloadTextFile).toHaveBeenNthCalledWith(2, 'job_Test Job_27', 'second run');
  });

  it('should use the unified job type in the filename', async () => {
    server.use(
      http.get(
        '*/project_updates/31/stdout/',
        () => new HttpResponse('scm output', { status: 200 })
      )
    );

    const { result } = renderHook(() => useDownloadJobOutput());
    await result.current({
      id: 31,
      type: 'project_update',
      name: 'Demo Project',
      related: { stdout: '/api/v2/project_updates/31/stdout/' },
    } as unknown as UnifiedJob);

    expect(downloadTextFile).toHaveBeenCalledWith('project_update_Demo Project_31', 'scm output');
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
