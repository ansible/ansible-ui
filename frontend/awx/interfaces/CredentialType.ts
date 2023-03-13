import { CredentialType as SwaggerCredentialType } from './generated-from-swagger/api';

export interface CredentialType extends Omit<SwaggerCredentialType, 'id' | 'name'> {
  id: number;
  name: string;
}
