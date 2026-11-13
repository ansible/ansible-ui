import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthenticatorMap, AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';

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

vi.mock('./useMappingColumns', () => ({
  useMappingColumns: () => [{ id: 'name', header: 'Rule name', cell: () => null }],
}));

vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual('@ansible/common-ui/crud/Data');
  return {
    ...actual,
    requestDelete: (...args: unknown[]): Promise<void> =>
      mockRequestDelete(...args) as Promise<void>,
  };
});

import { useDeleteMappings } from './useDeleteMappings';

const mockMapping = (overrides: Partial<AuthenticatorMap> = {}): AuthenticatorMap =>
  ({
    id: 1,
    name: 'alpha',
    authenticator: 1,
    order: 1,
    map_type: AuthenticatorMapType.allow,
    triggers: { always: {} },
    revoke: false,
    organization: '',
    role: '',
    url: '/api/gateway/v1/authenticator_maps/1/',
    created: '',
    modified: '',
    related: {},
    summary_fields: {} as AuthenticatorMap['summary_fields'],
    ...overrides,
  }) as AuthenticatorMap;

describe('useDeleteMappings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should invoke bulk confirmation with sorted mappings and delete URL', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteMappings(onComplete));

    const mapB = mockMapping({ id: 2, name: 'b-map' });
    const mapA = mockMapping({ id: 1, name: 'a-map' });

    result.current([mapB, mapA]);

    expect(mockBulkConfirmation).toHaveBeenCalledTimes(1);
    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      items: AuthenticatorMap[];
      actionFn: (map: AuthenticatorMap, signal: AbortSignal) => unknown;
      onComplete: (maps: AuthenticatorMap[]) => void;
    };

    expect(callArg.items.map((m) => m.name)).toEqual(['a-map', 'b-map']);

    const signal = new AbortController().signal;
    callArg.actionFn(mapA, signal);
    expect(mockRequestDelete).toHaveBeenCalledWith('/api/gateway/v1/authenticator_maps/1/', signal);

    const maps: AuthenticatorMap[] = [mapA];
    callArg.onComplete(maps);
    expect(onComplete).toHaveBeenCalledWith(maps);
  });
});
