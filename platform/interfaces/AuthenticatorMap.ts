import type { User } from './User';
import type { Authenticator } from './Authenticator';

export interface AuthenticatorMap {
  name: string;
  id: number;
  url: string;
  created_on: string;
  created_by?: number;
  modified_on: string;
  modified_by?: number;
  related: {
    [key: string]: string;
  };
  authenticator: number;
  order: number;
  organization: string;
  revoke: boolean;
  triggers: {
    [key: string]: object;
  };
  map_type: string;
  ui_summary?: string;
  summary_fields: {
    created_by: User;
    modified_by: User;
    authenticator: Pick<Authenticator, 'id' | 'name'>;
  };
}
