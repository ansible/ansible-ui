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

const crud = vi.hoisted(() => ({
  useOptions: vi.fn(() => ({ data: { actions: { POST: {} } } })),
  useGetItem: vi.fn(() => ({ data: { name: 'default' } })),
}));

vi.mock('./useAssociateInstanceModal');
vi.mock('./useAssociateInstanceToIG');
vi.mock('./useDisassociateInstanceFromIG');
vi.mock('../../../instances/hooks/useInstanceToolbarActions');
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => crud.useOptions(),
}));
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: () => crud.useGetItem(),
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

function invokeButtonClick(
  action: Extract<IPageAction<Instance>, { type: PageActionType.Button }> | undefined,
  item?: Instance | Instance[]
) {
  if (!action || typeof action.onClick !== 'function') {
    return;
  }
  if (item === undefined) {
    (action.onClick as () => void)();
    return;
  }
  if (Array.isArray(item)) {
    (action.onClick as (items: Instance[]) => void)(item);
    return;
  }
  (action.onClick as (item: Instance) => void)(item);
}

function buttonIsDisabled(
  action: Extract<IPageAction<Instance>, { type: PageActionType.Button }> | undefined,
  item?: Instance | Instance[]
): string | undefined {
  if (!action || !('isDisabled' in action)) {
    return undefined;
  }
  const { isDisabled } = action;
  if (typeof isDisabled === 'function') {
    if (item === undefined) {
      return (isDisabled as () => string | undefined)();
    }
    if (Array.isArray(item)) {
      return (isDisabled as (items: Instance[]) => string | undefined)(item);
    }
    return (isDisabled as (item: Instance) => string | undefined)(item);
  }
  return isDisabled;
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
    crud.useOptions.mockReturnValue({ data: { actions: { POST: {} } } });
    crud.useGetItem.mockReturnValue({ data: { name: 'default' } });
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

  it('enables associate when the user can post and disables it otherwise', () => {
    const allowed = renderToolbarHook();
    const allowedAction = getButtonActionByLabel(allowed.result.current, 'Associate instance');
    expect(buttonIsDisabled(allowedAction)).toBe('');

    crud.useOptions.mockReturnValue({ data: { actions: {} } } as ReturnType<
      typeof crud.useOptions
    >);
    const denied = renderToolbarHook();
    const deniedAction = getButtonActionByLabel(denied.result.current, 'Associate instance');
    expect(buttonIsDisabled(deniedAction)).toMatch(/do not have permission to associate/i);
  });

  it('disassociates selected instances and explains control plane restrictions', () => {
    const { result } = renderToolbarHook();
    const disassociate = getButtonActionByLabel(result.current, 'Disassociate instance');
    const execution = {
      hostname: 'exec-1',
      type: 'instance',
      node_type: 'execution',
    } as Instance;
    invokeButtonClick(disassociate, [execution]);
    expect(mockDisassociate).toHaveBeenCalledWith([execution]);
    expect(buttonIsDisabled(disassociate, [execution])).toBe('');

    crud.useGetItem.mockReturnValue({ data: { name: 'controlplane' } });
    const controlPlane = renderToolbarHook();
    const controlAction = getButtonActionByLabel(
      controlPlane.result.current,
      'Disassociate instance'
    );
    const blocked = [
      { hostname: 'ctrl-1', type: 'instance', node_type: 'control' },
      { hostname: 'hybrid-1', type: 'instance', node_type: 'hybrid' },
      {
        hostname: 'hop-1',
        type: 'hop',
        node_type: 'execution',
        summary_fields: { user_capabilities: { delete: false } },
      },
      {
        hostname: 'hop-2',
        type: 'hop',
        node_type: 'execution',
        summary_fields: { user_capabilities: { delete: true } },
      },
    ] as Instance[];

    expect(buttonIsDisabled(controlAction, blocked)).toBe(
      'You do not have permission to disassociate the following: ctrl-1, hybrid-1, hop-1'
    );
    expect(buttonIsDisabled(controlAction, [execution])).toBe('');
  });
});
