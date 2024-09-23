export interface Account {
  ansible_id: string;
  gateway_username: string;
  original_username: string;
  service: number;
  service_type: 'controller' | 'hub' | 'eda';
  user: number;
}
export interface LegacyAuth {
  id: number;
  is_authenticated: boolean;
  is_migrated: boolean;
  username: string;
  linked_accounts: Account[];
  new_username?: string;
  aap_password?: string;
  allow_rename: boolean;
  needs_rename: boolean;
  allow_aap_password: boolean;
  needs_aap_password: boolean;
  is_sso_account: boolean;
}
