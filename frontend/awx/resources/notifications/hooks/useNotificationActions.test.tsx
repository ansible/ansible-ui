import { renderHook } from '@testing-library/react';
import { IPageActionSwitchSingle, PageActionType } from '@ansible/ansible-ui-framework';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockPostRequest = vi.fn().mockResolvedValue({});

vi.mock('@ansible/common-ui/crud/Data', () => ({
  postRequest: (...args: unknown[]) => mockPostRequest(...args) as Promise<unknown>,
}));

import { useNotificationActions } from './useNotificationActions';

const mockNotificationTemplate: NotificationTemplate = {
  id: 1,
  name: 'Slack Notifier',
  type: 'notification_template',
  url: '/api/v2/notification_templates/1/',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  description: 'Slack notification',
  notification_type: 'slack',
  organization: 1,
  summary_fields: {
    organization: { id: 1, name: 'Default', description: '' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    recent_notifications: [
      { id: 1, status: 'successful', error: '', created: '2024-01-01T00:00:00Z' },
    ],
    user_capabilities: { copy: true, edit: true, delete: true },
  },
  messages: undefined,
  notification_configuration: {},
};

const mockRefresh = vi.fn();

const baseProps = {
  notificationApproval: undefined as NotificationTemplate[] | undefined,
  notificationApprovalRefresh: mockRefresh,
  notificationStarted: undefined as NotificationTemplate[] | undefined,
  notificationStartedRefresh: mockRefresh,
  notificationSuccess: undefined as NotificationTemplate[] | undefined,
  notificationSuccessRefresh: mockRefresh,
  notificationError: undefined as NotificationTemplate[] | undefined,
  notificationErrorRefresh: mockRefresh,
  resourceType: 'organizations',
  resourceId: '1',
};

function isSwitchSingle(
  action: ReturnType<typeof useNotificationActions>[number]
): action is IPageActionSwitchSingle<NotificationTemplate> {
  return action.type === PageActionType.Switch && 'onToggle' in action;
}

function findSwitchAction(actions: ReturnType<typeof useNotificationActions>, label: string) {
  return actions.filter(isSwitchSingle).find((a) => a.label === label);
}

describe('useNotificationActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should include approval toggle for organizations', () => {
    const { result } = renderHook(() => useNotificationActions(baseProps));

    const labels = result.current
      .filter((a) => 'label' in a)
      .map((a) => ('label' in a ? a.label : ''));

    expect(labels).toContain('Approval');
    expect(labels).toContain('Start');
    expect(labels).toContain('Success');
    expect(labels).toContain('Failure');
    expect(result.current.filter((a) => 'label' in a)).toHaveLength(4);
  });

  test('should include approval toggle for workflow_job_templates', () => {
    const { result } = renderHook(() =>
      useNotificationActions({ ...baseProps, resourceType: 'workflow_job_templates' })
    );

    const labels = result.current
      .filter((a) => 'label' in a)
      .map((a) => ('label' in a ? a.label : ''));

    expect(labels).toContain('Approval');
  });

  test('should exclude approval toggle for non-organization resources', () => {
    const { result } = renderHook(() =>
      useNotificationActions({ ...baseProps, resourceType: 'job_templates' })
    );

    const labels = result.current
      .filter((a) => 'label' in a)
      .map((a) => ('label' in a ? a.label : ''));

    expect(labels).not.toContain('Approval');
    expect(labels).toContain('Start');
    expect(labels).toContain('Success');
    expect(labels).toContain('Failure');
    expect(result.current.filter((a) => 'label' in a)).toHaveLength(3);
  });

  test('should detect enabled notification via isSwitchOn', () => {
    const { result } = renderHook(() =>
      useNotificationActions({ ...baseProps, notificationApproval: [mockNotificationTemplate] })
    );

    const action = findSwitchAction(result.current, 'Approval');
    expect(action).toBeDefined();
    expect(action!.isSwitchOn(mockNotificationTemplate)).toBe(true);
  });

  test('should detect disabled notification via isSwitchOn', () => {
    const { result } = renderHook(() =>
      useNotificationActions({ ...baseProps, notificationApproval: [] })
    );

    const action = findSwitchAction(result.current, 'Approval');
    expect(action).toBeDefined();
    expect(action!.isSwitchOn(mockNotificationTemplate)).toBe(false);
  });

  test('should call correct API endpoint when toggling approval on', async () => {
    const { result } = renderHook(() => useNotificationActions(baseProps));

    const action = findSwitchAction(result.current, 'Approval');
    expect(action).toBeDefined();
    await action!.onToggle(mockNotificationTemplate, true);

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/organizations/1/notification_templates_approvals/'),
      { id: 1 }
    );
  });

  test('should call correct API endpoint when toggling start notification', async () => {
    const { result } = renderHook(() => useNotificationActions(baseProps));

    const action = findSwitchAction(result.current, 'Start');
    expect(action).toBeDefined();
    await action!.onToggle(mockNotificationTemplate, true);

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/organizations/1/notification_templates_started/'),
      { id: 1 }
    );
  });

  test('should call correct API endpoint when toggling success notification', async () => {
    const { result } = renderHook(() => useNotificationActions(baseProps));

    const action = findSwitchAction(result.current, 'Success');
    expect(action).toBeDefined();
    await action!.onToggle(mockNotificationTemplate, true);

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/organizations/1/notification_templates_success/'),
      { id: 1 }
    );
  });

  test('should call correct API endpoint when toggling failure notification', async () => {
    const { result } = renderHook(() => useNotificationActions(baseProps));

    const action = findSwitchAction(result.current, 'Failure');
    expect(action).toBeDefined();
    await action!.onToggle(mockNotificationTemplate, true);

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/organizations/1/notification_templates_error/'),
      { id: 1 }
    );
  });

  test('should send disassociate flag when toggling notification off', async () => {
    const { result } = renderHook(() => useNotificationActions(baseProps));

    const action = findSwitchAction(result.current, 'Approval');
    expect(action).toBeDefined();
    await action!.onToggle(mockNotificationTemplate, false);

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/notification_templates_approvals/'),
      expect.objectContaining({ id: 1, disassociate: true })
    );
  });

  test('should refresh all notification lists after toggle', async () => {
    const { result } = renderHook(() => useNotificationActions(baseProps));

    const action = findSwitchAction(result.current, 'Start');
    expect(action).toBeDefined();
    await action!.onToggle(mockNotificationTemplate, true);

    expect(mockRefresh).toHaveBeenCalledTimes(4);
  });

  test('should generate correct aria labels for enabled/disabled states', () => {
    const { result } = renderHook(() => useNotificationActions(baseProps));

    const action = findSwitchAction(result.current, 'Approval');
    expect(action).toBeDefined();
    expect(action!.ariaLabel(true)).toContain('disable');
    expect(action!.ariaLabel(false)).toContain('enable');
  });
});
