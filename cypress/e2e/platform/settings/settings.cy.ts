import { ILicenseInfo } from '../../../../frontend/awx/interfaces/Config';
describe('Users - create, edit and delete', () => {
  it('checks license compliance status', () => {
    cy.intercept('GET', '/api/controller/v2/config').as('getConfig');
    cy.navigateTo('platform', 'subscription-details');
    cy.verifyPageTitle('Subscription');
    cy.wait('@getConfig')
      .its('response.body.license_info')
      .then((licenseObject: ILicenseInfo) => {
        if (Object.keys(licenseObject as object).length === 0) {
          // If license object is empty, check for Out of Compliance status
          cy.navigateTo('platform', 'overview');

          cy.get('.pf-v5-c-banner.pf-m-red').should(
            'have.text',
            'Your subscription is out of compliance.'
          );

          cy.navigateTo('platform', 'subscription-details');
          cy.get('[data-cy="status"]').should('have.text', 'Out of compliance');
          cy.clickButton(/^Edit subscription/);
          cy.contains('h1', 'Welcome to Red Hat Ansible Automation Platform!').should('be.visible');
          cy.url().should('include', 'settings/subscription/wizard');
        } else {
          // If license object is not empty, check for Compliant status
          cy.navigateTo('platform', 'overview');
          cy.get('.pf-v5-c-banner.pf-m-red').should('not.exist');

          cy.navigateTo('platform', 'subscription-details');
          cy.get('[data-cy="status"]').should('have.text', 'Compliant');
          cy.clickButton(/^Edit subscription/);
          cy.contains('h1', 'Welcome to Red Hat Ansible Automation Platform!').should('be.visible');
          cy.url().should('include', 'settings/subscription/wizard');
        }
      });
  });
});
