import { OrganizationRef } from './generated/eda-api';

export enum WebhookTypeEnum {
  GitHub = 'GitHub',
  GitLab = 'GitLab',
  ServiceNow = 'Service Now',
  Generic = 'Generic',
}
export interface EdaWebhook {
  name: string;
  test_mode?: boolean;
  user: string;
  hmac_algorithm?: string;
  header_key?: string;
  hmac_signature_prefix: string;
  hmac_format?: string;
  auth_type: string;
  additional_data_headers?: string[];
  id: number;
  organization: OrganizationRef;
  url: string;
  created_at: string;
  modified_at: string;
  test_content_type?: string;
  test_content?: string;
  test_error_message?: string;
}

export interface EdaWebhookCreate {
  type: WebhookTypeEnum;
  name: string;
  organization_id?: number | null;
  hmac_algorithm?: string;
  header_key?: string;
  auth_type?: string;
  hmac_signature_prefix?: string;
  hmac_format?: string;
  secret: string;
  test_mode?: boolean;
  additional_data_headers?: string[];
}

/** Serializer for Webhook reference. */
export interface WebhookRef {
  id: number;
  name: string;
  description?: string;
  webhook_type?: WebhookTypeEnum;
}
