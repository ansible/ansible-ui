import { Credential } from './generated/eda-api';
export interface EdaCredential extends Credential {
  secret: string;
}
