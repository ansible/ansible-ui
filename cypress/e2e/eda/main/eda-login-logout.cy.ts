//Tests a user's ability to log into and out of the EDA UI.
//Note that EDA Actions do not have any CRUD functionality.
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Settings } from '@ansible/awx-ui/interfaces/Settings';
import { SAAS_URL } from '../../../support/constants';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { edaAPI } from '../../../support/formatApiPathForEDA';

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

  describe('EDA Login / Logoff', () => {
    it('can log into the UI and view username in the top right of the Dashboard toolbar', () => {
      cy.getEdaActiveUser().then((edaUser) => {
        cy.intercept('POST', edaAPI`/auth/session/logout/`).as('loggedOut');
        cy.edaLogout();
        cy.wait('@loggedOut').then((result) => {
          expect(result?.response?.statusCode).to.eql(204);
        });
        if (edaUser) {
          cy.get('#pf-login-username-id').type(edaUser.username);
          cy.get('#pf-login-password-id').type(Cypress.env('EDA_PASSWORD') as string);
          cy.clickButton('Log in');
          cy.get('.pf-v5-c-dropdown__toggle').eq(1).should('contain', edaUser.username);
        }
      });
    });

    it('can log out and login as a different user', () => {
      const password = randomString(12);
      cy.createEdaUser({ password }).then((user) => {
        cy.edaLogout();
        cy.edaLogin(user.username, password);
        cy.get('.pf-v5-c-dropdown__toggle').eq(1).should('contain', user.username);
        cy.edaLogout();
        cy.edaLogin();
        cy.deleteEdaUser(user);
      });
    });
  });
});
