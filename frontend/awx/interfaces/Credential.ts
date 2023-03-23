import { Credential as SwaggerCredential } from './generated-from-swagger/api';
import { SummaryFieldsByUser, SummaryFieldsOrganization } from './summary-fields/summary-fields';

export interface Credential extends Omit<SwaggerCredential, 'id' | 'name' | 'summary_fields'> {
  id: number;
  name: string;
  credential_type: number;
  inputs?: { url?: string; vault_id?: number | string };
  user?: number | null;
  summary_fields: {
    organization: SummaryFieldsOrganization;
    credential_type: { id: number; name: string };
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: { id: number };
      read_role: { id: number };
      use_role: { id: number };
    };
    owners: { id: number; type: string; name: string };
    description: string[];
    user_capabilities: {
      edit: boolean;
      delete: boolean;
      copy: boolean;
      use: boolean;
    };
  };
}
