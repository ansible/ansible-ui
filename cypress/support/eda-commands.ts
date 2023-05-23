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
import { EdaRole } from '../../frontend/eda/interfaces/EdaRole';
import { EdaRulebook } from '../../frontend/eda/interfaces/EdaRulebook';
import {
  EdaRulebookActivation,
  EdaRulebookActivationCreate,
} from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaUser, EdaUserCreateUpdate } from '../../frontend/eda/interfaces/EdaUser';
import {
  CredentialTypeEnum,
  RestartPolicyEnum,
} from '../../frontend/eda/interfaces/generated/eda-api';
import './auth';
import './commands';

/*  EDA related custom command implementation  */

Cypress.Commands.add('selectEdaUserRoleByName', (roleName: string) => {
  cy.get('button[aria-label="Options menu"]').click();
  cy.contains(roleName)
    .parents('td[data-label="Name"]')
    .prev()
    .within(() => {
      cy.get('input[type="checkbox"]').click();
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

Cypress.Commands.add('clickEdaPageAction', (label: string | RegExp) => {
  cy.get('.pf-c-toolbar__content-section')
    .eq(1)
    .within(() => {
      cy.get('.toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
    });
});

Cypress.Commands.add('edaRuleBookActivationActions', (action: string, rbaName: string) => {
  cy.contains('td[data-label="Name"]', rbaName)
    .parent()
    .within(() => {
      cy.get('button.toggle-kebab').click();
      cy.contains('a', action).click();
    });
});

Cypress.Commands.add('edaRuleBookActivationCheckbox', (rbaName: string) => {
  cy.contains('tr', rbaName).within(() => {
    cy.get('input[type=checkbox]').eq(0).click();
  });
});

Cypress.Commands.add('edaRuleBookActivationActionsModal', (action: string, rbaName: string) => {
  cy.get('div[role="dialog"]').within(() => {
    cy.get('.pf-c-check__label').should('contain', `Yes, I confirm that I want to ${action} these`);
    cy.get('a').should('contain', rbaName);
    cy.get('input[id="confirm"]').click();
    cy.get('button').contains('rulebookActivations').click();
  });
});

Cypress.Commands.add('createEdaProject', () => {
  cy.requestPost<EdaProject>('/api/eda/v1/projects/', {
    name: 'E2E Project ' + randomString(4),
    url: 'https://github.com/Alex-Izquierdo/eda-sample-project',
  }).then((edaProject) => {
    Cypress.log({
      displayName: 'EDA PROJECT CREATION :',
      message: [`Created 👉  ${edaProject.name}`],
    });
    return edaProject;
  });
});

Cypress.Commands.add('getEdaRulebooks', (edaProject, rulebookName?: string) => {
  let url = `/api/eda/v1/rulebooks/?project_id=${edaProject.id}`;
  if (rulebookName) url = url + `&name=${rulebookName}`;
  cy.pollEdaResults<EdaRulebook>(url).then((edaRulebooks) => {
    return edaRulebooks;
  });
});

Cypress.Commands.add(
  'createEdaRulebookActivation',
  (edaRulebookActivation: SetOptional<EdaRulebookActivationCreate, 'name'>) => {
    cy.requestPost<EdaRulebookActivation>(`/api/eda/v1/activations/`, {
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
    `/api/eda/v1/activations/?name=${edaRulebookActivationName}`
  ).then((activations) => {
    return activations[0];
  });
});

Cypress.Commands.add('deleteEdaRulebookActivation', (edaRulebookActivation) => {
  cy.requestDelete(`/api/eda/v1/activations/${edaRulebookActivation.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA RULEBOOK ACTIVATION DELETION :',
      message: [`Deleted 👉  ${edaRulebookActivation.name}`],
    });
  });
});

Cypress.Commands.add('waitEdaProjectSync', (edaProject) => {
  cy.requestGet<EdaResult<EdaProject>>(`/api/eda/v1/projects/?name=${edaProject.name}`).then(
    (result) => {
      if (Array.isArray(result?.results) && result.results.length === 1) {
        const project = result.results[0];
        if (project.import_state !== 'completed') {
          cy.wait(100).then(() => cy.waitEdaProjectSync(edaProject));
        } else {
          cy.wrap(project);
        }
      } else {
        cy.wait(100).then(() => cy.waitEdaProjectSync(edaProject));
      }
    }
  );
});

Cypress.Commands.add('getEdaProjects', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaProject>>(`/api/eda/v1/projects/?page=${page}&page_size=${perPage}`);
});

Cypress.Commands.add('getEdaDecisionEnvironments', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaDecisionEnvironment>>(
    `/api/eda/v1/decision-environments/?page=${page}&page_size=${perPage}`
  );
});

Cypress.Commands.add('getEdaRulebookActivations', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaRulebookActivation>>(
    `/api/eda/v1/activations/?page=${page}&page_size=${perPage}`
  );
});

Cypress.Commands.add('getEdaCredentials', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaCredential>>(
    `/api/eda/v1/credentials/?page=${page}&page_size=${perPage}`
  );
});

Cypress.Commands.add('getEdaUsers', (page: number, perPage: number) => {
  cy.requestGet<EdaResult<EdaUser>>(`/api/eda/v1/users/?page=${page}&page_size=${perPage}`);
});

Cypress.Commands.add('getEdaProjectByName', (edaProjectName: string) => {
  cy.requestGet<EdaResult<EdaProject>>(`/api/eda/v1/projects/?name=${edaProjectName}`).then(
    (result) => {
      if (Array.isArray(result?.results) && result.results.length === 1) {
        return result.results[0];
      } else {
        return undefined;
      }
    }
  );
});

Cypress.Commands.add('deleteEdaProject', (project: EdaProject) => {
  cy.waitEdaProjectSync(project);
  cy.requestDelete(`/api/eda/v1/projects/${project.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA PROJECT DELETION :',
      message: [`Deleted 👉  ${project.name}`],
    });
  });
});

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
  cy.requestPost<EdaCredentialCreate>('/api/eda/v1/credentials/', {
    name: 'E2E Credential ' + randomString(4),
    credential_type: CredentialTypeEnum.ContainerRegistry,
    secret: 'test token',
    description: 'This is a container registry credential',
    username: 'admin',
  }).then((edaCredential) => {
    Cypress.log({
      displayName: 'EDA CREDENTIAL CREATION :',
      message: [`Created 👉  ${edaCredential.name}`],
    });
    return edaCredential;
  });
});

Cypress.Commands.add('deleteEdaCredential', (credential: EdaCredential) => {
  cy.requestDelete(`/api/eda/v1/credentials/${credential.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA CREDENTIAL DELETION :',
      message: [`Deleted 👉  ${credential.name}`],
    });
  });
});

Cypress.Commands.add('getEdaCredentialByName', (edaCredentialName: string) => {
  cy.requestGet<EdaResult<EdaCredential>>(
    `/api/eda/v1/credentials/?name=${edaCredentialName}`
  ).then((result) => {
    if (Array.isArray(result?.results) && result.results.length === 1) {
      return result.results[0];
    } else {
      return undefined;
    }
  });
});

Cypress.Commands.add('getEdaRoles', () => {
  cy.requestGet<EdaResult<EdaRole>>('/api/eda/v1/roles/').then((response) => {
    const edaRoles = response.results;
    return edaRoles;
  });
});

Cypress.Commands.add(
  'createEdaUser',
  (user?: SetOptional<EdaUserCreateUpdate, 'username' | 'password'>) => {
    cy.requestPost<EdaUser, SetOptional<EdaUserCreateUpdate, 'username' | 'password'>>(
      `/api/eda/v1/users/`,
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
  cy.requestDelete(`/api/eda/v1/users/${user.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA USER DELETION :',
      message: [`Deleted 👉  ${user.username}`],
    });
  });
});

Cypress.Commands.add('getEdaActiveUser', () => {
  cy.requestGet<EdaResult<EdaUser>>(`/api/eda/v1/users/me/`).then((response) => {
    if (Array.isArray(response?.results) && response?.results.length > 1) {
      Cypress.log({
        displayName: 'EDA USER ROLE:',
        message: [response?.results[0].roles[0].name],
      });
      return response?.results[0];
    } else {
      return undefined;
    }
  });
});

Cypress.Commands.add('getEdaCurrentUserAwxTokens', () => {
  cy.requestGet<EdaResult<EdaControllerToken>>(`/api/eda/v1/users/me/awx-tokens/`);
});

Cypress.Commands.add('addEdaCurrentUserAwxToken', (awxToken: string) => {
  cy.requestPost<EdaControllerTokenCreate>(`/api/eda/v1/users/me/awx-tokens/`, {
    name: 'AWX Token ' + randomString(4),
    token: awxToken,
  });
});

Cypress.Commands.add('deleteEdaCurrentUserAwxToken', (awxToken: EdaControllerToken) => {
  cy.requestDelete(`/api/eda/v1/users/me/awx-tokens/${awxToken.id}/`, true).then(() => {
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
  cy.request<EdaResult<EdaControllerToken>>('/api/eda/v1/users/me/awx-tokens/').then((response) => {
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
  cy.requestPost<EdaDecisionEnvironment>('/api/eda/v1/decision-environments/', {
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
    `/api/eda/v1/decision-environments/?name=${edaDEName}`
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
  (decisionEnvironment: EdaDecisionEnvironment) => {
    //cy.waitEdaDESync(decisionEnvironment);
    cy.requestDelete(`/api/eda/v1/decision-environments/${decisionEnvironment.id}/`, true).then(
      () => {
        Cypress.log({
          displayName: 'EDA DECISION ENVIRONMENT DELETION :',
          message: [`Deleted 👉  ${decisionEnvironment.name}`],
        });
      }
    );
  }
);

/*
  Cypress.Commands.add('waitEdaDESync', (decisionEnvironment) => {
    cy.requestGet<EdaResult<EdaDecisionEnvironment>>(
      `/api/eda/v1/decision-environments/?name=${decisionEnvironment.name}`
    ).then((result) => {
      if (Array.isArray(result?.results) && result.results.length === 1) {
        const project = result.results[0];
        if (project.import_state !== 'completed') {
          cy.wait(100).then(() => cy.waitEdaDESync(decisionEnvironment));
        } else {
          cy.wrap(project);
        }
      } else {
        cy.wait(100).then(() => cy.waitEdaDESync(decisionEnvironment));
      }
    });
  });
  */
