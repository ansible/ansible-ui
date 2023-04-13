import { Credential } from './Credential';
import { CredentialInputSource as SwaggerCredentialInputSource } from './generated-from-swagger/api';

export interface CredentialInputSource
  extends Omit<
    SwaggerCredentialInputSource,
    'summary_fields' | 'target_credential' | 'source_credential' | 'metadata' | 'input_field_name'
  > {
  summary_fields: { target_credential: Credential; source_credential: Credential };
  target_credential: number;
  source_credential: number;
  metadata: object;
  input_field_name: string;
}
