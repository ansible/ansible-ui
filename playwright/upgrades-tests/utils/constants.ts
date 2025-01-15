export const upgrade_users_list = [
  'controller_ui_user_1',
  'controller_ui_user_2',
  'controller_ui_user_3',
  'controller_ui_user_4',
  'controller_ui_user_5',
  'controller_ui_user_6',
  'controller_ui_user_7',
  'controller_ui_user_8',
  'controller_ui_user_9',
  'controller_ui_user_10',
  'hub_ui_user_1',
  'hub_ui_user_2',
  'hub_ui_user_3',
  'hub_ui_user_4',
  'hub_ui_user_5',
  'hub_ui_user_6',
  'hub_ui_user_7',
  'hub_ui_user_8',
  'hub_ui_user_9',
  'hub_ui_user_10',
  'hub_keycloak_ui_user_1',
  'hub_keycloak_ui_user_2',
  'hub_keycloak_ui_user_3',
  'ctlr_oidc_ui_user_1',
  'ctlr_oidc_ui_user_2',
  'ctlr_oidc_ui_user_3',
  'ctlr_saml_ui_user_1',
  'ctlr_saml_ui_user_2',
  'ctlr_saml_ui_user_3',
];

export enum passwords {
  local_user_password = '12345678pw',
  sso_user_password = 'unpriv123',
  ldap_user_password = 'Th1sP4ssd',
}

export enum UpgradeUserType {
  hubKeycloak = 'hubKeycloak',
  hubLegacy = 'hubLegacy',
  hubLdap = 'hubLdap',
  controllerLdap = 'controllerLdap',
  controllerOIDC = 'controllerOIDC',
  controllerSAML = 'controllerSAML',
  controllerLegacy = 'controllerLegacy',
}

export const usersForMigration: {
  [key in UpgradeUserType]: { username: string; password: string }[];
} = {
  controllerLegacy: upgrade_users_list
    .filter((username) => username.includes('controller_ui_user_'))
    .map((username) => ({
      username,
      password: passwords.local_user_password,
    })),
  hubLegacy: upgrade_users_list
    .filter((username) => username.includes('hub_ui_user_'))
    .map((username) => ({
      username,
      password: passwords.local_user_password,
    })),
  controllerOIDC: upgrade_users_list
    .filter((username) => username.includes('ctlr_oidc_ui_user_'))
    .map((username) => ({
      username,
      password: passwords.sso_user_password,
    })),
  controllerSAML: upgrade_users_list
    .filter((username) => username.includes('ctlr_saml_ui_user_'))
    .map((username) => ({
      username,
      password: passwords.sso_user_password,
    })),
  hubKeycloak: upgrade_users_list
    .filter((username) => username.includes('hub_keycloak_ui_user_'))
    .map((username) => ({
      username,
      password: passwords.sso_user_password,
    })),
  controllerLdap: [
    {
      username: 'tower_all',
      password: passwords.ldap_user_password,
    },
    {
      username: 'tower_1',
      password: passwords.ldap_user_password,
    },
    {
      username: 'saml_user',
      password: passwords.ldap_user_password,
    },
    {
      username: 'gbelcher',
      password: passwords.ldap_user_password,
    },
  ],
  hubLdap: [
    {
      username: 'lobelcher',
      password: passwords.ldap_user_password,
    },
    {
      username: 'hfarnsworth',
      password: passwords.ldap_user_password,
    },
    {
      username: 'tleela',
      password: passwords.ldap_user_password,
    },
    {
      username: 'awong',
      password: passwords.ldap_user_password,
    },
  ],
};
