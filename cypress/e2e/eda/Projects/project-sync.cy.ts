describe('EDA Projects Syncing', () => {
  before(() => cy.edaLogin());

  it('can sync a single project', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.navigateTo(/^Projects$/);
      cy.clickTableRowActionIcon(edaProject?.name, 'Sync project');
      cy.contains('h4.pf-c-alert__title', `Syncing ${edaProject.name}`).should('be.visible');
      cy.get('td[data-label="Status"]').should('contain', 'Completed').should('be.visible');
      cy.deleteEdaProject(edaProject);
    });
  });
});
