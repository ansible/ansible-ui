import { CredentialType as SwaggerCredentialType } from './generated-from-swagger/api';
import { SummaryFieldsByUser } from './summary-fields/summary-fields';

export interface CredentialInputField {
  id: string;
  choices?: string[];
  label: string;
  secret: boolean;
  type: string;
  help_text: string;
  multiline?: boolean;
  default?: boolean | string;
  ask_at_runtime?: boolean;
}

export interface CredentialType
  extends Omit<SwaggerCredentialType, 'id' | 'name' | 'managed' | 'related' | 'summary_fields'> {
  id: number;
  name: string;
  description: string;
  namespace: string;
  managed: boolean;
  injectors: { [key: string]: string };
  summary_fields: {
    created_by?: SummaryFieldsByUser;
    modified_by?: SummaryFieldsByUser;
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
  inputs: {
    fields: CredentialInputField[];
    required: string[];
    metadata: {
      id: string;
      label: string;
      type: string;
      help_text: string;
    };
  };
  related: {
    credentials: string;
    activity_stream: string;
  };
}
