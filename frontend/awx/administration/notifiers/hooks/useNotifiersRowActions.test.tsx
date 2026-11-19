import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionType, usePageNavigate } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { useCopyNotifier } from './useCopyNotifier';
import { useDeleteNotifiers } from './useDeleteNotifiers';
import { useNotifiersRowActions } from './useNotifiersRowActions';

const alertToaster = vi.hoisted(() => ({
  addAlert: vi.fn(),
  replaceAlert: vi.fn(),
}));

vi.mock('./useDeleteNotifiers');
vi.mock('./useCopyNotifier');
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: vi.fn(),
    usePageAlertToaster: () => alertToaster,
  };
});

const server = setupServer(
  http.post(awxAPI`/notification_templates/:id/test/`, () => HttpResponse.json({ id: 99 }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createNotifier(overrides: Partial<NotificationTemplate> = {}): NotificationTemplate {
  return {
    id: 1,
    name: 'Email',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, copy: true },
    },
    ...overrides,
  } as NotificationTemplate;
}

function getActionByLabel(actions: ReturnType<typeof useNotifiersRowActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function getButtonActionByLabel(
  actions: IPageAction<NotificationTemplate>[],
  label: string
): Extract<IPageAction<NotificationTemplate>, { type: PageActionType.Button }> | undefined {
  return actions.find(
    (
      action
    ): action is Extract<IPageAction<NotificationTemplate>, { type: PageActionType.Button }> =>
      action.type === PageActionType.Button && 'label' in action && action.label === label
  );
}

function invokeButtonClick<T extends object>(
  action: Extract<IPageAction<T>, { type: PageActionType.Button }> | undefined,
  item?: T | T[]
) {
  if (!action || typeof action.onClick !== 'function') {
    return;
  }
  if (item === undefined) {
    (action.onClick as () => void)();
    return;
  }
  if (Array.isArray(item)) {
    (action.onClick as (items: T[]) => void)(item);
    return;
  }
  (action.onClick as (item: T) => void)(item);
}

function buttonIsDisabled<T extends object>(
  action: Extract<IPageAction<T>, { type: PageActionType.Button }> | undefined,
  item?: T | T[]
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
      return (isDisabled as (items: T[]) => string | undefined)(item);
    }
    return (isDisabled as (item: T) => string | undefined)(item);
  }
  return isDisabled;
}

describe('useNotifiersRowActions', () => {
  const mockNavigate = vi.fn();
  const mockDelete = vi.fn();
  const mockCopy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useDeleteNotifiers).mockReturnValue(mockDelete);
    vi.mocked(useCopyNotifier).mockReturnValue(mockCopy);
  });

  it('exposes edit, test, duplicate, and delete actions', () => {
    const { result } = renderHook(() => useNotifiersRowActions({}));

    expect(getActionByLabel(result.current, 'Edit notifier')).toMatchObject({
      type: PageActionType.Button,
    });
    expect(getActionByLabel(result.current, 'Test notifier')).toBeDefined();
    expect(getActionByLabel(result.current, 'Duplicate notifier')).toBeDefined();
    expect(getActionByLabel(result.current, 'Delete notifier')).toMatchObject({
      isDanger: true,
    });
  });

  it('starts notifier test and reports running notification id', async () => {
    const onNotifierStartTest = vi.fn();
    const { result } = renderHook(() => useNotifiersRowActions({ onNotifierStartTest }));

    const notifier = createNotifier();
    const testAction = getButtonActionByLabel(result.current, 'Test notifier');
    if (testAction && 'onClick' in testAction && typeof testAction.onClick === 'function') {
      (testAction.onClick as (item: NotificationTemplate) => void)(notifier);
    }

    await waitFor(() =>
      expect(onNotifierStartTest).toHaveBeenCalledWith(notifier.id.toString(), '99')
    );
  });

  it('disables test action while a test is running', () => {
    const { result } = renderHook(() =>
      useNotifiersRowActions({ runningNotifications: { '1': 'running' } })
    );

    const testAction = getButtonActionByLabel(result.current, 'Test notifier');
    if (testAction && 'isDisabled' in testAction && typeof testAction.isDisabled === 'function') {
      expect(
        (testAction.isDisabled as (item: NotificationTemplate) => string | undefined)(
          createNotifier()
        )
      ).toContain('Disabled while test is running');
    } else {
      throw new Error('expected test action with isDisabled');
    }
  });

  it('leaves the test action enabled when that notifier is not running', () => {
    const { result } = renderHook(() => useNotifiersRowActions({ runningNotifications: {} }));
    const testAction = getButtonActionByLabel(result.current, 'Test notifier');
    expect(buttonIsDisabled(testAction, createNotifier())).toBeUndefined();
  });

  it('navigates to the edit form and invokes duplicate and delete callbacks', () => {
    const { result } = renderHook(() => useNotifiersRowActions({}));
    const notifier = createNotifier({ id: 4 });

    invokeButtonClick(getButtonActionByLabel(result.current, 'Edit notifier'), notifier);
    expect(mockNavigate).toHaveBeenCalledWith('awx-edit-notification-template', {
      params: { id: 4 },
    });

    invokeButtonClick(getButtonActionByLabel(result.current, 'Duplicate notifier'), notifier);
    expect(mockCopy).toHaveBeenCalledWith(notifier);

    invokeButtonClick(getButtonActionByLabel(result.current, 'Delete notifier'), notifier);
    expect(mockDelete).toHaveBeenCalledWith([notifier]);
  });

  it('disables edit, duplicate, and delete when the user lacks permission', () => {
    const { result } = renderHook(() => useNotifiersRowActions({}));
    const locked = createNotifier({
      summary_fields: {
        user_capabilities: { edit: false, delete: false, copy: false },
      },
    } as Partial<NotificationTemplate>);
    const editable = createNotifier();

    expect(
      buttonIsDisabled(getButtonActionByLabel(result.current, 'Edit notifier'), locked)
    ).toMatch(/insufficient permissions/);
    expect(
      buttonIsDisabled(getButtonActionByLabel(result.current, 'Edit notifier'), editable)
    ).toBe('');
    expect(
      buttonIsDisabled(getButtonActionByLabel(result.current, 'Duplicate notifier'), locked)
    ).toMatch(/insufficient permissions/);
    expect(
      buttonIsDisabled(getButtonActionByLabel(result.current, 'Duplicate notifier'), editable)
    ).toBe('');
    expect(
      buttonIsDisabled(getButtonActionByLabel(result.current, 'Delete notifier'), locked)
    ).toMatch(/insufficient permissions/);
    expect(
      buttonIsDisabled(getButtonActionByLabel(result.current, 'Delete notifier'), editable)
    ).toBe('');
  });

  it('shows an alert when the notifier test request fails', async () => {
    server.use(
      http.post(awxAPI`/notification_templates/:id/test/`, () =>
        HttpResponse.json({ detail: 'nope' }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useNotifiersRowActions({}));
    const notifier = createNotifier();

    act(() => {
      invokeButtonClick(getButtonActionByLabel(result.current, 'Test notifier'), notifier);
    });

    await waitFor(() =>
      expect(alertToaster.addAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Failed to test notifier',
        })
      )
    );
  });

  it('tests a notifier even when no start callback is provided', async () => {
    let posted = false;
    server.use(
      http.post(awxAPI`/notification_templates/:id/test/`, () => {
        posted = true;
        return HttpResponse.json({ id: 5 });
      })
    );
    const { result } = renderHook(() => useNotifiersRowActions({}));

    act(() => {
      invokeButtonClick(getButtonActionByLabel(result.current, 'Test notifier'), createNotifier());
    });

    await waitFor(() => expect(posted).toBe(true));
  });
});
