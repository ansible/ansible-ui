import { renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PageActionType, usePageNavigate } from '@ansible/ansible-ui-framework';
import { useDeleteInstanceGroups } from './useDeleteInstanceGroups';
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

function getToolbarActionByLabel(
  actions: ReturnType<typeof useInstanceGroupToolbarActions>,
  label: string
) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function getRowActionByLabel(
  actions: ReturnType<typeof useInstanceGroupRowActions>,
  label: string
) {
  return actions.find((action) => 'label' in action && action.label === label);
}

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

    expect(getToolbarActionByLabel(result.current, 'Create group')).toMatchObject({
      type: PageActionType.Dropdown,
    });
    expect(getToolbarActionByLabel(result.current, 'Delete instance groups')).toMatchObject({
      type: PageActionType.Button,
      isDanger: true,
    });
  });

  test('useInstanceGroupRowActions exposes edit and delete row actions', () => {
    const { result } = renderActionsHook(useInstanceGroupRowActions);

    expect(getRowActionByLabel(result.current, 'Edit instance group')).toMatchObject({
      type: PageActionType.Button,
    });
    expect(getRowActionByLabel(result.current, 'Delete instance group')).toMatchObject({
      type: PageActionType.Button,
      isDanger: true,
    });
  });
});
