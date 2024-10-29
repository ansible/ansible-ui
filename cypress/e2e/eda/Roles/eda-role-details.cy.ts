import { awxAPI } from '../../../support/formatApiPathForAwx';
import { Settings } from '../../../../frontend/awx/interfaces/Settings';
import { SAAS_URL } from '../../../support/constants';

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

  describe('Eda Role Details', () => {
    it('role details pages should display role name, description, and permissions', () => {
      cy.getEdaRoles().then((roles) => {
        roles.forEach((role) => {
          cy.navigateTo('eda', 'roles');
          cy.clickTableRow(role.name, true);
          cy.get('[data-cy=name]').should('have.text', role.name);
          cy.get('[data-cy=description]').should('have.text', role.description);
          cy.getEdaRoleDetail(role.id.toString()).then((roleDetail) => {
            if (roleDetail.permissions.length > 3) {
              cy.get('[data-cy="permissions-description-list"] button').click();
            }
            for (const detail of roleDetail.permissions) {
              cy.get(`[data-cy="${detail}"]`).should('be.visible');
            }
          });
        });
      });
    });
  });
});
