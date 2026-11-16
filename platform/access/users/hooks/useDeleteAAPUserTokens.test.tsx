import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Token } from '@ansible/awx-ui/interfaces/Token';
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

vi.mock('@ansible/awx-ui/access/users/hooks/useUserTokensColumns', () => ({
  useUserTokensColumns: () => [{ id: 'user', header: 'User', cell: () => null }],
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

import { useDeleteUserTokens } from './useDeleteAAPUserTokens';

const mockToken = (overrides: Partial<Token> = {}): Token =>
  ({
    id: 1,
    type: 'o',
    summary_fields: {
      user: { username: 'alice', id: 1, first_name: 'Alice', last_name: 'User' },
    },
    ...overrides,
  }) as Token;

describe('useDeleteUserTokens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sorts tokens by username and deletes via gateway API', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteUserTokens(onComplete));

    const tokenB = mockToken({
      id: 2,
      summary_fields: {
        user: { username: 'bob', id: 2, first_name: 'Bob', last_name: 'User' },
        application: { id: 1, name: 'app' },
      },
    });
    const tokenA = mockToken({
      id: 1,
      summary_fields: {
        user: { username: 'alice', id: 1, first_name: 'Alice', last_name: 'User' },
        application: { id: 1, name: 'app' },
      },
    });

    result.current([tokenB, tokenA]);

    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      items: Token[];
      actionFn: (token: Token, signal: AbortSignal) => unknown;
      onComplete: (items: Token[]) => void;
      title: string;
    };

    expect(callArg.title).toBe('Permanently delete tokens');
    expect(callArg.items.map((token) => token.summary_fields.user?.username)).toEqual([
      'alice',
      'bob',
    ]);

    const signal = new AbortController().signal;
    callArg.actionFn(tokenA, signal);
    expect(mockRequestDelete).toHaveBeenCalledWith(gatewayAPI`/tokens/1/`, signal);

    const completed: Token[] = [tokenA];
    callArg.onComplete(completed);
    expect(onComplete).toHaveBeenCalledWith(completed);
  });

  test('uses singular copy for a single token', () => {
    const { result } = renderHook(() => useDeleteUserTokens(vi.fn()));

    result.current([mockToken()]);

    const callArg = mockBulkConfirmation.mock.calls[0][0] as { title: string; confirmText: string };
    expect(callArg.title).toBe('Permanently delete token');
    expect(callArg.confirmText).toBe('Yes, I confirm that I want to delete this token.');
  });
});
