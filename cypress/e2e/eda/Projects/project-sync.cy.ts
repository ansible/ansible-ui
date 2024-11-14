import { Settings } from '@ansible/awx-ui/interfaces/Settings';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { SAAS_URL } from '../../../support/constants';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('If SaaS Build', () => {
  before(function () {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      const saasBaseUrl = data.TOWER_URL_BASE;
      const parseSaas = saasBaseUrl.split('.').slice(2).join('.').toString();
      if (parseSaas === SAAS_URL) {
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
