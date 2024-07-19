import { ILicenseInfo } from '../../../../frontend/awx/interfaces/Config';
describe('Settings', () => {
  it('checks license compliance status', () => {
    cy.intercept('GET', '/api/controller/v2/config').as('getConfig');
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
          cy.contains('h1', 'Welcome to Red Hat Ansible Automation Platform!').should('be.visible');
          cy.url().should('include', 'settings/subscription/wizard');
        } else {
          cy.get('[data-cy="subscription-grace-period-banner"]').should('not.exist');
          cy.navigateTo('platform', 'subscription-details');
          cy.get('[data-cy="status"]').should('have.text', 'Compliant');
          cy.clickButton(/^Edit subscription/);
          cy.contains('h1', 'Welcome to Red Hat Ansible Automation Platform!').should('be.visible');
          cy.url().should('include', 'settings/subscription/wizard');
        }
      });
  });
});
