describe('EDA Projects Syncing', () => {
  before(() => cy.edaLogin());

  it('can sync a single project', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.navigateTo('eda', 'projects');
      cy.clickTableRowActionIcon(edaProject?.name, 'Sync project');

      // Cannot test the alert title because it showing is based on timing.
      // cy.contains('h4.pf-c-alert__title', `Syncing ${edaProject.name}`).should('be.visible');

      cy.get('td[data-label="Status"]').should('contain', 'Completed').should('be.visible');
      cy.deleteEdaProject(edaProject);
    });
  });
});
