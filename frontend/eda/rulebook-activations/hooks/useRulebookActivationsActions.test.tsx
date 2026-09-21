import {
  IPageActionButtonMultiple,
  IPageActionLink,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { act, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../framework/useFrameworkTranslations';
import { EdaActiveUserContext } from '../../common/useEdaActiveUser';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { useRulebookActivationsActions } from './useRulebookActivationsActions';

const mockAddAlert = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl: () => vi.fn(),
    usePageAlertToaster: () => ({
      addAlert: mockAddAlert,
    }),
  };
});

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode;
      'aria-label': string;
    }) => (
      <dialog open aria-label={ariaLabel}>
        {children}
      </dialog>
    ),
  };
});

vi.mock('../../common/eda-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../common/eda-utils')>();
  return {
    ...actual,
    edaAPI: (strings: TemplateStringsArray, ...values: (string | number)[]) => {
      let url = '';
      strings.forEach((string, i) => {
        url += string + (values[i]?.toString() || '');
      });
      return url;
    },
  };
});

const mockOptionsData: { data: { actions?: { POST?: boolean } } | undefined } = {
  data: { actions: { POST: true } },
};
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => mockOptionsData,
}));

const mockEnableActivationsWithWarning = vi.fn();
const mockRestartActivations = vi.fn();
const mockRestartActivationsWithWarning = vi.fn();
const mockDisableRulebookActivations = vi.fn();
const mockDisableActivationsWithWarning = vi.fn();
const mockDeleteRulebookActivations = vi.fn();
const mockDeleteActivationsWithWarning = vi.fn();

const mockActiveUser = {
  id: 1,
  username: 'admin',
  is_superuser: true,
  resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

vi.mock('./useControlRulebookActivations', () => ({
  useEnableRulebookActivationsWithWarning: () => mockEnableActivationsWithWarning,
  useRestartRulebookActivations: () => mockRestartActivations,
  useRestartRulebookActivationsWithWarning: () => mockRestartActivationsWithWarning,
  useDisableRulebookActivations: () => mockDisableRulebookActivations,
  useDisableRulebookActivationsWithWarning: () => mockDisableActivationsWithWarning,
}));

vi.mock('./useDeleteRulebookActivations', () => ({
  useDeleteRulebookActivations: () => mockDeleteRulebookActivations,
  useDeleteRulebookActivationsWithWarning: () => mockDeleteActivationsWithWarning,
}));

const server = setupServer();

describe('useRulebookActivationsActions', () => {
  const mockView: IEdaView<EdaRulebookActivation> = {
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IEdaView<EdaRulebookActivation>;

  const createWrapper = (activeEdaUser = mockActiveUser) => {
    const contextValue = { activeEdaUser };
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <BrowserRouter>
          <PageDialogProvider>
            <FrameworkTranslationsProvider>
              <EdaActiveUserContext.Provider value={contextValue}>
                {children}
              </EdaActiveUserContext.Provider>
            </FrameworkTranslationsProvider>
          </PageDialogProvider>
        </BrowserRouter>
      );
    };
    Wrapper.displayName = 'RulebookActivationsActionsTestWrapper';
    return Wrapper;
  };

  const wrapper = createWrapper();

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  it('should return a list of bulk actions', () => {
    mockOptionsData.data = { actions: { POST: true } };
    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    expect(result.current).toBeInstanceOf(Array);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should handle action clicks', () => {
    mockOptionsData.data = { actions: { POST: true } };
    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    const activations = [{ id: 1, name: 'Test' }] as EdaRulebookActivation[];

    const disableAction = result.current.find(
      (action) =>
        action.type === PageActionType.Button && action.label === 'Disable rulebook activations'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;
    act(() => {
      disableAction.onClick(activations);
    });
    expect(mockDisableRulebookActivations).toHaveBeenCalledWith(activations);

    const restartAction = result.current.find(
      (action) =>
        action.type === PageActionType.Button && action.label === 'Restart rulebook activations'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;
    act(() => {
      restartAction.onClick(activations);
    });
    expect(mockRestartActivations).toHaveBeenCalledWith(activations);

    const deleteAction = result.current.find(
      (action) =>
        action.type === PageActionType.Button && action.label === 'Delete rulebook activations'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;
    act(() => {
      deleteAction.onClick(activations);
    });
    expect(mockDeleteRulebookActivations).toHaveBeenCalledWith(activations);
  });

  it('should clear logs for selected activations', async () => {
    const user = userEvent.setup();
    const clearLogs = vi.fn(() => HttpResponse.json({ deleted: 2 }));
    server.use(http.post('*/activations/:id/clear-logs/', clearLogs));

    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    const clearLogsAction = result.current.find(
      (action) => action.type === PageActionType.Button && action.label === 'Clear logs'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;
    const activations = [
      { id: 1, name: 'Activation 2' },
      { id: 2, name: 'Activation 1' },
    ] as EdaRulebookActivation[];

    act(() => {
      clearLogsAction.onClick(activations);
    });

    const dialog = await screen.findByRole('dialog', { name: 'Clear logs?' });
    expect(
      within(dialog).getByText(
        'Removes stored logs for Activation 1, Activation 2. Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.'
      )
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole('table')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Clear logs' })).toBeDisabled();

    await user.click(
      within(dialog).getByRole('checkbox', {
        name: 'I understand that clearing logs cannot be undone.',
      })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Clear logs' }));

    await waitFor(() => {
      expect(clearLogs).toHaveBeenCalledTimes(2);
    });
  });

  it('should allow non-admin users to open clear logs for backend authorization', () => {
    const { result } = renderHook(() => useRulebookActivationsActions(mockView), {
      wrapper: createWrapper({ ...mockActiveUser, is_superuser: false }),
    });
    const clearLogsAction = result.current.find(
      (action) => action.type === PageActionType.Button && action.label === 'Clear logs'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;

    expect(clearLogsAction.isDisabled).toBeUndefined();
  });

  it('should handle enable rulebook activations without warning', async () => {
    server.use(
      http.post('*/activations/1/enable/', () => {
        return HttpResponse.json({}, { status: 200 });
      })
    );

    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    const activations = [{ id: 1, name: 'Test', is_enabled: false }] as EdaRulebookActivation[];

    const enableAction = result.current.find(
      (action) =>
        action.type === PageActionType.Button && action.label === 'Enable rulebook activations'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;

    await act(async () => {
      await enableAction.onClick(activations);
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'success',
        title: 'Test enabled.',
      })
    );
    expect(mockView.unselectItemsAndRefresh).toHaveBeenCalledWith(activations);
  });

  it('should handle enable rulebook activations failure', async () => {
    server.use(
      http.post('*/activations/1/enable/', () => {
        return new HttpResponse(null, { status: 400 });
      })
    );

    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    const activations = [{ id: 1, name: 'Test', is_enabled: false }] as EdaRulebookActivation[];

    const enableAction = result.current.find(
      (action) =>
        action.type === PageActionType.Button && action.label === 'Enable rulebook activations'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;

    await act(async () => {
      await enableAction.onClick(activations);
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to enable Test',
      })
    );
  });

  it('should handle enable rulebook activations with warning', async () => {
    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    const activations = [
      { id: 1, name: 'Test @ 12:34:56', is_enabled: false },
    ] as EdaRulebookActivation[];

    const enableAction = result.current.find(
      (action) =>
        action.type === PageActionType.Button && action.label === 'Enable rulebook activations'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;

    await act(async () => {
      await enableAction.onClick(activations);
    });

    expect(mockEnableActivationsWithWarning).toHaveBeenCalledWith(activations);
  });

  it('should handle restart rulebook activations with warning', () => {
    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    const activations = [
      { id: 1, name: 'Test', status: StatusEnum.WorkersOffline },
    ] as EdaRulebookActivation[];

    const restartAction = result.current.find(
      (action) =>
        action.type === PageActionType.Button && action.label === 'Restart rulebook activations'
    ) as IPageActionButtonMultiple<EdaRulebookActivation>;

    act(() => {
      restartAction.onClick(activations);
    });

    expect(mockRestartActivationsWithWarning).toHaveBeenCalledWith(activations);
  });

  it('should handle permission-based isDisabled state for create action', () => {
    mockOptionsData.data = { actions: { POST: true } };
    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    const createAction = result.current.find(
      (action) =>
        action.type === PageActionType.Link && action.label === 'Create rulebook activation'
    ) as IPageActionLink;
    expect(createAction.isDisabled).toBeUndefined();
  });

  it('should return error message when no permission to create', () => {
    mockOptionsData.data = undefined;
    const { result } = renderHook(() => useRulebookActivationsActions(mockView), { wrapper });
    const createAction = result.current.find(
      (action) =>
        action.type === PageActionType.Link && action.label === 'Create rulebook activation'
    ) as IPageActionLink;
    expect(createAction.isDisabled).toBe(
      'You do not have permission to create a rulebook activation. Please contact your organization administrator if there is an issue with your access.'
    );
  });
});
