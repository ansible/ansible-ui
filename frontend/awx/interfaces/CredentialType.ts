import { CredentialType as SwaggerCredentialType } from './generated-from-swagger/api';

export interface CredentialType extends Omit<SwaggerCredentialType, 'id' | 'name'> {
  id: number;
  name: string;
  inputs: {
    fields: {
      id: string;
      label: string;
      type: string;
      help_text: string;
      ask_at_runtime: boolean;
    }[];
  };
}
