import { EdaCredential } from '../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaRulebookActivation } from '../../frontend/eda/interfaces/EdaRulebookActivation';

export enum SERVER_NAME {
  AWX_SERVER = 'AWX Ansible Server',
  EDA_SERVER = 'Event Driven Automation Server',
  HUB_SERVER = 'Automation Hub',
  GALAXY_SERVER = 'Galaxy Server',
}

type ResourceObject = EdaProject | EdaDecisionEnvironment | EdaRulebookActivation | EdaCredential;

export interface AccessTabResource {
  name: string;
  roles_tab_name: string;
  content_type: string;
  creation: (() => Cypress.Chainable<ResourceObject>) | null;
  deletion: (resourceObject: ResourceObject) => Cypress.Chainable<void>;
  role: string;
}
export const user_team_access_tab_resources: AccessTabResource[] = [
  {
    name: 'projects',
    roles_tab_name: 'Project',
    content_type: 'eda.project',
    creation: () => cy.createEdaProject() as Cypress.Chainable<ResourceObject>,
    deletion: (resourceObject) => cy.deleteEdaProject(resourceObject as EdaProject),
    role: 'Project Admin',
  },
  {
    name: 'decision-environments',
    roles_tab_name: 'Decision Environment',
    content_type: 'eda.decision-environment',
    creation: () => cy.createEdaDecisionEnvironment() as Cypress.Chainable<ResourceObject>,
    deletion: (resourceObject) =>
      cy.deleteEdaDecisionEnvironment(resourceObject as EdaDecisionEnvironment),
    role: 'Decision Environment Admin',
  },
  {
    name: 'rulebook-activations',
    roles_tab_name: 'Activation',
    content_type: 'eda.activation',
    creation: null,
    deletion: (resourceObject) =>
      cy.deleteEdaRulebookActivation(resourceObject as EdaRulebookActivation),
    role: 'Activation Admin',
  },
  {
    name: 'credentials',
    roles_tab_name: 'Eda Credential',
    content_type: 'eda.edacredential',
    creation: () => cy.createEdaCredential() as Cypress.Chainable<ResourceObject>,
    deletion: (resourceObject) => cy.deleteEdaCredential(resourceObject as EdaCredential),
    role: 'Eda Credential Admin',
  },
];
