import { ILicenseInfo } from '@ansible/common-ui/interfaces/Config';
import { AZURE_URL, SAAS_URL } from '../../../support/constants';

describe('If SaaS Build', () => {
  before(function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL) {
        cy.log('Test/tests should not run on this deployment.');
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('Settings', () => {
    it('checks license compliance status', () => {
      cy.intercept('GET', '/api/controller/v2/config').as('getConfig');
      cy.navigateTo('platform', 'overview');
      cy.wait('@getConfig')
        .its('response.body.license_info')
        .then((licenseObject: ILicenseInfo) => {
          // If license compliant is false check for banner and possibility to Edit subscription
          if (!licenseObject.compliant) {
            cy.getByDataCy('subscription-grace-period-banner').should(
              'include.text',
              'Your subscription is out of compliance.'
            );
            cy.navigateTo('platform', 'subscription-details');
            cy.get('[data-cy="status"]').should('have.text', 'Out of compliance');
            cy.clickButton(/^Edit subscription/);
            cy.contains('h1', 'Welcome to Red Hat Ansible Automation Platform!').should(
              'be.visible'
            );
            cy.url().should('include', 'settings/subscription/wizard');
          } else {
            cy.get('[data-cy="subscription-grace-period-banner"]').should('not.exist');
            cy.navigateTo('platform', 'subscription-details');
            cy.get('[data-cy="status"]').should('have.text', 'Compliant');
            cy.clickButton(/^Edit subscription/);
            cy.contains('h1', 'Welcome to Red Hat Ansible Automation Platform!').should(
              'be.visible'
            );
            cy.url().should('include', 'settings/subscription/wizard');
          }
        });
    });
    it('checks login redirect override', () => {
      cy.get('[data-cy="page-navigation"]').then((nav) => {
        if (nav.is(':visible')) {
          cy.get(`[data-cy="platform-gateway-settings"]`).click({ force: true });
        } else {
          cy.get('[data-cy="nav-toggle"]').click();
          cy.get(`[data-cy="platform-gateway-settings"]`).click({ force: true });
        }
      });
      cy.clickButton(/^Edit platform gateway settings$/);
      cy.getByDataCy('login-redirect-override').clear().type('https://www.google.com');
      cy.getByDataCy('confirm-login-redirect-override').clear().type('https://www.google.com');
      cy.getByDataCy('Submit').click();
      cy.platformLogout();
      cy.url().should('be.equal', 'https://www.google.com');
    });
  });
});
