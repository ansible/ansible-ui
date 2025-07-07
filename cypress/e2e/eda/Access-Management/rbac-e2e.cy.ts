import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaProject } from '@ansible/eda-ui/interfaces/EdaProject';
import { EdaRulebook } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import { LogLevelEnum } from '@ansible/eda-ui/interfaces/generated/eda-api';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { gatewayAPI } from '../../../support/formatApiPathForPlatform';

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

  describe('Users: RBAC', () => {
    let edaProject: EdaProject;
    let edaRuleBook: EdaRulebook;
    let RBA: EdaRulebookActivation;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaOrganization: EdaOrganization;

    before(() => {
      cy.createEdaOrganization().then((edaOrg) => {
        edaOrganization = edaOrg;

        cy.createEdaProject(edaOrganization.id).then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook = edaRuleBooks[0];
            cy.createEdaCredential(edaOrganization.id).then((edaCredential) => {
              cy.createEdaDecisionEnvironment(
                edaOrganization.id,
                edaCredential,
                'quay.io/abakshirht/galaxy-ng-locust:ansible2.13'
              ).then((decisionEnvironment) => {
                edaDecisionEnvironment = decisionEnvironment;
                cy.createEdaRulebookActivation(
                  {
                    rulebook_id: edaRuleBook.id,
                    decision_environment_id: decisionEnvironment.id,
                    k8s_service_name: 'sample',
                    log_level: LogLevelEnum.Error,
                  },
                  edaOrganization
                ).then((edaRulebookActivation) => {
                  RBA = edaRulebookActivation;
                });
              });
            });
          });
        });
      });
    });

    after(() => {
      cy.deleteEdaRulebookActivation(RBA);
      cy.deleteEdaProject(edaProject, { failOnStatusCode: false });
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment, { failOnStatusCode: false });
      cy.deleteEdaOrganization(edaOrganization);
    });

    describe('Users - Permissions', () => {
      let edaUser1: PlatformUser;
      let edaUser2: PlatformUser;

      beforeEach(() => {
        cy.createPlatformUser({ password: 'pass' }).then((user) => {
          edaUser1 = user;
        });
        cy.createPlatformUser({ password: 'pass' }).then((user) => {
          edaUser2 = user;
        });
      });

      afterEach(() => {
        cy.deletePlatformUser(edaUser1, { failOnStatusCode: false });
        cy.deletePlatformUser(edaUser2, { failOnStatusCode: false });
      });

      it('can give new user resource permission, verify role assignment, and verify new user ability to perform action', () => {
        cy.navigateTo('eda', 'rulebook-activations');
        cy.verifyPageTitle('Rulebook Activations');
        cy.clickTableRow(RBA.name, false);
        cy.verifyPageTitle(RBA.name);
        cy.clickTab('User Access', true);
        cy.getByDataCy('assign-users').click();
        cy.getTableRowByText(edaUser1.username, true).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.intercept('GET', edaAPI`/role_definitions/?*`).as('edaRoles');
        cy.clickButton(/^Next$/);
        cy.wait('@edaRoles');
        cy.getTableRowByText('Activation Admin', false).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Finish$/);
        cy.assertModalSuccess();
        cy.contains('div', edaUser1.username);
        cy.intercept('GET', gatewayAPI`/users/*`).as('user1');
        cy.visit(`/access/users/${edaUser1.id.toString()}/details`);
        cy.verifyPageTitle(edaUser1.username);
        cy.url().should('contain', '/details');
        cy.get(`a[href*="/access/users/${edaUser1.id}/roles?"]`).click();
        cy.intercept('OPTIONS', edaAPI`/role_definitions/`).as('edaRoleDefinitions');
        cy.intercept('GET', edaAPI`/role_user_assignments/*`).as('edaRoleAssignments');
        cy.get(`a[href*="/access/users/${edaUser1.id}/roles/eda?"]`).click();
        cy.wait('@edaRoleDefinitions');
        cy.wait('@edaRoleAssignments');
        cy.get('tbody').within(() => {
          cy.getBy('[data-cy="resource-name-column-cell"]').should('contain', RBA.name);
        });
        cy.get('tbody').within(() => {
          cy.getBy('[data-cy="role-column-cell"]').should('contain', 'Activation Admin');
        });
        cy.platformLogout();
        cy.get('h2').should('contain', 'Log in to your account');
        cy.get('input[id*="login-username-id"]').type(edaUser1.username);
        cy.get('input[id*="login-password-id"]').type('pass');
        cy.clickButton('Log in');
        cy.contains('button', `${edaUser1.username}`).should('be.visible');
        cy.navigateTo('eda', 'rulebook-activations');
        cy.getTableRowByText(RBA.name).within(() => {
          cy.get('.pf-v6-c-switch__toggle').click();
        });
        cy.edaRuleBookActivationActionsModal('disable', RBA.name);
        cy.get('button').contains('rulebook activations').click();
        // cy.contains('[data-label="Status"]', 'Stopped', { timeout: 120000 });
        //Reenable to following lines of code with this issue is fixed: https://issues.redhat.com/browse/AAP-29872
        // Also refer to https://issues.redhat.com/browse/AAP-29873
        // cy.getTableRowByText(RBA.name).within(() => {
        //   cy.contains('tr', RBA.name);
        //   cy.get('.pf-v6-c-switch__toggle').click();
        // });
        // cy.contains('[data-label="Status"]', 'Completed', { timeout: 120000 });
        // cy.clickButton(/^Clear all filters$/);
      });

      it('other user cannot perform a specific action', () => {
        cy.platformLogout();
        cy.get('input[id*="login-username-id"]').type(edaUser2.username);
        cy.get('input[id*="login-password-id"]').type('pass');
        cy.clickButton('Log in');
        cy.contains('button', `${edaUser2.username}`).should('be.visible');
        cy.navigateTo('eda', 'rulebook-activations');
        cy.contains('You do not have permission to create a rulebook activation.');
        cy.get('table.page-table').should('not.exist');
        cy.platformLogout();
        cy.platformLogin();
      });
    });

    describe('Teams - Permissions', () => {
      let edaUser1: PlatformUser;
      let edaUser2: PlatformUser;
      let edaTeam: PlatformTeam;
      let platformOrganization: PlatformOrganization;

      beforeEach(function () {
        cy.createPlatformOrganization().then((platformOrg) => {
          platformOrganization = platformOrg;
          cy.createPlatformUser({ password: 'pass' }).then((user) => {
            edaUser1 = user;
            cy.createPlatformTeam({
              name: `E2E Platform Team ${randomString(5)}`,
              organization: platformOrg.id,
            }).then((createdPlatformTeam: PlatformTeam) => {
              cy.associateUsersWithPlatformTeam(createdPlatformTeam, [edaUser1]).then(() => {
                edaTeam = createdPlatformTeam;
              });
            });
          });
          cy.createPlatformUser({ password: 'pass' }).then((user) => {
            edaUser2 = user;
          });
        });
      });

      afterEach(() => {
        cy.deletePlatformUser(edaUser1, { failOnStatusCode: false });
        cy.deletePlatformUser(edaUser2, { failOnStatusCode: false });
        cy.deletePlatformTeam(edaTeam, { failOnStatusCode: false });
        cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
      });

      it('can give new team resource permission, verify team assignment, and verify new team permission', () => {
        cy.navigateTo('eda', 'projects');
        cy.verifyPageTitle('Projects');
        cy.getBy('[data-cy="text-input"] input').type(edaProject.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tr [data-cy="name-column-cell"]').contains(edaProject.name).click();
        cy.verifyPageTitle(edaProject.name);
        cy.clickTab('Team Access', true);
        cy.get('a[data-cy="add-roles"]').click();
        cy.getTableRowByText(edaTeam.name, true).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.intercept('GET', edaAPI`/role_definitions/?*`).as('edaRoles');
        cy.clickButton(/^Next$/);
        cy.wait('@edaRoles');
        cy.clickButton(/^Next$/);
        cy.getTableRowByText('Project Admin', false).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Finish$/);
        cy.assertModalSuccess();
        cy.platformLogout();
        cy.get('input[id*="login-username-id"]').type(edaUser1.username);
        cy.get('input[id*="login-password-id"]').type('pass');
        cy.clickButton('Log in');
        cy.contains('button', `${edaUser1.username}`).should('be.visible');
        cy.navigateTo('eda', 'projects');
        cy.verifyPageTitle('Projects');
        cy.getBy('[data-cy="text-input"] input').type(edaProject.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tr [data-cy="name-column-cell"]').contains(edaProject.name).click();
        cy.get('[data-cy="name"]').should('contain', edaProject.name);
        cy.url().should('contain', '/details');
        cy.get(`a[href*="/decisions/projects/${edaProject.id}/team-access?"]`).click();
        cy.getBy('[data-cy="text-input"] input').type(edaTeam.name);
        cy.get('tr').contains(edaTeam.name);
        cy.contains('tr', 'Project Admin');
        cy.platformLogout();
        cy.login();
      });

      it('other user cannot perform that action', () => {
        cy.platformLogout();
        // login as user without permissions
        cy.contains('Log in');
        cy.get('#pf-login-username-id').type(edaUser2.username);
        cy.get('#pf-login-password-id').type('pass');
        cy.contains('button', 'Log in').click();
        cy.getByDataCy('nav-toggle').should('exist');
        cy.contains('button', `${edaUser2.username}`).should('be.visible');
        cy.navigateTo('eda', 'projects');
        cy.verifyPageTitle('Projects');
        cy.get('.pf-v6-c-empty-state').should('be.visible');
        // logout as normal user
        cy.platformLogout();
        // log back in as admin to delete newly created user
        cy.platformLogin();
      });
    });
  });
});
