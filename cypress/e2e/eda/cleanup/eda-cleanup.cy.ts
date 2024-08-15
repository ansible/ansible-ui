import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';
import { EdaResult } from '../../../../frontend/eda/interfaces/EdaResult';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { tag } from '../../../support/tag';

tag(['aaas-unsupported'], function () {
  function isOldResource(prefix: string, resource: { name?: string; created_at?: string }) {
    if (!resource.name) return false;
    if (!resource.name.startsWith(prefix)) return false;

    if (!resource.created_at) return false;
    const created = new Date(resource.created_at);
    const beforeTime = new Date(Date.now() - 10 * 60 * 1000);

    return created < beforeTime;
  }

  describe('EDA Cleanup', () => {
    it('cleanup old admin awx tokens', () => {
      cy.request<EdaResult<EdaControllerToken>>(edaAPI`/users/me/awx-tokens/`).then((response) => {
        const tokens = response.body.results;
        for (const token of tokens ?? []) {
          if (isOldResource('E2E Token', token)) {
            cy.deleteEdaCurrentUserAwxToken(token);
          }
          if (isOldResource('AWX Token', token)) {
            cy.deleteEdaCurrentUserAwxToken(token);
          }
        }
      });
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

    it('cleanup old eda credentials and types', () => {
      cy.getEdaCredentials(1, 100).then((result) => {
        for (const resource of result.results ?? []) {
          if (isOldResource('E2E Credential', resource)) {
            cy.deleteEdaCredential(resource);
          }
        }
      });

      cy.getEdaCredentialTypes(1, 100).then((result) => {
        for (const resource of result.results ?? []) {
          if (isOldResource('E2E Credential Type', resource)) {
            cy.deleteEdaCredentialType(resource);
          }
        }
      });
    });

    it('cleanup old eda users', () => {
      cy.getEdaUsers(1, 100).then((result) => {
        for (const user of result.results ?? []) {
          cy.getEdaUser(user.id).then((user) => {
            if (user.username.startsWith('E2EUser')) {
              if (new Date(user.created_at) < new Date(Date.now() - 10 * 60 * 1000)) {
                cy.deleteEdaUser(user);
              }
            }
          });
        }
      });
    });
  });
});
