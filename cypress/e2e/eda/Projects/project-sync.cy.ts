import { cyLabel } from '../../../support/cyLabel';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
let edaOrg: EdaOrganization;
before(() => {
  cy.createEdaOrganization().then((organization) => {
    edaOrg = organization;
  });
});
after(() => {
  cy.deleteEdaOrganization(edaOrg);
});
cyLabel(['aaas-unsupported'], function () {
  describe('EDA Projects Syncing', () => {
    it('can sync a single project', () => {
      cy.createEdaProject(edaOrg?.id).then((edaProject) => {
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
