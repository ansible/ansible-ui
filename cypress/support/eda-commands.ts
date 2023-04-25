import { EdaCredential } from '../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaResult } from '../../frontend/eda/interfaces/EdaResult';
import { EdaRulebook } from '../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaUser } from '../../frontend/eda/interfaces/EdaUser';
import { SetOptional } from 'type-fest';
import { randomString } from '../../framework/utils/random-string';
import './rest-commands';
import './commands';
import './auth';

/*  EDA related custom command implementation  */

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

Cypress.Commands.add('edaRuleBookActivationActions', (action: string, rbaName: string) => {
  cy.contains('td[data-label="Name"]', rbaName)
    .parent()
    .within(() => {
      cy.get('button.toggle-kebab').click();
      cy.contains('a', action).click();
    });
});

Cypress.Commands.add('edaRuleBookActivationActionsModal', (action: string, rbaName: string) => {
  cy.get('div[role="dialog"]').within(() => {
    cy.contains('h1', `${action} activation`).should('be.visible');
    cy.contains('p', `Are you sure you want to ${action} the rulebook activation below?`, {
      matchCase: false,
    }).should('be.visible');
    cy.contains('p', rbaName).should('be.visible');
    cy.contains('button#confirm', action).click();
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

Cypress.Commands.add('getEdaRulebooks', (_edaProject) => {
  // TODO: Once the API supports it, only get rulebooks for the project
  // Sometimes it takes a while for the rulebooks to be created.
  // Poll for EdaRulebooks until some are found.
  cy.pollEdaResults<EdaRulebook>('/api/eda/v1/rulebooks/').then((edaRulebooks) => {
    return edaRulebooks;
  });
});

Cypress.Commands.add(
  'createEdaRulebookActivation',
  (edaRulebookActivation: SetOptional<Omit<EdaRulebookActivation, 'id'>, 'name'>) => {
    cy.requestPost<EdaRulebookActivation>(`/api/eda/v1/activations/`, {
      name: 'E2E Rulebook Activation ' + randomString(5),
      restart_policy: 'on-failure',
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

Cypress.Commands.add('getEdaProject', (projectName: string) => {
  cy.requestGet<EdaResult<EdaProject>>(`/api/eda/v1/projects/?name=${projectName}`).then(
    (result) => {
      if (result?.results && result.results.length === 1) {
        return result.results[0];
      }
      return undefined;
    }
  );
});

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
      cy.wrap(result.results);
    } else {
      cy.wait(100).then(() => cy.pollEdaResults(url));
    }
  });
});

Cypress.Commands.add('createEdaCredential', () => {
  cy.requestPost<EdaCredential>('/api/eda/v1/credentials/', {
    name: 'E2E Credential ' + randomString(4),
    credential_type: 'Container Registry',
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

Cypress.Commands.add('createEdaUser', () => {
  cy.requestPost<EdaUser>(`/api/eda/v1/users/`, {
    username: `E2E User ${randomString(4)}`,
    email: `${randomString(4)}@redhat.com`,
    password: `${randomString(4)}`,
  }).then((edaUser) => {
    Cypress.log({
      displayName: 'EDA USER CREATION :',
      message: [`Created 👉  ${edaUser.username}`],
    });
    return edaUser;
  });
});

Cypress.Commands.add('deleteEdaUser', (user: EdaUser) => {
  cy.requestDelete(`/api/eda/v1/credentials/${user.id}/`, true).then(() => {
    Cypress.log({
      displayName: 'EDA CREDENTIAL DELETION :',
      message: [`Deleted 👉  ${user.username}`],
    });
  });
});

Cypress.Commands.add('getEdaUser', () => {
  cy.requestGet<EdaResult<EdaUser>>(`/api/eda/v1/users/me/`).then((result) => {
    // This will take care of deleting the project and the associated org, inventory
    if (Array.isArray(result?.results) && result?.results.length === 1) {
      return result?.results[0];
    } else {
      return undefined;
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
