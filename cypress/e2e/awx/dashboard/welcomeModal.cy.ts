describe('dashboard: Welcome modal', () => {
  before(() => {
    cy.awxLogin();
  });

  it.skip('renders the Welcome Modal on the dashboard', () => {
    cy.wait(5000);
    cy.navigateTo('awx', 'dashboard');
    cy.getDialog().within(() => {
      cy.contains('Welcome to the new Ansible user interface').should('be.visible');
    });
  });

  it.skip('renders the Welcome Modal on reload of the dashboard until checkbox is selected', () => {
    cy.navigateTo('awx', 'dashboard');
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

  it.skip('verifies the tech preview banner title in the new UI and the working links to and from the old UI', () => {
    cy.navigateTo('awx', 'dashboard');
    cy.get('div.pf-c-banner.pf-m-info p')
      .should(
        'have.text',
        ' You are currently viewing a tech preview of the new Ansible Automation Platform user interface. To return to the original interface, click here.'
      )
      .should('be.visible');
    cy.contains('div.pf-c-banner.pf-m-info a', 'here').click();
    cy.url().should('not.include', '/ui_next');
    cy.contains(
      'div.pf-c-banner.pf-m-info p',
      'A tech preview of the new Ansible Automation Platform user interface can be found here.'
    ).should('be.visible');
    cy.contains('h2', 'Dashboard').should('be.visible');
  });
});
