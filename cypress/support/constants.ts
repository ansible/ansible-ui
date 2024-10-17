import { Repository } from '../../frontend/hub/administration/repositories/Repository';
import { HubNamespace } from '../../frontend/hub/namespaces/HubNamespace';
import { HubRemote } from '../../frontend/hub/administration/remotes/Remotes';
import { randomString } from '../../framework/utils/random-string';
import { ContentTypeEnum } from '../../frontend/hub/interfaces/expanded/ContentType';

export enum SERVER_NAME {
  PLATFORM_SERVER = 'Platform Server',
  AWX_SERVER = 'AWX Ansible Server',
  EDA_SERVER = 'Event Driven Automation Server',
  HUB_SERVER = 'Automation Hub',
  GALAXY_SERVER = 'Galaxy Server',
}

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

export enum UpgradeUserType {
  eda = 'eda',
  hubKeycloak = 'hubKeycloak',
  hubLegacy = 'hubLegacy',
  hubLdap = 'hubLdap',
  controllerLdap = 'controllerLdap',
  controllerSSO = 'controllerSSO',
  controllerLegacy = 'controllerLegacy',
}

export const usersForMigration: {
  [key in UpgradeUserType]: { username: string; password: string }[];
} = {
  eda: [
    {
      username: 'eda_test_user_1',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_2',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_3',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_4',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_5',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_6',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_7',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_8',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_9',
      password: 'ps12345678',
    },
    {
      username: 'eda_test_user_10',
      password: 'ps12345678',
    },
  ],
  hubKeycloak: [
    // {
    //   username: 'hub_ui_admin',
    //   password: 'Th1sP4ssd',
    // },
    // {
    //   username: 'hub_ui_user',
    //   password: 'Th1sP4ssd',
    // },
  ],
  hubLegacy: [
    {
      username: 'hub_ui_user_1',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_2',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_3',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_4',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_5',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_6',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_7',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_8',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_9',
      password: '12345678pw',
    },
    {
      username: 'hub_ui_user_10',
      password: '12345678pw',
    },
  ],
  hubLdap: [
    {
      username: 'awong',
      password: 'Th1sP4ssd',
    },
    {
      username: 'hfarnsworth',
      password: 'Th1sP4ssd',
    },
    {
      username: 'lobelcher',
      password: 'Th1sP4ssd',
    },
    {
      username: 'tleela',
      password: 'Th1sP4ssd',
    },
  ],
  controllerLdap: [
    {
      username: 'tower_1',
      password: 'Th1sP4ssd',
    },
    {
      username: 'hfarnsworth',
      password: 'Th1sP4ssd',
    },
    {
      username: 'lobelcher',
      password: 'Th1sP4ssd',
    },
  ],
  // controller sso
  controllerSSO: [],
  controllerLegacy: [
    {
      username: 'controller_ui_user_1',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_2',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_3',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_4',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_5',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_6',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_7',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_8',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_9',
      password: '12345678pw',
    },
    {
      username: 'controller_ui_user_10',
      password: '12345678pw',
    },
  ],
};
