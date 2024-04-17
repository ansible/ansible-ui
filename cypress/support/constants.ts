export enum SERVER_NAME {
  AWX_SERVER = 'AWX Ansible Server',
  EDA_SERVER = 'Event Driven Automation Server',
  HUB_SERVER = 'Automation Hub',
  GALAXY_SERVER = 'Galaxy Server',
}

export const user_team_access_tab_resources = [
  {
    name: 'projects',
    content_type: 'eda.project',
    creation: cy.createEdaProject,
    deletion: cy.deleteEdaProject,
    role: 'Project Admin',
  },
  {
    name: 'decision-environments',
    content_type: 'eda.project',
    creation: cy.createEdaDecisionEnvironment,
    deletion: cy.deleteEdaDecisionEnvironment,
    role: 'Decision Environment Admin',
  },
  {
    name: 'rulebook-activations',
    content_type: 'eda.activation',
    creation: cy.createEdaRulebookActivation,
    deletion: cy.deleteEdaRulebookActivation,
    role: 'Activation Admin',
  },
  {
    name: 'credentials',
    content_type: 'eda.edacredential',
    creation: cy.createEdaCredential,
    deletion: cy.deleteEdaCredential,
    role: 'Eda Credential Admin',
  },
  {
    name: 'credential-types',
    content_type: 'eda.credentialtype',
    creation: cy.createEdaCredentialType,
    deletion: cy.deleteEdaCredentialType,
    role: 'Credential Type Admin',
  },
];
