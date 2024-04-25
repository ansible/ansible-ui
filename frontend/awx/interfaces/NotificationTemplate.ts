import { NotificationTemplate as SwaggerNotificationTemplate } from './generated-from-swagger/api';

type NotificationType = {
  message?: string | undefined;
  body?: string | undefined;
};

type WorkflowApprovalMessages = {
  denied?: NotificationType;
  running?: NotificationType;
  approved?: NotificationType;
  timed_out?: NotificationType;
};

export type MessagesType = {
  error?: NotificationType;
  started?: NotificationType;
  success?: NotificationType;
  workflow_approval?: WorkflowApprovalMessages;
};

export interface NotificationTemplate
  extends Omit<
    SwaggerNotificationTemplate,
    | 'id'
    | 'name'
    | 'organization'
    | 'summary_fields'
    | 'notification_type'
    | 'notification_configuration'
  > {
  id: number;
  name: string;
  organization: number;
  summary_fields: {
    recent_notifications: [
      {
        id: number;
        status: string;
      },
    ];
    user_capabilities: {
      copy: boolean;
      delete: boolean;
      edit: boolean;
    };
    organization: {
      id: number;
      name: string;
      description: string;
    };
    created_by: { id: number; username: string };
    modified_by: { id: number; username: string };
  };
  notification_configuration: {
    [key: string]: number | string | boolean | string[] | { [key: string]: unknown };
  };
  messages?: MessagesType | null;
  notification_type:
    | 'email'
    | 'grafana'
    | 'irc'
    | 'mattermost'
    | 'pagerduty'
    | 'rocketchat'
    | 'slack'
    | 'twilio'
    | 'webhook'
    | null;
}
