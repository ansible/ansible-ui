import { renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PageActionType, usePageNavigate } from '@ansible/ansible-ui-framework';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useDeleteInstanceGroups } from './useDeleteInstanceGroups';
import { AwxRoute } from '../../../main/AwxRoutes';
import {
  useInstanceGroupRowActions,
  useInstanceGroupToolbarActions,
} from './useInstanceGroupActions';

vi.mock('./useDeleteInstanceGroups');
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: { POST: {} } } }),
}));
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: vi.fn(),
  };
});

const mockInstanceGroup: InstanceGroup = {
  id: 1,
  type: 'instance_group',
  url: '/api/v2/instance_groups/1/',
  name: 'default',
  is_container_group: false,
  capacity: 100,
  jobs_running: 0,
  jobs_total: 0,
  instances: 1,
  percent_capacity_remaining: 100,
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
  },
};

function renderActionsHook<T>(useActions: (onComplete: () => void) => T) {
  const onComplete = vi.fn();
  return renderHook(() => useActions(onComplete), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={['/instance-groups/1']}>
        <Routes>
          <Route path="/instance-groups/:id" element={children} />
        </Routes>
      </MemoryRouter>
    ),
  });
}

describe('useInstanceGroupActions', () => {
  const mockPageNavigate = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(useDeleteInstanceGroups).mockReturnValue(mockDelete);
  });

  test('useInstanceGroupToolbarActions exposes create and delete actions', () => {
    const { result } = renderActionsHook(useInstanceGroupToolbarActions);

    expect(result.current[0]).toMatchObject({
      type: PageActionType.Dropdown,
      label: 'Create group',
    });
    expect(result.current[2]).toMatchObject({
      type: PageActionType.Button,
      label: 'Delete instance groups',
      isDanger: true,
    });
  });

  test('useInstanceGroupRowActions exposes edit and delete row actions', () => {
    const { result } = renderActionsHook(useInstanceGroupRowActions);

    expect(result.current[0]).toMatchObject({
      type: PageActionType.Button,
      label: 'Edit instance group',
    });
    expect(result.current[3]).toMatchObject({
      type: PageActionType.Button,
      label: 'Delete instance group',
      isDanger: true,
    });

    const editAction = result.current[0];
    expect(editAction.type).toBe(PageActionType.Button);
    if (editAction.type === PageActionType.Button) {
      editAction.onClick(mockInstanceGroup);
    }
    expect(mockPageNavigate).toHaveBeenCalledWith(AwxRoute.EditInstanceGroup, {
      params: { id: 1 },
    });
  });
});
