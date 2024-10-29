//Tests a user's ability to perform certain actions on the Navigation toolbar in the EDA UI.
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { Settings } from '../../../../frontend/awx/interfaces/Settings';
import { SAAS_URL } from '../../../support/constants';

describe('If SaaS Build', () => {
  before(function () {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      const saasBaseUrl = data.TOWER_URL_BASE;
      const parseSaas = saasBaseUrl.split('.').slice(2).join('.').toString();
      if (parseSaas === SAAS_URL) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('EDA Navigation Bar Functionality', () => {
    it('can visit the dashboard page and assert the data there', () => {
      cy.get('[data-cy="platform-overview"]').contains('Overview');
      cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    });

    it('can visit the rule audits page and assert the data there', () => {
      cy.get('[data-cy="eda-rule-audits"]').contains('Rule Audit').click();
      cy.verifyPageTitle('Rule Audit');
      cy.get('[data-cy="app-description"]').should(
        'have.text',
        'Rule audit allows for monitoring and reviewing the execution of defined rules which have been triggered by incoming events.'
      );
    });

    it('can visit the rulebook activations page and assert the data there', () => {
      cy.get('[data-cy="eda-rulebook-activations"]').contains('Rulebook Activations').click();
      cy.verifyPageTitle('Rulebook Activations');
      cy.get('[data-cy="app-description"]').should(
        'have.text',
        'Rulebook activations manage the configuration and enabling of rulebooks that govern automation logic triggered by events.'
      );
      cy.contains('Create rulebook activation').should('exist');
    });

    it('can visit the projects page and assert the data there', () => {
      cy.get('[data-cy="eda-projects"]').contains('Projects').click();
      cy.verifyPageTitle('Projects');
      cy.get('[data-cy="app-description"]').should(
        'have.text',
        'A project is a logical collection of rulebooks.'
      );
      cy.contains('Create project').should('exist');
    });

    it('can visit the decision environment page and assert the data there', () => {
      cy.get('[data-cy="eda-decision-environments"]').contains('Decision Environments').click();
      cy.verifyPageTitle('Decision Environments');
      cy.get('[data-cy="app-description"]').should(
        'have.text',
        'Decision environments are a container image to run Ansible rulebooks.'
      );
      cy.contains('Create decision environment').should('exist');
    });
  });
});
