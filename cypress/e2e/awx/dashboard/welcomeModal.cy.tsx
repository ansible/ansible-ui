describe('dashboard: Welcome modal', () => {
  before(() => {
    cy.awxLogin();
  });

  it('renders the Welcome Modal on the dashboard', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.getDialog().within(() => {
      cy.contains('Welcome to the new Ansible user interface').should('be.visible');
    });
  });

  it('renders the Welcome Modal on reload of the dashboard until checkbox is selected', () => {
    cy.visit(`/ui_next/dashboard`);
    cy.getDialog().within(() => {
      cy.contains('Welcome to the new Ansible user interface').should('be.visible');
    });
    cy.clickModalButton('Close');
    // Welcome modal continues to display on the dashboard after a reload
    cy.reload();
    cy.getDialog().within(() => {
      cy.contains('Welcome to the new Ansible user interface').should('be.visible');
    });
    // Select option to not show the welcome message again (for the rest of the session)
    cy.getCheckboxByLabel('Do not show this message again.').click();
    cy.clickModalButton('Close');
    cy.reload();
    cy.contains('Welcome to the new Ansible user interface').should('not.exist');
  });
});
