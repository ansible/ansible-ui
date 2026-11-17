import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useRelaunchJob } from './useRelaunchJob';

const { mockNavigate, mockPageNavigate, mockAddAlert } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockPageNavigate: vi.fn(),
  mockAddAlert: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
  };
});

vi.mock('@ansible/ansible-ui-framework/PageNavigation/useGetPageUrl', () => ({
  useGetPageUrl: () => (route: string, options?: { params?: Record<string, unknown> }) => {
    const params = options?.params ?? {};
    const paramStr = Object.entries(params)
      .map(([k, v]) => `${k}=${String(v)}`)
      .join('&');
    return `/${route}?${paramStr}`;
  },
}));

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

function jobFixture(type: UnifiedJob['type'], id: number): UnifiedJob {
  return { id, type, name: `job-${id}`, related: {} } as UnifiedJob;
}

describe('useRelaunchJob', () => {
  it('should relaunch a playbook job and navigate to job output', async () => {
    server.use(
      http.get(awxAPI`/jobs/26/relaunch/`, () =>
        HttpResponse.json({ passwords_needed_to_start: [] })
      ),
      http.post(awxAPI`/jobs/26/relaunch/`, () =>
        HttpResponse.json({ id: 99, type: 'job', name: 'Relaunched job' }, { status: 201 })
      )
    );

    const { result } = renderHook(() => useRelaunchJob({ hosts: 'failed' }));
    await act(async () => {
      await result.current(jobFixture('job', 26));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('job_type=playbook'));
    });
    expect(mockPageNavigate).not.toHaveBeenCalled();
    expect(mockAddAlert).not.toHaveBeenCalled();
  });

  it('should navigate to the passwords wizard when passwords are required', async () => {
    server.use(
      http.get(awxAPI`/jobs/26/relaunch/`, () =>
        HttpResponse.json({ passwords_needed_to_start: ['ssh_password'] })
      )
    );

    const { result } = renderHook(() => useRelaunchJob());
    await act(async () => {
      await result.current(jobFixture('job', 26));
    });

    expect(mockPageNavigate).toHaveBeenCalledWith(AwxRoute.TemplateLaunchWithPasswordsWizard, {
      params: { id: 26, job_type: 'playbook' },
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show a danger alert when the relaunch request fails', async () => {
    server.use(
      http.get(awxAPI`/jobs/26/relaunch/`, () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useRelaunchJob());
    await act(async () => {
      await result.current(jobFixture('job', 26));
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to relaunch job',
      })
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
