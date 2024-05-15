import { EdaCredential } from '../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaRulebookActivation } from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaCredentialType } from '../../frontend/eda/interfaces/EdaCredentialType';

export enum SERVER_NAME {
  PLATFORM_SERVER = 'Platform Server',
  AWX_SERVER = 'AWX Ansible Server',
  EDA_SERVER = 'Event Driven Automation Server',
  HUB_SERVER = 'Automation Hub',
  GALAXY_SERVER = 'Galaxy Server',
}

type ResourceObject =
  | EdaProject
  | EdaDecisionEnvironment
  | EdaRulebookActivation
  | EdaCredential
  | EdaCredentialType;

export interface AccessTabResource {
  name: string;
  content_type: string;
  creation: (() => Cypress.Chainable<ResourceObject>) | null;
  deletion: (resourceObject: ResourceObject) => Cypress.Chainable<void>;
  role: string;
}
export const user_team_access_tab_resources: AccessTabResource[] = [
  {
    name: 'projects',
    content_type: 'eda.project',
    creation: () => cy.createEdaProject() as Cypress.Chainable<ResourceObject>,
    deletion: (resourceObject) => cy.deleteEdaProject(resourceObject as EdaProject),
    role: 'Project Admin',
  },
  {
    name: 'decision-environments',
    content_type: 'eda.project',
    creation: () => cy.createEdaDecisionEnvironment() as Cypress.Chainable<ResourceObject>,
    deletion: (resourceObject) =>
      cy.deleteEdaDecisionEnvironment(resourceObject as EdaDecisionEnvironment),
    role: 'Decision Environment Admin',
  },
  {
    name: 'rulebook-activations',
    content_type: 'eda.activation',
    creation: null,
    deletion: (resourceObject) =>
      cy.deleteEdaRulebookActivation(resourceObject as EdaRulebookActivation),
    role: 'Activation Admin',
  },
  {
    name: 'credentials',
    content_type: 'eda.edacredential',
    creation: () => cy.createEdaCredential() as Cypress.Chainable<ResourceObject>,
    deletion: (resourceObject) => cy.deleteEdaCredential(resourceObject as EdaCredential),
    role: 'Eda Credential Admin',
  },
  {
    name: 'credential-types',
    content_type: 'eda.credentialtype',
    creation: () => cy.createEdaCredentialType() as Cypress.Chainable<ResourceObject>,
    deletion: (resourceObject) => cy.deleteEdaCredentialType(resourceObject as EdaCredentialType),
    role: 'Credential Type Admin',
  },
];
