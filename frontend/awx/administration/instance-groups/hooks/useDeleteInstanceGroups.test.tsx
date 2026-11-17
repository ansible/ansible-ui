import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useDeleteInstanceGroups } from './useDeleteInstanceGroups';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('./useInstanceGroupColumns', () => ({
  useInstanceGroupsColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

const server = setupServer(
  http.get(awxAPI`/organizations/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/inventories/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/unified_job_templates/`, () => HttpResponse.json({ count: 0, results: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createMockInstanceGroup(overrides: Partial<InstanceGroup> = {}): InstanceGroup {
  return {
    id: 1,
    name: 'Default',
    is_container_group: false,
    summary_fields: {
      user_capabilities: { delete: true },
    },
    ...overrides,
  } as InstanceGroup;
}

describe('useDeleteInstanceGroups', () => {
  const mockBulkAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  it('opens delete confirmation for instance groups', async () => {
    const onComplete = vi.fn();
    const groups = [createMockInstanceGroup({ id: 2, name: 'B Group' }), createMockInstanceGroup()];
    const { result } = renderHook(() => useDeleteInstanceGroups(onComplete));

    void result.current(groups);
    await waitFor(() => expect(mockBulkAction).toHaveBeenCalled());

    expect(mockBulkAction).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Permanently delete instance groups',
        onComplete,
        isDanger: true,
      })
    );
    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { items: InstanceGroup[] };
    expect(callArgs.items[0]?.name).toBe('B Group');
  });

  it('uses container group copy when all selected groups are container groups', async () => {
    const onComplete = vi.fn();
    const groups = [createMockInstanceGroup({ is_container_group: true })];
    const { result } = renderHook(() => useDeleteInstanceGroups(onComplete));

    void result.current(groups);
    await waitFor(() => expect(mockBulkAction).toHaveBeenCalled());

    expect(mockBulkAction).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Permanently delete container groups',
        actionButtonText: 'Delete container group',
      })
    );
  });

  it('marks groups without delete permission as non-actionable', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteInstanceGroups(onComplete));

    void result.current([createMockInstanceGroup()]);
    await waitFor(() => expect(mockBulkAction).toHaveBeenCalled());

    const options = mockBulkAction.mock.calls[0]?.[0] as {
      isItemNonActionable: (item: InstanceGroup) => string | undefined;
    };
    expect(
      options.isItemNonActionable(
        createMockInstanceGroup({
          summary_fields: { user_capabilities: { delete: false } },
        } as InstanceGroup)
      )
    ).toContain('insufficient permission');
    expect(options.isItemNonActionable(createMockInstanceGroup())).toBeUndefined();
  });

  it('adds related-resource alert when a single deletable group is in use', async () => {
    server.use(
      http.get(awxAPI`/organizations/`, () => HttpResponse.json({ count: 1, results: [{}] })),
      http.get(awxAPI`/inventories/`, () => HttpResponse.json({ count: 0, results: [] })),
      http.get(awxAPI`/unified_job_templates/`, () =>
        HttpResponse.json({ count: 2, results: [{}, {}] })
      )
    );

    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteInstanceGroups(onComplete));

    void result.current([createMockInstanceGroup()]);
    await waitFor(() => expect(mockBulkAction).toHaveBeenCalled());

    const callArgs = mockBulkAction.mock.calls[0]?.[0] as { alertPrompts: string[] };
    expect(callArgs.alertPrompts[0]).toContain('currently being used');
    expect(callArgs.alertPrompts[0]).toContain('2 templates');
  });
});
