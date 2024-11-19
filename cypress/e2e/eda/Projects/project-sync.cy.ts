import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';

describe('Check if the build includes EDA', () => {
  before(function () {
    cy.getPlatformApis().then((data) => {
      if (data?.apis && !data?.apis?.eda) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('EDA Projects Syncing', () => {
    let edaOrg: EdaOrganization;
    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
      });
    });

    after(() => {
      cy.deleteEdaOrganization(edaOrg);
    });

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
