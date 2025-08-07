import { CredentialType as BaseCredentialType, CredentialTypeCreate } from './generated/eda-api';

export interface EdaCredentialTypeField {
  id: string;
  choices?: string[];
  label: string;
  type: string;
  help_text: string | string[];
  ask_at_runtime?: boolean;
  hidden?: boolean;
  default?: number | string | boolean;
  multiline?: boolean;
  format?: string;
  secret?: boolean;
}

export interface EdaCredentialTypeInputs {
  fields: EdaCredentialTypeField[];
  metadata: EdaCredentialTypeField[];
  required: string[];
}

export interface EdaCredentialType extends Omit<BaseCredentialType, 'inputs'> {
  inputs: EdaCredentialTypeInputs;
}

export type EdaCredentialTypeCreate = CredentialTypeCreate;
