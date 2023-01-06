import { Credential as SwaggerCredential } from './generated-from-swagger/api';

export interface Credential extends Omit<SwaggerCredential, 'id' | 'name'> {
  id: number;
  name: string;
}
