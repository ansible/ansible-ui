import type { Authenticator } from './Authenticator';
import type { PlatformUser } from './PlatformUser';

export enum AuthenticatorMapType {
  'allow' = 'allow',
  'organization' = 'organization',
  'team' = 'team',
}

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
  map_type: AuthenticatorMapType;
  ui_summary?: string;
  summary_fields: {
    created_by: PlatformUser;
    modified_by: PlatformUser;
    authenticator: Pick<Authenticator, 'id' | 'name'>;
  };
}
