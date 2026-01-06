/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { renderHook, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, Mock } from 'vitest';
import { useRulebookActivationActions } from './useRulebookActivationActions';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { IEdaView } from '../../common/useEventDrivenView';
import {
  IPageActionButtonSingle,
  IPageActionSwitchSingle,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../framework/useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { hasCopyNamePattern } from '../../common/eda-utils';

const mockNavigate = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
    usePageAlertToaster: () => ({
      addAlert: vi.fn(),
    }),
  };
});

vi.mock('@ansible/common-ui/crud/Data', () => ({
  postRequest: vi.fn(),
}));

vi.mock('../../common/eda-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../common/eda-utils')>();
  return {
    ...actual,
    hasCopyNamePattern: vi.fn(),
  };
});

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    ),
  };
});

vi.mock('./useCopyRulebookactivation', () => ({
  useCopyRulebookActivation: () => vi.fn(),
}));

describe('useRulebookActivationActions', () => {
  const mockView: IEdaView<EdaRulebookActivation> = {
    unselectItemsAndRefresh: vi.fn(),
    refresh: vi.fn(),
  } as unknown as IEdaView<EdaRulebookActivation>;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  it('should return a list of actions', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    expect(result.current).toBeInstanceOf(Array);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should handle action clicks', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const activation = { id: 1, name: 'Test', is_enabled: true } as EdaRulebookActivation;

    const restartAction = result.current.find(
      (action) => 'label' in action && action.label === 'Restart rulebook activation'
    ) as IPageActionButtonSingle<EdaRulebookActivation>;
    act(() => {
      restartAction.onClick(activation);
    });
    expect(screen.getAllByText('Restart rulebook activations')).toHaveLength(2);

    const editAction = result.current.find(
      (action) => 'label' in action && action.label === 'Edit rulebook activation'
    ) as IPageActionButtonSingle<EdaRulebookActivation>;
    editAction.onClick(activation);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should have correct isDisabled and isHidden states', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });

    const stoppingActivation = {
      id: 1,
      name: 'Test',
      is_enabled: true,
      status: 'stopping',
    } as EdaRulebookActivation;
    const runningActivation = {
      id: 1,
      name: 'Test',
      is_enabled: true,
      status: 'running',
    } as EdaRulebookActivation;

    const switchAction = result.current.find(
      (action) => action.type === PageActionType.Switch
    ) as IPageActionSwitchSingle<EdaRulebookActivation>;
    expect(
      typeof switchAction.isDisabled === 'function'
        ? switchAction.isDisabled(stoppingActivation)
        : switchAction.isDisabled
    ).toBe('Cannot change activation status while stopping');
    expect(
      typeof switchAction.isDisabled === 'function'
        ? switchAction.isDisabled(runningActivation)
        : switchAction.isDisabled
    ).toBeUndefined();

    const enabledActivation = { id: 1, name: 'Test', is_enabled: true } as EdaRulebookActivation;
    const disabledActivation = { id: 1, name: 'Test', is_enabled: false } as EdaRulebookActivation;
    const editAction = result.current.find(
      (action) => 'label' in action && action.label === 'Edit rulebook activation'
    ) as IPageActionButtonSingle<EdaRulebookActivation>;
    expect(
      typeof editAction.isDisabled === 'function'
        ? editAction.isDisabled(enabledActivation)
        : editAction.isDisabled
    ).toBe('To edit this rulebook activation, you must first disable it.');
    expect(
      typeof editAction.isDisabled === 'function'
        ? editAction.isDisabled(disabledActivation)
        : editAction.isDisabled
    ).toBe('');

    const deletingActivation = { id: 1, name: 'Test', status: 'deleting' } as EdaRulebookActivation;
    const restartAction = result.current.find(
      (action) => 'label' in action && action.label === 'Restart rulebook activation'
    ) as IPageActionButtonSingle<EdaRulebookActivation>;
    expect(
      typeof restartAction.isHidden === 'function'
        ? restartAction.isHidden(deletingActivation)
        : restartAction.isHidden
    ).toBe(true);
    expect(
      typeof restartAction.isHidden === 'function'
        ? restartAction.isHidden(runningActivation)
        : restartAction.isHidden
    ).toBe(false);
  });

  it('should handle switch toggle', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const activation = { id: 1, name: 'Test', is_enabled: false } as EdaRulebookActivation;
    const switchAction = result.current.find(
      (action) => action.type === PageActionType.Switch
    ) as IPageActionSwitchSingle<EdaRulebookActivation>;

    act(() => {
      switchAction.onToggle(activation, false);
    });
    expect(screen.getAllByText('Disable rulebook activations')).toHaveLength(2);
  });

  it('should handle enable activation without warning', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const activation = { id: 1, name: 'Test', is_enabled: false } as EdaRulebookActivation;
    (hasCopyNamePattern as Mock).mockReturnValue(false);
    (postRequest as Mock).mockResolvedValue({});

    const switchAction = result.current.find(
      (action) => action.type === PageActionType.Switch
    ) as IPageActionSwitchSingle<EdaRulebookActivation>;

    act(() => {
      switchAction.onToggle(activation, true);
    });
    expect(postRequest).toHaveBeenCalled();
  });

  it('should handle enable activation with warning', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const activation = { id: 1, name: 'Test', is_enabled: false } as EdaRulebookActivation;
    (hasCopyNamePattern as Mock).mockReturnValue(true);

    const switchAction = result.current.find(
      (action) => action.type === PageActionType.Switch
    ) as IPageActionSwitchSingle<EdaRulebookActivation>;

    act(() => {
      switchAction.onToggle(activation, true);
    });
    expect(screen.getAllByText('Enable rulebook activations')).toHaveLength(2);
  });

  it('should handle duplicate action', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const activation = { id: 1, name: 'Test' } as EdaRulebookActivation;
    const duplicateAction = result.current.find(
      (action) => 'label' in action && action.label === 'Duplicate rulebook activation'
    ) as IPageActionButtonSingle<EdaRulebookActivation>;

    act(() => {
      duplicateAction.onClick(activation);
    });
    // Duplicate action is mocked to do nothing but we call it for coverage
  });

  it('should handle delete action', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const activation = { id: 1, name: 'Test' } as EdaRulebookActivation;
    const deleteAction = result.current.find(
      (action) => 'label' in action && action.label === 'Delete rulebook activation'
    ) as IPageActionButtonSingle<EdaRulebookActivation>;

    act(() => {
      deleteAction.onClick(activation);
    });
    expect(screen.getByText('Permanently delete rulebook activations')).toBeVisible();
    expect(screen.getByText('Delete rulebook activations')).toBeVisible();
  });

  it('should handle enable activation failure', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const activation = { id: 1, name: 'Test', is_enabled: false } as EdaRulebookActivation;
    (hasCopyNamePattern as Mock).mockReturnValue(false);
    (postRequest as Mock).mockRejectedValue(new Error('Failed to enable'));

    const switchAction = result.current.find(
      (action) => action.type === PageActionType.Switch
    ) as IPageActionSwitchSingle<EdaRulebookActivation>;

    act(() => {
      switchAction.onToggle(activation, true);
    });
    expect(postRequest).toHaveBeenCalled();
  });

  it('should handle restart action with workers offline', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const activation = {
      id: 1,
      name: 'Test',
      status: 'workers offline',
      is_enabled: true,
    } as EdaRulebookActivation;
    const restartAction = result.current.find(
      (action) => 'label' in action && action.label === 'Restart rulebook activation'
    ) as IPageActionButtonSingle<EdaRulebookActivation>;

    act(() => {
      restartAction.onClick(activation);
    });
    expect(screen.getAllByText('Restart rulebook activations')).toHaveLength(2);
  });

  it('should have correct ariaLabel for switch', () => {
    const { result } = renderHook(() => useRulebookActivationActions(mockView), { wrapper });
    const switchAction = result.current.find(
      (action) => action.type === PageActionType.Switch
    ) as IPageActionSwitchSingle<EdaRulebookActivation>;

    if (typeof switchAction.ariaLabel === 'function') {
      expect(switchAction.ariaLabel(true)).toBe('Click to disable instance');
      expect(switchAction.ariaLabel(false)).toBe('Click to enable instance');
    }
  });
});
