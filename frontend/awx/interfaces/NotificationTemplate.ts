import { NotificationTemplate as SwaggerNotificationTemplate } from './generated-from-swagger/api';

export interface NotificationTemplate
  extends Omit<
    SwaggerNotificationTemplate,
    'id' | 'name' | 'organization' | 'summary_fields' | 'notification_type'
  > {
  id: number;
  name: string;
  organization: number;
  summary_fields: {
    recent_notifications: [
      {
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
  };
  notification_configuration: { [key: string]: number | string | boolean | string[] };
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
