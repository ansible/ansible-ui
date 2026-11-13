import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthenticatorMap, AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import { useMappingColumns } from './useMappingColumns';

const mockGetPageUrl = vi.fn((route: string) => `/mock/${route}`);
const mockPageNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
    usePageNavigate: () => mockPageNavigate,
  };
});

const baseMap = (overrides: Partial<AuthenticatorMap> = {}): AuthenticatorMap =>
  ({
    id: 9,
    name: 'rule-one',
    authenticator: 4,
    order: 2,
    map_type: AuthenticatorMapType.team,
    organization: 'Default',
    team: 'team-a',
    role: 'Member',
    revoke: false,
    ui_summary: 'team map',
    triggers: { always: {} },
    url: '/api/gateway/v1/authenticator_maps/9/',
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-02T00:00:00Z',
    created_by: 1,
    modified_by: 2,
    related: {},
    summary_fields: {
      created_by: { id: 1, username: 'creator' },
      modified_by: { id: 2, username: 'editor' },
    } as AuthenticatorMap['summary_fields'],
    ...overrides,
  }) as AuthenticatorMap;

describe('useMappingColumns', () => {
  it('should format column values for always trigger and ui_summary type', () => {
    const { result } = renderHook(() => useMappingColumns());
    const triggerColumn = result.current.find((c) => c.header === 'When to run the rule');
    const typeColumn = result.current.find((c) => c.header === 'Type');
    const orderColumn = result.current.find((c) => c.header === 'Order');

    const map = baseMap();
    expect(orderColumn?.value?.(map)).toBe('2');
    expect(typeColumn?.value?.(map)).toBe('team map');
    expect(triggerColumn?.value?.(map)).toBe('Always');
  });

  it('should resolve trigger labels for never, groups, and attributes', () => {
    const { result } = renderHook(() => useMappingColumns());
    const triggerColumn = result.current.find((c) => c.header === 'When to run the rule');

    expect(triggerColumn?.value?.(baseMap({ triggers: { never: {} } }))).toBe('Never');
    expect(triggerColumn?.value?.(baseMap({ triggers: { groups: { has_or: ['g1'] } } }))).toBe(
      'Based on groups'
    );
    expect(
      triggerColumn?.value?.(
        baseMap({
          triggers: {
            attributes: { join_condition: 'or', dept: { contains: 'x' } },
          } as unknown as AuthenticatorMap['triggers'],
        })
      )
    ).toBe('Based on attributes');
  });

  it('should show Revoke in enabled options when revoke is true', () => {
    const { result } = renderHook(() => useMappingColumns());
    const enabledColumn = result.current.find((c) => c.header === 'Enabled options');
    expect(enabledColumn?.value?.(baseMap({ revoke: true }))).toBe('Revoke');
    expect(enabledColumn?.value?.(baseMap({ revoke: false }))).toBe('');
  });

  it('should use map_type fallback when ui_summary is missing', () => {
    const { result } = renderHook(() => useMappingColumns());
    const typeColumn = result.current.find((c) => c.header === 'Type');
    expect(
      typeColumn?.value?.(baseMap({ ui_summary: undefined, map_type: AuthenticatorMapType.role }))
    ).toBe('role map');
  });

  it('should rebuild columns when disableLinks changes', () => {
    const { result: linked, rerender: rerenderLinked } = renderHook(
      ({ disableLinks }: { disableLinks?: boolean }) => useMappingColumns({ disableLinks }),
      { initialProps: { disableLinks: false } }
    );
    const first = linked.current;
    rerenderLinked({ disableLinks: true });
    expect(linked.current).not.toBe(first);
  });
});
