import type { ITableColumn } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useDeleteOrganizations } from './useDeleteOrganizations';

interface DeleteOrganizationsBulkOptions {
  title: string;
  confirmText: string;
  actionButtonText: string;
  items: PlatformOrganization[];
  alertPrompts: string[];
  isItemNonActionable: (organization: PlatformOrganization) => string | undefined;
  keyFn: (item: PlatformOrganization) => string | number;
  isDanger: boolean;
  confirmationColumns: ITableColumn<PlatformOrganization>[];
  actionColumns: ITableColumn<PlatformOrganization>[];
  onComplete: (organizations: PlatformOrganization[]) => void;
  actionFn: (organization: PlatformOrganization, signal: AbortSignal) => Promise<unknown>;
}

const { mockBulkConfirmation, mockRequestDelete } = vi.hoisted(() => ({
  mockBulkConfirmation: vi.fn<(opts: DeleteOrganizationsBulkOptions) => void>(),
  mockRequestDelete: vi.fn(
    (_url: string, _signal: AbortSignal): Promise<undefined> => Promise.resolve(undefined)
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mockBulkConfirmation,
  };
});

vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/Data')>(
    '@ansible/common-ui/crud/Data'
  );
  return {
    ...actual,
    requestDelete: mockRequestDelete,
  };
});

vi.mock('./useOrganizationColumns', () => ({
  useOrganizationColumns: (): ITableColumn<PlatformOrganization>[] => [
    { header: 'Col', cell: () => null },
  ],
}));

vi.mock('@ansible/common-ui/columns', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/columns')>(
    '@ansible/common-ui/columns'
  );
  return {
    ...actual,
    useNameColumn: (): ITableColumn<PlatformOrganization> => ({ header: 'Name', cell: () => null }),
  };
});

function buildOrg(id: number, name: string, managed = false): PlatformOrganization {
  return {
    id,
    name,
    description: '',
    url: `/api/gateway/v1/organizations/${id}/`,
    created: '',
    created_by: 1,
    modified: '',
    modified_by: 1,
    managed,
    related: { created_by: '', modified_by: '', teams: '' },
    summary_fields: {
      created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
      modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    },
  };
}

function getLastBulkCall(): DeleteOrganizationsBulkOptions {
  expect(mockBulkConfirmation).toHaveBeenCalled();
  const last = mockBulkConfirmation.mock.calls[mockBulkConfirmation.mock.calls.length - 1];
  expect(last[0]).toBeDefined();
  return last[0];
}

describe('useDeleteOrganizations', () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('invokes bulk confirmation with sorted items and delete wiring', () => {
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const apple = buildOrg(1, 'Apple Org');
    const zebra = buildOrg(2, 'Zebra Org');
    const orgs = [zebra, apple];
    result.current(orgs);

    expect(mockBulkConfirmation).toHaveBeenCalledTimes(1);
    const opts = getLastBulkCall();

    expect(opts.items.map((o) => o.name)).toEqual(['Apple Org', 'Zebra Org']);
    expect(opts.isDanger).toBe(true);
    expect(opts.onComplete).toBe(onComplete);
    expect(opts.keyFn).toBeDefined();
    expect(opts.confirmationColumns[0]).toMatchObject({ header: 'Col' });
    expect(opts.actionColumns[0]).toMatchObject({ header: 'Name' });

    expect(opts.title).toBe('Permanently delete organizations:2');
    expect(opts.actionButtonText).toBe('Delete organizations:2');
    expect(opts.confirmText).toBe(
      'Yes, I confirm that I want to delete these {{count}} organizations.:2'
    );

    expect(opts.alertPrompts).toHaveLength(1);
    expect(opts.alertPrompts[0]).toBe(
      'Deleting these organizations could impact other resources that rely on them.:2'
    );

    const signal = new AbortController().signal;
    void opts.actionFn(apple, signal);
    expect(mockRequestDelete).toHaveBeenCalledWith(
      gatewayAPI`/organizations/${apple.id.toString()}/`,
      signal
    );
  });

  test('isItemNonActionable marks managed organizations as non-actionable', () => {
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const org = buildOrg(5, 'Only Org', true);
    result.current([org]);

    const opts = getLastBulkCall();
    expect(typeof opts.isItemNonActionable).toBe('function');
    expect(opts.isItemNonActionable(org)).toBe(
      'The organization cannot be deleted due to insufficient permissions.'
    );
  });

  test('adds second alert and counts only deletable orgs in confirm text', () => {
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const deletable = buildOrg(1, 'Deletable', false);
    const locked = buildOrg(2, 'Managed Org', true);
    result.current([deletable, locked]);

    const opts = getLastBulkCall();

    expect(opts.alertPrompts).toHaveLength(2);
    expect(opts.alertPrompts[1]).toBe(
      '{{count}} of the selected organizations cannot be deleted due to insufficient permissions.:1'
    );
    expect(opts.confirmText).toBe(
      'Yes, I confirm that I want to delete these {{count}} organizations.:1'
    );
  });
});
