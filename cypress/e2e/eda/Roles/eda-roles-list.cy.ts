//Tests a user's ability to perform certain actions on the Roles list in the EDA UI.
import { Settings } from '@ansible/awx-ui/interfaces/Settings';
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

  describe('EDA Roles List', () => {
    it('can render the Roles list view and utilize the Roles links to view details', () => {
      cy.navigateTo('eda', 'roles');
      cy.verifyPageTitle('Roles');
      cy.getEdaRoles().then((roles) => {
        cy.setTablePageSize('50');
        cy.get('tbody').find('tr').should('have.length', roles.length);
        roles.forEach((role) => {
          cy.verifyPageTitle('Roles');
          cy.clickTableRow(role.name, true);
          cy.verifyPageTitle(role.name);
          cy.get('#description').should('contain', role.description);
          cy.clickLink(/^Roles$/);
        });
      });
    });
  });
});
