import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionType, usePageNavigate } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { useCopyNotifier } from './useCopyNotifier';
import { useDeleteNotifiers } from './useDeleteNotifiers';
import { useNotifiersRowActions } from './useNotifiersRowActions';

vi.mock('./useDeleteNotifiers');
vi.mock('./useCopyNotifier');
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: vi.fn(),
    usePageAlertToaster: vi.fn(() => ({
      addAlert: vi.fn(),
      replaceAlert: vi.fn(),
    })),
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
});
