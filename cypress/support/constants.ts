import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { HubRemote } from '@ansible/hub-ui/administration/remotes/Remotes';
import { Repository } from '@ansible/hub-ui/administration/repositories/Repository';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';

export enum SERVER_NAME {
  PLATFORM_SERVER = 'Platform Server',
  AWX_SERVER = 'AWX Ansible Server',
  EDA_SERVER = 'Event Driven Automation Server',
  HUB_SERVER = 'Automation Hub',
  GALAXY_SERVER = 'Galaxy Server',
}

export const SAAS_URL: string = 'aws.ansiblecloud.com';
export const AZURE_URL: string = 'az.ansiblecloud.com';
export const OCP_A_URL: string = 'ocp4.testing.ansible.com';

export interface AccessTabResource {
  name: string;
  roles_tab_name: string;
  content_type: string;
  role: string;
}
export const user_team_access_tab_resources: AccessTabResource[] = [
  {
    name: 'projects',
    roles_tab_name: 'Project',
    content_type: 'eda.project',
    role: 'Project Admin',
  },
  {
    name: 'decision-environments',
    roles_tab_name: 'Decision Environment',
    content_type: 'eda.decision-environment',
    role: 'Decision Environment Admin',
  },
  {
    name: 'rulebook-activations',
    roles_tab_name: 'Activation',
    content_type: 'eda.activation',
    role: 'Activation Admin',
  },
  {
    name: 'credentials',
    roles_tab_name: 'Eda Credential',
    content_type: 'eda.edacredential',
    role: 'Eda Credential Admin',
  },
  {
    name: 'event-streams',
    roles_tab_name: 'Event Stream',
    content_type: 'eda.eventstream',
    role: 'Event Stream Use',
  },
];

const testSignature: string = randomString(5, undefined, { isLowercase: true });
function generateRemoteName(): string {
  return `test-${testSignature}-remote-${randomString(5, undefined, { isLowercase: true })}`;
}

type ResourceObjectHub = HubNamespace | Repository | HubRemote;

export interface HubResource {
  name: string;
  creation: (() => Cypress.Chainable<ResourceObjectHub>) | null;
  deletion: ((resourceObjectHub: ResourceObjectHub) => Cypress.Chainable<void>) | null;
  content_type: ContentTypeEnum;
  permission: string;
}

export const hub_resources_roles_tab: HubResource[] = [
  {
    name: 'Repository',
    creation: () => cy.createHubRepository() as Cypress.Chainable<ResourceObjectHub>,
    deletion: (resourceObjectHub) => cy.deleteHubRepository(resourceObjectHub as Repository),
    content_type: ContentTypeEnum.Repository,
    permission: 'galaxy.view_ansiblerepository',
  },
  {
    name: 'Remote',
    creation: () => cy.createRemote(generateRemoteName()) as Cypress.Chainable<ResourceObjectHub>,
    deletion: null,
    content_type: ContentTypeEnum.CollectionRemote,
    permission: 'galaxy.view_collectionremote',
  },
  {
    name: 'Namespace',
    creation: () => cy.createHubNamespace() as Cypress.Chainable<ResourceObjectHub>,
    deletion: (resourceObject) => cy.deleteHubNamespace(resourceObject as HubNamespace),
    content_type: ContentTypeEnum.Namespace,
    permission: 'galaxy.view_namespace',
  },
];

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
  ldap_user_password = 'password',
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
