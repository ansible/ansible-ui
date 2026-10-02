import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PageActionType,
  PageActionSelection,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useSourcesActions } from './useSourcesActions';
import { useDeleteSources } from './useDeleteSources';
import { InventorySource } from '../../../interfaces/InventorySource';
import { IAwxView } from '../../../common/useAwxView';

vi.mock('./useDeleteSources');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));

function createMockInventorySource(overrides: Partial<InventorySource> = {}): InventorySource {
  return {
    id: 1,
    name: 'Test Source',
    type: 'inventory_source',
    source: 'scm',
    description: '',
    scm_branch: '',
    inventory: 10,
    summary_fields: {
      created_by: { id: 1, username: 'admin' },
      modified_by: { id: 1, username: 'admin' },
      organization: { id: 1, name: 'Default', description: '' },
      inventory: {
        name: 'Test Inventory',
        description: '',
        has_active_failures: false,
        has_inventory_sources: true,
        hosts_with_active_failures: 0,
        id: 10,
        inventory_sources_with_failures: 0,
        kind: '',
        organization_id: 1,
        total_groups: 0,
        total_hosts: 0,
        total_inventory_sources: 1,
      },
      user_capabilities: { edit: true, schedule: true, start: true, delete: true },
      last_job: {
        description: '',
        failed: false,
        finished: '',
        id: 0,
        license_error: false,
        name: '',
        status: '',
      },
      current_job: {
        description: '',
        failed: false,
        finished: '',
        id: 0,
        license_error: false,
        name: '',
        status: '',
      },
      execution_environment: { id: 1, name: 'Default EE', description: '', image: '' },
      source_project: { id: 1, name: 'Test Project', description: '', status: 'successful' },
      credential: { id: 1, name: 'Test Credential', description: '', kind: '', cloud: false },
    },
    related: { schedules: '/api/v2/inventory_sources/1/schedules/' },
    ...overrides,
  } as InventorySource;
}

function createMockView(): IAwxView<InventorySource> {
  return {
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IAwxView<InventorySource>;
}

describe('useSourcesActions', () => {
  const mockPageNavigate = vi.fn();
  const mockDeleteSources = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(useDeleteSources).mockReturnValue(mockDeleteSources);
  });

  it('should return an array of page actions', () => {
    const view = createMockView();
    const { result } = renderHook(() => useSourcesActions(view));

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(3);
  });

  it('should have an edit action as the first item', () => {
    const view = createMockView();
    const { result } = renderHook(() => useSourcesActions(view));

    expect(result.current[0]).toMatchObject({
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      isPinned: true,
      label: 'Edit source',
    });
  });

  it('should have a separator as the second item', () => {
    const view = createMockView();
    const { result } = renderHook(() => useSourcesActions(view));

    expect(result.current[1]).toMatchObject({
      type: PageActionType.Seperator,
    });
  });

  it('should have a delete action as the third item', () => {
    const view = createMockView();
    const { result } = renderHook(() => useSourcesActions(view));

    expect(result.current[2]).toMatchObject({
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      label: 'Delete source',
      isDanger: true,
    });
  });

  it('should navigate to edit page when edit action is clicked', () => {
    const view = createMockView();
    const source = createMockInventorySource({ id: 5 });
    const { result } = renderHook(() => useSourcesActions(view));

    const editAction = result.current[0];
    if ('onClick' in editAction && typeof editAction.onClick === 'function') {
      (editAction.onClick as (s: InventorySource) => void)(source);
    }

    expect(mockPageNavigate).toHaveBeenCalledWith('awx-edit-inventory-source', {
      params: { id: 5 },
    });
  });

  it('should call deleteSources with the source wrapped in an array when delete action is clicked', () => {
    const view = createMockView();
    const source = createMockInventorySource({ id: 7 });
    const { result } = renderHook(() => useSourcesActions(view));

    const deleteAction = result.current[2];
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      (deleteAction.onClick as (s: InventorySource) => void)(source);
    }

    expect(mockDeleteSources).toHaveBeenCalledWith([source]);
  });

  it('should pass unselectItemsAndRefresh to useDeleteSources', () => {
    const view = createMockView();
    renderHook(() => useSourcesActions(view));

    expect(useDeleteSources).toHaveBeenCalledWith(view.unselectItemsAndRefresh);
  });

  it('should return a stable actions array across renders when dependencies are unchanged', () => {
    const view = createMockView();
    const { result, rerender } = renderHook(() => useSourcesActions(view));
    const firstRef = result.current;

    rerender();

    expect(result.current).toBe(firstRef);
  });
});
