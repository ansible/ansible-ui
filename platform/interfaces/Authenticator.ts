import type { PlatformUser } from './PlatformUser';

export enum AuthenticatorTypeEnum {
  Local = 'ansible_base.authentication.authenticator_plugins.local',
  LDAP = 'ansible_base.authentication.authenticator_plugins.ldap',
  Keycloak = 'ansible_base.authentication.authenticator_plugins.keycloak',
  SAML = 'ansible_base.authentication.authenticator_plugins.saml',
}

export interface Authenticator {
  name: string;
  id: number;
  url: string;
  created: string;
  created_by?: string;
  modified: string;
  modified_by?: string;
  related: {
    [key: string]: string;
  };
  enabled: boolean;
  create_objects: boolean;
  remove_users: boolean;
  configuration: {
    [key: string]: boolean | string | string[] | { [k: string]: string };
  };
  type: AuthenticatorTypeEnum;
  order: number;
  slug: string;
  summary_fields: {
    created_by: PlatformUser;
    modified_by: PlatformUser;
  };
}
