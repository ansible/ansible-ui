import { renderHook } from '@testing-library/react';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { mockBulkConfirmation, mockRequestDelete } = vi.hoisted(() => ({
  mockBulkConfirmation: vi.fn(),
  mockRequestDelete: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (!options) return key;
      return key.replace(/\{\{(\w+)\}\}/g, (_m, name: string) =>
        String(options[name] ?? `{{${name}}}`)
      );
    },
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mockBulkConfirmation,
  };
});

vi.mock('./useOAuthApplicationColumns', () => ({
  useOAuthApplicationColumns: () => [{ id: 'name', header: 'Name', cell: () => null }],
}));

vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: () => ({ id: 'action-name', header: 'Name', cell: () => null }),
}));

vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual('@ansible/common-ui/crud/Data');
  return {
    ...actual,
    requestDelete: (...args: unknown[]): Promise<void> =>
      mockRequestDelete(...args) as Promise<void>,
  };
});

import { useDeleteOAuthApplications } from './useDeleteOAuthApplications';

const mockApplication = (overrides: Partial<Application> = {}): Application => ({
  id: 5,
  name: 'beta-app',
  url: '/applications/5/',
  client_type: 'confidential',
  organization: 1,
  type: 'o_auth2_application',
  created: '',
  modified: '',
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
    organization: { id: 1, name: 'Org', description: '' },
  },
  ...overrides,
});

describe('useDeleteOAuthApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should invoke bulk confirmation with sorted applications and delete by id', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOAuthApplications(onComplete));

    const appB = mockApplication({ id: 2, name: 'b-app' });
    const appA = mockApplication({ id: 1, name: 'a-app' });

    result.current([appB, appA]);

    expect(mockBulkConfirmation).toHaveBeenCalledTimes(1);
    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      items: Application[];
      actionFn: (app: Application, signal: AbortSignal) => unknown;
      onComplete: (apps: Application[]) => void;
    };

    expect(callArg.items.map((a) => a.name)).toEqual(['a-app', 'b-app']);

    const signal = new AbortController().signal;
    callArg.actionFn(appA, signal);
    expect(mockRequestDelete).toHaveBeenCalledWith('/api/gateway/v1/applications/1/', signal);

    const apps = [appA];
    callArg.onComplete(apps);
    expect(onComplete).toHaveBeenCalledWith(apps);
  });
});
