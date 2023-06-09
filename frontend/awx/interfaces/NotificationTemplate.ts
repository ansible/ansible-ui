import { NotificationTemplate as SwaggerNotificationTemplate } from './generated-from-swagger/api';

export interface NotificationTemplate
  extends Omit<SwaggerNotificationTemplate, 'id' | 'name' | 'organization' | 'notification_type'> {
  id: number;
  name: string;
  organization: number;
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
