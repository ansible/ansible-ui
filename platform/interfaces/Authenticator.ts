import type { User } from './User';

export enum AuthenticatorTypeEnum {
  Local = 'ansible_base.authenticator_plugins.local',
  LDAP = 'ansible_base.authenticator_plugins.ldap',
  Keycloak = 'ansible_base.authenticator_plugins.keycloak',
}

export interface Authenticator {
  name: string;
  id: number;
  url: string;
  created_on: string;
  created_by?: string;
  modified_on: string;
  modified_by?: string;
  related: {
    [key: string]: string;
  };
  enabled: boolean;
  create_objects: boolean;
  users_unique: boolean;
  remove_users: boolean;
  configuration: {
    [key: string]: string | string[] | { [k: string]: string };
  };
  type: AuthenticatorTypeEnum;
  order: number;
  slug: string;
  summary_fields: {
    created_by: User;
    modified_by: User;
  };
}
