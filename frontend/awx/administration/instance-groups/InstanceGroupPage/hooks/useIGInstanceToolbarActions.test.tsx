import { renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionType } from '@ansible/ansible-ui-framework';
import { Instance } from '../../../../interfaces/Instance';
import { IAwxView } from '../../../../common/useAwxView';
vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

import { useIGInstanceToolbarActions } from './useIGInstanceToolbarActions';
import { useAssociateInstanceModal } from './useAssociateInstanceModal';
import { useAssociateInstanceToIG } from './useAssociateInstanceToIG';
import { useDisassociateInstanceFromIG } from './useDisassociateInstanceFromIG';
import { useRunHealthCheckToolbarAction } from '../../../instances/hooks/useInstanceToolbarActions';

vi.mock('./useAssociateInstanceModal');
vi.mock('./useAssociateInstanceToIG');
vi.mock('./useDisassociateInstanceFromIG');
vi.mock('../../../instances/hooks/useInstanceToolbarActions');
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: { POST: {} } } }),
}));
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: () => ({ data: { name: 'default' } }),
}));

const mockView = {
  unselectItemsAndRefresh: vi.fn(),
} as unknown as IAwxView<Instance>;

function getActionByLabel(actions: ReturnType<typeof useIGInstanceToolbarActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function getButtonActionByLabel(
  actions: IPageAction<Instance>[],
  label: string
): Extract<IPageAction<Instance>, { type: PageActionType.Button }> | undefined {
  return actions.find(
    (action): action is Extract<IPageAction<Instance>, { type: PageActionType.Button }> =>
      action.type === PageActionType.Button && 'label' in action && action.label === label
  );
}

function renderToolbarHook() {
  return renderHook(() => useIGInstanceToolbarActions(mockView), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={['/instance-groups/1/instances']}>
        <Routes>
          <Route path="/instance-groups/:id/instances" element={children} />
        </Routes>
      </MemoryRouter>
    ),
  });
}

describe('useIGInstanceToolbarActions', () => {
  const mockOpenAssociate = vi.fn();
  const mockAssociateToIG = vi.fn();
  const mockDisassociate = vi.fn();
  const mockHealthCheckAction = {
    type: PageActionType.Button,
    label: 'Run health check',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAssociateInstanceModal).mockReturnValue(mockOpenAssociate);
    vi.mocked(useAssociateInstanceToIG).mockReturnValue(mockAssociateToIG);
    vi.mocked(useDisassociateInstanceFromIG).mockReturnValue(mockDisassociate);
    vi.mocked(useRunHealthCheckToolbarAction).mockReturnValue(
      mockHealthCheckAction as ReturnType<typeof useRunHealthCheckToolbarAction>
    );
  });

  it('includes associate, disassociate, and health check toolbar actions', () => {
    const { result } = renderToolbarHook();

    expect(getActionByLabel(result.current, 'Associate instance')).toMatchObject({
      type: PageActionType.Button,
    });
    expect(getActionByLabel(result.current, 'Disassociate instance')).toBeDefined();
    expect(getActionByLabel(result.current, 'Run health check')).toBeDefined();
  });

  it('opens associate modal when associate action is clicked', () => {
    const { result } = renderToolbarHook();
    const associateAction = getButtonActionByLabel(result.current, 'Associate instance');
    if (
      associateAction &&
      'onClick' in associateAction &&
      typeof associateAction.onClick === 'function'
    ) {
      (associateAction.onClick as () => void)();
    }

    expect(mockOpenAssociate).toHaveBeenCalledWith({
      onAssociate: mockAssociateToIG,
      instanceGroupId: '1',
    });
  });
});
