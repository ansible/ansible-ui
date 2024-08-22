import { CredentialType, CredentialTypeCreate } from './generated/eda-api';
export type EdaCredentialType = CredentialType;
export type EdaCredentialTypeCreate = CredentialTypeCreate;

export interface EdaCredentialTypeInputs {
  fields: {
    id: string;
    label: string;
    type: string;
    help_text: string;
    ask_at_runtime?: boolean;
    default?: number | string | boolean;
  }[];
}

export interface EdaCredentialTypeField {
  id: string;
  label: string;
  type: string;
  help_text: string;
  ask_at_runtime?: boolean;
  hidden?: boolean;
  default?: number | string | boolean;
}
