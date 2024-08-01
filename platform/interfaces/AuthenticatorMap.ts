import type { Authenticator } from './Authenticator';
import type { PlatformUser } from './PlatformUser';

export enum AuthenticatorMapType {
  'allow' = 'allow',
  'organization' = 'organization',
  'team' = 'team',
  'role' = 'role',
  'is_superuser' = 'is_superuser',
}

export interface AlwaysTriggers {
  always: Record<string, never>;
}
export interface NeverTriggers {
  never: Record<string, never>;
}
export interface GroupsTriggers {
  groups: { has_or: string[] } | { has_and: string[] };
}
export interface AttributesTriggers {
  attributes: {
    join_condition: 'and' | 'or';
    [criteria: string]:
      | 'and'
      | 'or'
      | { contains: string }
      | { matches: string }
      | { ends_with: string }
      | { equals: string }
      | { in: string[] };
  };
}
export type AuthenticatorMapTriggers =
  | AlwaysTriggers
  | NeverTriggers
  | GroupsTriggers
  | AttributesTriggers;

export interface AuthenticatorMap {
  name: string;
  id: number;
  url: string;
  created: string;
  created_by?: number;
  modified: string;
  modified_by?: number;
  related: {
    [key: string]: string;
  };
  authenticator: number;
  order: number;
  organization: string;
  role: string;
  team?: string;
  revoke: boolean;
  triggers: AuthenticatorMapTriggers;
  map_type: AuthenticatorMapType;
  ui_summary?: string;
  summary_fields: {
    created_by: PlatformUser;
    modified_by: PlatformUser;
    authenticator: Pick<Authenticator, 'id' | 'name'>;
  };
}
