import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

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
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/Data')>(
    '@ansible/common-ui/crud/Data'
  );
  return {
    ...actual,
    requestDelete: (
      ...args: Parameters<typeof actual.requestDelete>
    ): ReturnType<typeof actual.requestDelete> =>
      mockRequestDelete(...args) as ReturnType<typeof actual.requestDelete>,
  };
});

import { useDeleteOAuthApplications } from './useDeleteOAuthApplications';

const mockApp = (overrides: Partial<Application> = {}): Application => ({
  id: 1,
  name: 'gamma',
  url: '/api/gateway/v1/applications/1/',
  app_url: 'https://example.com',
  client_type: 'confidential',
  organization: 1,
  type: 'o_auth2_application',
  created: '',
  modified: '',
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
    organization: { id: 1, name: 'O', description: '' },
  },
  ...overrides,
});

describe('useDeleteOAuthApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('invokes bulk confirmation with sorted apps and deletes via API', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOAuthApplications(onComplete));

    const appB = mockApp({ id: 2, name: 'b-app' });
    const appA = mockApp({ id: 1, name: 'a-app' });

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
    expect(mockRequestDelete).toHaveBeenCalledWith(gatewayAPI`/applications/1/`, signal);

    const apps: Application[] = [appA];
    callArg.onComplete(apps);
    expect(onComplete).toHaveBeenCalledWith(apps);
  });
});
