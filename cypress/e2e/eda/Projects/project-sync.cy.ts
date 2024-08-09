import { tag } from '../../../support/tag';

tag(['aaas-unsupported'], function () {
  describe('EDA Projects Syncing', () => {
    it('can sync a single project', () => {
      cy.createEdaProject().then((edaProject) => {
        cy.navigateTo('eda', 'projects');
        cy.searchAndDisplayResource(edaProject?.name);
        cy.get(`[data-cy=row-id-${edaProject.id}]`).within(() => {
          cy.get('[data-cy="status-column-cell"]')
            .should('contain', 'Completed')
            .should('be.visible');
        });
        cy.deleteEdaProject(edaProject);
      });
    });
  });
});
