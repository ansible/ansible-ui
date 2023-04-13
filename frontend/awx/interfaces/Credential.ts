import { Credential as SwaggerCredential } from './generated-from-swagger/api';
import { SummaryFieldsByUser, SummaryFieldsOrganization } from './summary-fields/summary-fields';

export interface Credential
  extends Omit<
    SwaggerCredential,
    | 'id'
    | 'name'
    | 'summary_fields'
    | 'managed'
    | 'kubernetes'
    | 'organization'
    | 'cloud'
    | 'description'
    | 'related'
  > {
  description?: string;
  id: number;
  name: string;
  created: string;
  modified: string;
  related: {
    named_url?: string;
    created_by?: string;
    modified_by?: string;
    activity_stream?: string;
    access_list?: string;
    object_roles?: string;
    owner_users?: string;
    owner_teams?: string;
    copy?: string;
    input_sources?: string;
    credential_type?: string;
  };
  summary_fields: {
    credential_type: { id: number; name: string; description?: string };
    organization?: SummaryFieldsOrganization | null;
    created_by: Partial<SummaryFieldsByUser>;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: { id: number; description?: string; name?: string };
      read_role: { id: number; description?: string; name?: string };
      use_role: { id: number; description?: string; name?: string };
    };
    owners: { id?: number; type?: string; name?: string }[] | [];
    user_capabilities: {
      edit: boolean;
      delete: boolean;
      copy: boolean;
      use: boolean;
    };
  };
  kind: string;
  credential_type: number;
  inputs: Record<string | 'url', string | number>;
  cloud: boolean;
  organization: number | null;
  managed: boolean;
  kubernetes: boolean;
}
