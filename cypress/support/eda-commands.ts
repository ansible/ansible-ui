import { SetOptional } from 'type-fest';
import { randomString } from '../../framework/utils/random-string';
import {
  EdaControllerToken,
  EdaControllerTokenCreate,
} from '../../frontend/eda/interfaces/EdaControllerToken';
import { EdaCredential, EdaCredentialCreate } from '../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaResult } from '../../frontend/eda/interfaces/EdaResult';
import { EdaRole, RoleDetail } from '../../frontend/eda/interfaces/EdaRole';
import { EdaRulebook } from '../../frontend/eda/interfaces/EdaRulebook';
import {
  EdaRulebookActivation,
  EdaRulebookActivationCreate,
} from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaUser, EdaUserCreateUpdate } from '../../frontend/eda/interfaces/EdaUser';
import {
  ImportStateEnum,
  RestartPolicyEnum,
  StatusEnum,
} from '../../frontend/eda/interfaces/generated/eda-api';
import { edaAPI } from './formatApiPathForEDA';

/*  EDA related custom command implementation  */

Cypress.Commands.add('selectEdaUserRoleByName', (roleName: string) => {
  cy.get('button#roles:not(:disabled):not(:hidden)').click();
  cy.get('#roles-select').within(() => {
    cy.get(`[data-cy="${roleName.toLowerCase()}"]`).click();
  });
});

Cypress.Commands.add('checkAnchorLinks', (anchorName: string) => {
  cy.contains('a', anchorName).then((link) => {
    cy.request({
      method: 'GET',
      url: link.prop('href') as string,
    })
      .its('status')
      .should('eq', 200);
  });
});

Cypress.Commands.add('edaRuleBookActivationCheckbox', (rbaName: string) => {
  cy.contains('tr', rbaName).within(() => {
    cy.get('input[type=checkbox]').eq(0).click();
  });
});

Cypress.Commands.add('edaRuleBookActivationActionsModal', (action: string, rbaName: string) => {
  cy.get('div[role="dialog"]').within(() => {
    cy.get('.pf-v5-c-check__label').should(
      'contain',
      `Yes, I confirm that I want to ${action} these`
    );
    cy.get('a').should('contain', rbaName);
    cy.get('input[id="confirm"]').click();
  });
});

Cypress.Commands.add('createEdaProject', () => {
  cy.requestPost<EdaProject>(edaAPI`/projects/`, {
    name: 'E2E Project ' + randomString(4),
    url: 'https://github.com/ansible/ansible-ui',
  }).then((edaProject) => {
    Cypress.log({
      displayName: 'EDA PROJECT CREATION :',
      message: [`Created 👉  ${edaProject.name}`],
    });
  });
});

Cypress.Commands.add('getEdaRulebooks', (edaProject, rulebookName?: string) => {
  let url = edaAPI`/rulebooks/?project_id=${edaProject.id.toString()}`;
  if (rulebookName) url = url + `&name=${rulebookName}`;
  cy.pollEdaResults<EdaRulebook>(url).then((edaRulebooks) => {
    return edaRulebooks;
  });
});

Cypress.Commands.add(
  'createEdaRulebookActivation',
  (edaRulebookActivation: SetOptional<EdaRulebookActivationCreate, 'name'>) => {
    cy.requestPost<EdaRulebookActivationCreate>(edaAPI`/activations/`, {
      name: 'E2E Rulebook Activation ' + randomString(5),
      restart_policy: RestartPolicyEnum.OnFailure,
      ...edaRulebookActivation,
    }).then((edaRulebookActivation) => {
      cy.wrap(edaRulebookActivation)
        .should('not.be.undefined')
        .then(() => {
          Cypress.log({
            displayName: 'EDA RULEBOOK ACTIVATIONS CREATION :',
            message: [`Created 👉  ${edaRulebookActivation.name}`],
          });
          return edaRulebookActivation;
        });
    });
  }
);

Cypress.Commands.add('getEdaRulebookActivation', (edaRulebookActivationName: string) => {
  cy.pollEdaResults<EdaRulebookActivation>(
    edaAPI`/activations/?name=${edaRulebookActivationName}`
  ).then((activations) => {
    return activations[0];
  });
});

Cypress.Commands.add('deleteEdaRulebookActivation', (edaRulebookActivation) => {
  cy.requestDelete(edaAPI`/activations/${edaRulebookActivation.id.toString()}/`, {
    failOnStatusCode: false,
  }).then(() => {
    Cypress.log({
      displayName: 'EDA RULEBOOK ACTIVATION DELETION :',
      message: [`Deleted 👉  ${edaRulebookActivation.name}`],
    });
  });
});

Cypress.Commands.add(
  'waitForRulebookActionStatus',
  (edaRulebookActivation: EdaRulebookActivation) => {
    cy.requestGet<EdaRulebookActivation>(
      edaAPI`/activations/${edaRulebookActivation.id.toString()}`
    ).then((rba) => {
      switch (rba.status) {
        case StatusEnum.Failed:
        case StatusEnum.Completed:
          cy.wrap(rba);
          break;
        default:
          cy.wait(100).then(() => cy.waitForRulebookActionStatus(edaRulebookActivation));
          break;
      }
    });
  }
);

Cypress.Commands.add('waitEdaProjectSync', (edaProject) => {
  Cypress.log({
    displayName: 'EDA PROJECT IS',
    message: ['WAITING TO FINISH SYNCING...🕓'],
  });
  cy.requestGet<EdaResult<EdaProject>>(edaAPI`/projects/?name=${edaProject.name}`).then(
    (result) => {
      if (Array.isArray(result?.results) && result.results.length === 1) {
        const project = result.results[0];
        if (project.import_state !== ImportStateEnum.Completed) {
          Cypress.log({
            displayName: 'PROJECT SYNC STATUS IS NOW : 👉 ',
            message: [`${project.import_state}`],
          });
          cy.wait(100).then(() => cy.waitEdaProjectSync(edaProject));
        } else {
          Cypress.log({
            displayName: 'PROJECT SYNC STATUS IS NOW : 👉 ',
            message: [`${project.import_state}`],
          });
          cy.wrap(project);
        }
      } else {
        cy.wait(100).then(() => cy.waitEdaProjectSync(edaProject));
      }
    }
  );
});

Cypress.Commands.add('getEdaProjects', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaProject>>(
    edaAPI`/projects/?page=${page.toString()}&page_size=${perPage.toString()}`
  );
});

Cypress.Commands.add('getEdaDecisionEnvironments', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaDecisionEnvironment>>(
    edaAPI`/decision-environments/?page=${page.toString()}&page_size=${perPage.toString()}`
  );
});

Cypress.Commands.add('getEdaRulebookActivations', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaRulebookActivation>>(
    edaAPI`/activations/?page=${page.toString()}&page_size=${perPage.toString()}`
  );
});

Cypress.Commands.add('getEdaCredentials', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/?page=${page.toString()}&page_size=${perPage.toString()}`
  );
});

Cypress.Commands.add('getEdaUsers', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaUser>>(
    edaAPI`/users/?page=${page.toString()}&page_size=${perPage.toString()}`
  );
});

Cypress.Commands.add('getEdaUser', (id: number) => {
  cy.requestGet<EdaResult<EdaUser>>(edaAPI`/users/${id.toString()}/`);
});

Cypress.Commands.add('getEdaProjectByName', (edaProjectName: string) => {
  cy.requestGet<EdaResult<EdaProject>>(edaAPI`/projects/?name=${edaProjectName}`).then((result) => {
    if (Array.isArray(result?.results) && result.results.length === 1) {
      return result.results[0];
    } else {
      return undefined;
    }
  });
});

Cypress.Commands.add(
  'deleteEdaProject',
  (
    project: EdaProject,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    // this is just cleanup, so we don't care if the sync fails
    cy.requestDelete(edaAPI`/projects/${project.id.toString()}/`, options).then(() => {
      Cypress.log({
        displayName: 'EDA PROJECT DELETION :',
        message: [`Deleted 👉  ${project.name}`],
      });
    });
  }
);

Cypress.Commands.add('pollEdaResults', (url: string) => {
  cy.requestGet<EdaResult<unknown>>(url).then((result) => {
    if (Array.isArray(result?.results) && result.results.length > 0) {
      cy.log('RESULTS', result.results.length);
      cy.wrap(result.results);
    } else {
      cy.wait(100).then(() => cy.pollEdaResults(url));
    }
  });
});

Cypress.Commands.add('createEdaCredential', () => {
  cy.requestPost<EdaCredentialCreate>(edaAPI`/credentials/`, {
    name: 'E2E Credential ' + randomString(4),
    credential_type_id: 1,
    description: 'This is a container registry credential',
  }).then((edaCredential) => {
    Cypress.log({
      displayName: 'EDA CREDENTIAL CREATION :',
      message: [`Created 👉  ${edaCredential.name}`],
    });
    return edaCredential;
  });
});

Cypress.Commands.add('deleteEdaCredential', (credential: EdaCredential) => {
  cy.requestDelete(edaAPI`/credentials/${credential.id.toString()}/?force=true`, {
    failOnStatusCode: false,
  }).then(() => {
    Cypress.log({
      displayName: 'EDA CREDENTIAL DELETION :',
      message: [`Deleted 👉  ${credential.name}`],
    });
  });
});

Cypress.Commands.add('getEdaCredentialByName', (edaCredentialName: string) => {
  cy.requestGet<EdaResult<EdaCredential>>(edaAPI`/credentials/?name=${edaCredentialName}`).then(
    (result) => {
      if (Array.isArray(result?.results) && result.results.length === 1) {
        return result.results[0];
      } else {
        return undefined;
      }
    }
  );
});

// Updated to use new /role_definitions endpoint for EDA RBAC
Cypress.Commands.add('getEdaRoles', (content_type__model?: string) => {
  const roleDefinitionsUrl = content_type__model
    ? edaAPI`/role_definitions?content_type__model=${content_type__model}`
    : edaAPI`/role_definitions/`;
  cy.requestGet<EdaResult<EdaRole>>(roleDefinitionsUrl).then((response) => {
    const edaRoles = response.results;
    return edaRoles;
  });
});

Cypress.Commands.add('checkActionsofResource', (resourceType: string) => {
  return cy
    .contains('[data-cy="permissions"]', resourceType)
    .next()
    .then((result) => {
      cy.wrap(result);
    });
});

Cypress.Commands.add('checkResourceNameAndAction', (resourceTypes: string[], actions: string[]) => {
  resourceTypes.forEach((resource) => {
    cy.contains('[data-cy="permissions"]', resource)
      .next()
      .within(() => {
        actions.forEach((action) => {
          cy.contains(action);
        });
      });
  });
});

Cypress.Commands.add('getEdaRoleDetail', (roleID: string) => {
  cy.requestGet<RoleDetail>(edaAPI`/role_definitions/${roleID}`);
});

Cypress.Commands.add(
  'createEdaUser',
  (user?: SetOptional<EdaUserCreateUpdate, 'username' | 'password'>) => {
    cy.requestPost<EdaUser, SetOptional<EdaUserCreateUpdate, 'username' | 'password'>>(
      edaAPI`/users/`,
      {
        username: `E2EUser${randomString(4)}`,
        password: `${randomString(4)}`,
        ...user,
      }
    ).then((edaUser) => {
      Cypress.log({
        displayName: 'EDA USER CREATION :',
        message: [`Created 👉  ${edaUser.username}`],
      });
      return edaUser;
    });
  }
);

Cypress.Commands.add('deleteEdaUser', (user: EdaUser) => {
  cy.wrap(user).should('not.be.undefined');
  cy.wrap(user.id).should('not.equal', 1);
  if (user.id === 1) return; // DO NOT DELETE ADMIN USER
  cy.requestDelete(edaAPI`/users/${user.id.toString()}/`, {
    failOnStatusCode: false,
  }).then(() => {
    Cypress.log({
      displayName: 'EDA USER DELETION :',
      message: [`Deleted 👉  ${user.username}`],
    });
  });
});

Cypress.Commands.add('getEdaActiveUser', () => {
  cy.requestGet<EdaResult<EdaUser>>(edaAPI`/users/me/`).then((response) => {
    if (Array.isArray(response?.results) && response?.results.length > 1) {
      Cypress.log({
        displayName: 'Username:',
        message: [response?.results[0].username],
      });
      return response?.results[0];
    } else {
      return undefined;
    }
  });
});

Cypress.Commands.add('getEdaCurrentUserAwxTokens', () => {
  cy.requestGet<EdaResult<EdaControllerToken>>(edaAPI`/users/me/awx-tokens/`);
});

Cypress.Commands.add('ensureEdaCurrentUserAwxToken', () => {
  cy.getEdaCurrentUserAwxTokens().then((result) => {
    switch (result.count) {
      case 0:
        cy.log(`TOKEN COUNT = ${result.count}, CREATES NEW TOKEN`);
        cy.addEdaCurrentUserAwxToken('testtoken');
        break;
      case 1:
        // Do nothing - token exists
        cy.log('TOKEN exists, skipping');
        break;
      case 2:
        cy.log('DELETES token');
        for (const token of result.results?.slice(1) ?? []) {
          cy.deleteEdaCurrentUserAwxToken(token);
        }
        break;
    }
  });
});

Cypress.Commands.add('addEdaCurrentUserAwxToken', (awxToken: string) => {
  cy.requestPost<EdaControllerTokenCreate>(edaAPI`/users/me/awx-tokens/`, {
    name: 'AWX Token ' + randomString(4),
    token: awxToken,
  });
});

Cypress.Commands.add('deleteEdaCurrentUserAwxToken', (awxToken: EdaControllerToken) => {
  cy.requestDelete(edaAPI`/users/me/awx-tokens/${awxToken.id.toString()}/`, {
    failOnStatusCode: false,
  }).then(() => {
    Cypress.log({
      displayName: 'EDA CONTROLLER TOKEN DELETION :',
      message: [awxToken.name],
    });
  });
});

function isOldResource(prefix: string, resource: { name?: string; created_at?: string }) {
  if (!resource.name) return false;
  if (!resource.name.startsWith(prefix)) return false;

  if (!resource.created_at) return false;
  const created = new Date(resource.created_at);
  const beforeTime = new Date(Date.now());

  return created < beforeTime;
}

Cypress.Commands.add('deleteAllEdaCurrentUserTokens', () => {
  cy.request<EdaResult<EdaControllerToken>>(edaAPI`/users/me/awx-tokens/`).then((response) => {
    const tokens = response.body.results;
    for (const token of tokens ?? []) {
      if (isOldResource('E2E Token', token)) {
        cy.deleteEdaCurrentUserAwxToken(token);
      }
      if (isOldResource('AWX ', token)) {
        cy.deleteEdaCurrentUserAwxToken(token);
      }
    }
  });
});

Cypress.Commands.add('createEdaDecisionEnvironment', () => {
  cy.requestPost<EdaDecisionEnvironment>(edaAPI`/decision-environments/`, {
    name: 'E2E Decision Environment ' + randomString(4),
    image_url: 'quay.io/ansible/ansible-rulebook:main',
  }).then((edaDE) => {
    Cypress.log({
      displayName: 'EDA DECISION CREATION :',
      message: [`Created 👉  ${edaDE.name}`],
    });
    return edaDE;
  });
});

Cypress.Commands.add('getEdaDecisionEnvironmentByName', (edaDEName: string) => {
  cy.requestGet<EdaResult<EdaDecisionEnvironment>>(
    edaAPI`/decision-environments/?name=${edaDEName}`
  ).then((result) => {
    if (Array.isArray(result?.results) && result.results.length === 1) {
      return result.results[0];
    } else {
      return undefined;
    }
  });
});

Cypress.Commands.add(
  'deleteEdaDecisionEnvironment',
  (
    decisionEnvironment: EdaDecisionEnvironment,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(
      edaAPI`/decision-environments/${decisionEnvironment.id.toString()}/?force=true`,
      options
    ).then(() => {
      Cypress.log({
        displayName: 'EDA DECISION ENVIRONMENT DELETION :',
        message: [`Deleted 👉  ${decisionEnvironment.name}`],
      });
    });
  }
);
