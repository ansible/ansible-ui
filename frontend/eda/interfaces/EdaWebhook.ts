import { EdaCredentialRef, OrganizationRef } from './generated/eda-api';

export enum WebhookTypeEnum {
  GitHub = 'GitHub',
  GitLab = 'GitLab',
  ServiceNow = 'Service Now',
  Generic = 'Generic',
}
export interface EdaWebhook {
  id: number;
  webhook_type: string;
  name: string;
  organization?: OrganizationRef;
  eda_credential?: EdaCredentialRef;
  test_mode?: boolean;
  additional_data_headers?: string[];
  url: string;
  created_at: string;
  modified_at: string;
  test_headers?: string;
  test_content_type?: string;
  test_content?: string;
  test_error_message?: string;
  events_received?: number;
  last_event_received_at?: string;
}

export interface EdaWebhookCreate {
  webhook_type: string;
  name: string;
  organization_id?: number | string | null;
  eda_credential_id?: number | string | null;
  test_mode?: boolean;
  additional_data_headers?: string[];
}

/** Serializer for Webhook reference. */
export interface WebhookRef {
  id: number;
  name: string;
  description?: string;
  webhook_type?: string;
}
