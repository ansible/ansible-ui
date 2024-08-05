//Tests a user's ability to use Credentials in various resources in the EDA UI.
import { randomString } from '../../../../framework/utils/random-string';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { ActivationRead } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Credentials Use in Resources', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRuleBook: EdaRulebook;
  before(() => {
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
      cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
        edaRuleBook = edaRuleBooks[0];
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
        });
      });
    });
  });

  it('can create RBA without credentials', () => {
    const name = 'E2E Rulebook Activation ' + randomString(4);
    cy.navigateTo('eda', 'rulebook-activations');
    cy.clickButton(/^Create rulebook activation$/);
    cy.get('h1').should('contain', 'Create rulebook activation');
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
    cy.selectDropdownOptionByResourceName('project-id', edaProject.name);
    cy.selectDropdownOptionByResourceName('rulebook', edaRuleBook.name);
    cy.selectDropdownOptionByResourceName('decision-environment-id', edaDecisionEnvironment.name);
    cy.selectDropdownOptionByResourceName('restart-policy', 'Always');
    cy.intercept('POST', edaAPI`/activations/`).as('edaRBA');
    cy.clickButton(/^Create rulebook activation$/);
    cy.wait('@edaRBA').then((edaRBA) => {
      const rbaToBeDeleted = edaRBA?.response?.body as ActivationRead;
      cy.get('h1').should('contain', name);
      cy.get('.pf-v5-c-breadcrumb a').should('contain', 'Rulebook Activations').click();
      cy.filterTableByText(rbaToBeDeleted.name);
      cy.contains('[data-label="Status"]', 'Completed', { timeout: 180000 });
      cy.get('tbody tr').then(() => {
        cy.get(' tr [data-cy="actions-dropdown"]')
          .click()
          .then(() => {
            cy.contains('li', 'Restart rulebook activation').click();
            cy.intercept('POST', edaAPI`/activations/${rbaToBeDeleted.id.toString()}/restart/`).as(
              'restart'
            );
            cy.edaRuleBookActivationActionsModal('restart', rbaToBeDeleted.name);
            cy.get('button').contains('rulebook activations').click();
            cy.get('button').contains('Close').click();
            cy.wait('@restart').then((restart) => {
              expect(restart?.response?.statusCode).to.eq(204);
            });
          });
      });
      cy.deleteEdaRulebookActivation(rbaToBeDeleted);
    });
  });

  it('cannot create a private project without credentials', () => {
    const name = 'E2E Project ' + randomString(4);
    cy.navigateTo('eda', 'projects');
    cy.get('h1').should('contain', 'Projects');
    cy.clickButton(/^Create project$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="url"]').type('https://github.com/ansible/aap-ui');
    cy.selectSingleSelectOption('[data-cy="organization_id"]', 'Default');
    cy.clickButton(/^Create project$/);
    cy.getEdaProjectByName(name).then((thisProject: EdaProject) => {
      cy.waitEdaProjectSync(thisProject).then((result) => {
        cy.hasDetail('Status', 'Failed');
        cy.hasDetail('Import error', 'Credentials not provided or incorrect');
        expect(result.import_state).to.eql('failed');
        if (thisProject) cy.deleteEdaProject(result);
      });
    });
  });

  it('cannot use a private DE without credentials', () => {
    const de_name = 'E2E DE ' + randomString(4);
    cy.navigateTo('eda', 'decision-environments');
    cy.verifyPageTitle('Decision Environments');
    cy.clickButton(/^Create decision environment$/);
    cy.get('[data-cy="name"]').type(de_name);
    cy.selectSingleSelectOption('[data-cy="organization_id"]', 'Default');
    cy.get('[data-cy="image-url"]').type('quay.io/abakshirht/galaxy-ng-locust:ansible2.13');
    cy.clickButton(/^Create decision environment$/);
    cy.verifyPageTitle(de_name);
    cy.navigateTo('eda', 'rulebook-activations');
    cy.clickButton(/^Create rulebook activation$/);
    cy.get('h1').should('contain', 'Create rulebook activation');
    const name = 'E2E Project ' + randomString(4);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
    cy.selectDropdownOptionByResourceName('project-id', edaProject.name);
    cy.selectDropdownOptionByResourceName('rulebook', edaRuleBook.name);
    cy.selectDropdownOptionByResourceName('decision-environment-id', de_name);
    cy.selectDropdownOptionByResourceName('restart-policy', 'Always');
    cy.intercept('POST', edaAPI`/activations/`).as('edaRBA');
    cy.clickButton(/^Create rulebook activation$/);
    cy.wait('@edaRBA').then((edaRBA) => {
      const rbaToBeDeleted = edaRBA?.response?.body as ActivationRead;
      cy.get('h1').should('contain', name);
      cy.get('.pf-v5-c-breadcrumb a').should('contain', 'Rulebook Activations').click();
      cy.filterTableByText(rbaToBeDeleted.name);
      cy.contains('[data-label="Status"]', 'Failed', { timeout: 120000 });
      cy.getEdaDecisionEnvironmentByName(de_name).then((de) => {
        cy.wrap(de).should('not.be.undefined');
        if (de) cy.deleteEdaDecisionEnvironment(de);
      });
      cy.deleteEdaRulebookActivation(rbaToBeDeleted);
    });
  });
});
