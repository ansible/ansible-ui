import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';
import { EdaResult } from '../../../../frontend/eda/interfaces/EdaResult';

function isOldResource(prefix: string, resource: { name?: string; created_at?: string }) {
  const beforeTime = new Date(
    Date.now() - (30 + new Date().getTimezoneOffset()) * 60 * 60 * 1000
  ).toLocaleString();
  if (!resource.created_at || resource.created_at > beforeTime) return false;
  if (resource.name && resource.name.startsWith(prefix)) {
    return true;
  }
  return false;
}

describe('EDA Cleanup', () => {
  before(() => cy.edaLogin());

  it('cleanup old admin awx tokens', () => {
    cy.request<EdaResult<EdaControllerToken>>('/api/eda/v1/users/me/awx-tokens/').then(
      (response) => {
        const tokens = response.body.results;
        for (const token of tokens ?? []) {
          if (isOldResource('E2E Token', token)) {
            cy.deleteEdaCurrentUserAwxToken(token);
          }
          if (isOldResource('AWX Token', token)) {
            cy.deleteEdaCurrentUserAwxToken(token);
          }
        }
      }
    );
  });

  it('cleanup old eda projects', () => {
    cy.getEdaProjects(1, 100).then((result) => {
      for (const resource of result.results ?? []) {
        if (isOldResource('E2E Project', resource)) {
          cy.deleteEdaProject(resource);
        }
      }
    });
  });

  it('cleanup old eda decision environments', () => {
    cy.getEdaDecisionEnvironments(1, 100).then((result) => {
      for (const resource of result.results ?? []) {
        if (isOldResource('E2E Decision Environment', resource)) {
          cy.deleteEdaDecisionEnvironment(resource);
        }
      }
    });
  });

  it('cleanup old eda rulebook activations', () => {
    cy.getEdaRulebookActivations(1, 100).then((result) => {
      for (const resource of result.results ?? []) {
        if (isOldResource('E2E Rulebook Activation', resource)) {
          cy.deleteEdaRulebookActivation(resource);
        }
      }
    });
  });

  it('cleanup old eda credentials', () => {
    cy.getEdaCredentials(1, 100).then((result) => {
      for (const resource of result.results ?? []) {
        if (isOldResource('E2E Credential', resource)) {
          cy.deleteEdaCredential(resource);
        }
      }
    });
  });

  it('cleanup old eda users', () => {
    cy.getEdaUsers(1, 100).then((result) => {
      for (const resource of result.results ?? []) {
        if (isOldResource('E2EUser', resource)) {
          cy.deleteEdaUser(resource);
        }
      }
    });
  });
});
