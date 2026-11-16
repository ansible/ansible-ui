import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
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

vi.mock('./useAuthenticatorColumns', () => ({
  useAuthenticatorsColumns: () => [{ id: 'name', header: 'Name', cell: () => null }],
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

import { useDeleteAuthenticators } from './useDeleteAuthenticators';

const mockAuthenticator = (overrides: Partial<Authenticator> = {}): Authenticator => ({
  id: 3,
  name: 'ldap',
  auto_migrate_users_to: null,
  url: '/auth/3/',
  created: '',
  modified: '',
  related: {},
  enabled: true,
  create_objects: false,
  remove_users: false,
  configuration: {},
  type: AuthenticatorTypeEnum.LDAP,
  order: 1,
  slug: 'ldap',
  summary_fields: {
    auto_migrate_users_to: { name: '', id: 0 },
    created_by: {} as Authenticator['summary_fields']['created_by'],
    modified_by: {} as Authenticator['summary_fields']['modified_by'],
  },
  ...overrides,
});

describe('useDeleteAuthenticators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('invokes bulk confirmation with sorted authenticators and delete URL', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteAuthenticators(onComplete));

    const authB = mockAuthenticator({ id: 2, name: 'b-auth' });
    const authA = mockAuthenticator({ id: 1, name: 'a-auth' });

    result.current([authB, authA]);

    expect(mockBulkConfirmation).toHaveBeenCalledTimes(1);
    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      items: Authenticator[];
      actionFn: (auth: Authenticator, signal: AbortSignal) => unknown;
      onComplete: (auths: Authenticator[]) => void;
    };

    expect(callArg.items.map((a) => a.name)).toEqual(['a-auth', 'b-auth']);

    const signal = new AbortController().signal;
    callArg.actionFn(authA, signal);
    expect(mockRequestDelete).toHaveBeenCalledWith(gatewayAPI`/authenticators/1/`, signal);

    callArg.onComplete([authA]);
    expect(onComplete).toHaveBeenCalledWith([authA]);
  });
});
