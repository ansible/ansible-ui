/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { useSyncRepositories } from './useSyncRepositories';
import { Repository } from '../Repository';

const mockAddAlert = vi.fn();
const mockSetDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: () => [undefined, mockSetDialog],
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
    useGetPageUrl: () => (route: string, opts?: { params?: Record<string, string> }) =>
      `/${route}/${opts?.params?.id ?? ''}`,
  };
});

const REPO_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const TASK_UUID = '11111111-2222-3333-4444-555555555555';
const SYNC_URL = `*/repositories/ansible/ansible/${REPO_UUID}/sync/`;

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

const mockRepository: Repository = {
  name: 'community',
  pulp_href: `/pulp/api/v3/repositories/ansible/ansible/${REPO_UUID}/`,
  description: 'Community repository',
  gpgkey: null,
  last_sync_task: {
    finished_at: '',
    started_at: '',
    state: 'completed',
    task_id: '1',
  },
  last_synced_metadata_time: null,
  latest_version_href: `/pulp/api/v3/repositories/ansible/ansible/${REPO_UUID}/versions/1/`,
  private: false,
  pulp_created: '2024-01-01T00:00:00Z',
  pulp_labels: {},
  remote: '/pulp/api/v3/remotes/ansible/collection/def-456/',
  retain_repo_versions: null,
  versions_href: `/pulp/api/v3/repositories/ansible/ansible/${REPO_UUID}/versions/`,
};

function renderAndSubmit() {
  const { result } = renderHook(() => useSyncRepositories(), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });

  act(() => result.current(mockRepository));

  const formProps = findFormProps(mockSetDialog.mock.calls[0]?.[0] as React.ReactElement);
  return formProps;
}

describe('useSyncRepositories', () => {
  it('should show success alert with task link on 202 response', async () => {
    server.use(
      http.post(SYNC_URL, () =>
        HttpResponse.json({ task: `/pulp/api/v3/tasks/${TASK_UUID}/` }, { status: 202 })
      )
    );

    const formProps = renderAndSubmit();
    await act(async () => formProps.onSubmit({ mirror: true, optimize: true }));

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'info',
        title: 'Sync started for repository "community".',
      })
    );
    const alert = mockAddAlert.mock.calls[0]?.[0] as { children: React.ReactElement };
    expect(alert.children).toBeDefined();
  });

  it('should show success alert without task link when task URL is missing', async () => {
    server.use(http.post(SYNC_URL, () => HttpResponse.json({ task: '' }, { status: 202 })));

    const formProps = renderAndSubmit();
    await act(async () => formProps.onSubmit({ mirror: true, optimize: true }));

    expect(mockAddAlert).toHaveBeenCalledWith(expect.objectContaining({ variant: 'info' }));
  });

  it('should show danger alert on sync failure', async () => {
    server.use(
      http.post(SYNC_URL, () =>
        HttpResponse.json({ detail: 'Remote has not been configured' }, { status: 400 })
      )
    );

    const formProps = renderAndSubmit();
    await act(async () => formProps.onSubmit({ mirror: true, optimize: true }));

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to sync repository "community"',
      })
    );
  });
});

type FormProps = {
  onSubmit: (v: { mirror: boolean; optimize: boolean }) => Promise<void>;
  onCancel: () => void;
};

function findFormProps(element: React.ReactElement): FormProps {
  const result = searchTree(element);
  if (!result) throw new Error('Could not find form element with onSubmit');
  return result;
}

function searchTree(node: unknown): FormProps | null {
  if (!node || typeof node !== 'object') return null;

  const props = (node as React.ReactElement).props as Record<string, unknown> | undefined;
  if (!props) return null;

  if (typeof props.onSubmit === 'function') return props as unknown as FormProps;

  const children = props.children;
  const childArray = Array.isArray(children) ? children : [children];
  for (const child of childArray) {
    const found = searchTree(child);
    if (found) return found;
  }
  return null;
}
