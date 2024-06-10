import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { LogLevelEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { randomString } from '../../../../framework/utils/random-string';
import { tag } from '../../../support/tag';

tag(['aaas-unsupported'], () => {
  describe('Users - Permissions', () => {
    let edaProject: EdaProject;
    let edaRuleBook: EdaRulebook;
    let RBA: EdaRulebookActivation;
    let edadecisionEnvironment: EdaDecisionEnvironment;
    let edaUser1: PlatformUser;
    let edaUser2: PlatformUser;
    before(() => {
      cy.platformLogin();
      cy.createEdaProject().then((project) => {
        edaProject = project;
        cy.waitEdaProjectSync(project);
        cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
          edaRuleBook = edaRuleBooks[0];
          cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
            edadecisionEnvironment = decisionEnvironment;
            cy.createEdaRulebookActivation({
              rulebook_id: edaRuleBook.id,
              decision_environment_id: decisionEnvironment.id,
              k8s_service_name: 'sample',
              log_level: LogLevelEnum.Error,
            }).then((edaRulebookActivation) => {
              RBA = edaRulebookActivation;
            });
          });
        });
      });
      cy.createPlatformUser({ password: 'pass' }).then((user) => {
        edaUser1 = user;
      });
      cy.createPlatformUser({ password: 'pass' }).then((user) => {
        edaUser2 = user;
      });
    });

    after(() => {
      cy.deleteEdaRulebookActivation(RBA);
      cy.deleteEdaProject(edaProject);
      cy.deleteEdaDecisionEnvironment(edadecisionEnvironment);
      cy.deletePlatformUser(edaUser1);
      cy.deletePlatformUser(edaUser2);
    });

    it('can give permission to a resource from user access tab', () => {
      cy.navigateTo('eda', 'rulebook-activations');
      cy.verifyPageTitle('Rulebook Activations');
      cy.clickTableRow(RBA.name, false);
      cy.verifyPageTitle(RBA.name);
      cy.clickTab('User Access', true);
      cy.getByDataCy('add-roles').click();
      cy.selectTableRow(edaUser1.username, true);
      cy.clickButton(/^Next$/);
      cy.selectTableRow('Activation Admin', false);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Finish$/);
      cy.assertModalSuccess();
      cy.clickButton(/^Close$/);
      cy.contains('div', edaUser1.username);
    });

    it.skip('permissions are reflected in users -> roles tab', () => {});

    it.skip('user can perform that specific action', () => {
      cy.platformLogout();
      cy.get('h1').should('contain', 'Log in to your account');
      // login as user with permissions
      cy.getByDataCy('username').type(edaUser1.username);
      cy.getByDataCy('password').type('pass');
      cy.getByDataCy('Submit').click();
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser1.username}`);
      cy.navigateTo('eda', 'rulebook-activations');
      // try to disable a RBA
      cy.getTableRowByText(RBA.name).within(() => {
        cy.get('.pf-v5-c-switch__toggle').click();
      });
      cy.edaRuleBookActivationActionsModal('disable', RBA.name);
      cy.get('button').contains('rulebook activations').click();
      cy.get('button').contains('Close').click();
      cy.contains('[data-label="Status"]', 'Stopped', { timeout: 120000 });
      // try to enable a RBA
      cy.getTableRowByText(RBA.name).within(() => {
        cy.contains('tr', RBA.name);
        cy.get('.pf-v5-c-switch__toggle').click();
      });
      cy.contains('[data-label="Status"]', 'Completed', { timeout: 120000 });
      cy.clickButton(/^Clear all filters$/);
    });

    it.skip('other user cannot perform that action', () => {
      cy.platformLogout();
      // login as user without permissions
      cy.get('[data-cy="username"]').type(edaUser2.username);
      cy.get('[data-cy="password"]').type('pass');
      cy.get('[data-cy="Submit"]').click();
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser2.username}`);
      cy.navigateTo('eda', 'rulebook-activations');
      // user is not able to view any rulebook activations
      cy.contains('You do not have permission to create a rulebook activation.');
      cy.get('table.page-table').should('not.exist');
      // logout as normal user
      cy.platformLogout();
      // log back in as admin to delete newly created user
      cy.platformLogin();
    });
  });

  describe('Teams - Permissions', () => {
    let edaProject: EdaProject;
    let edaUser1: PlatformUser;
    let edaUser2: PlatformUser;
    let edaTeam: PlatformTeam;
    before(function () {
      cy.platformLogin();
      cy.createEdaProject().then((project) => {
        edaProject = project;
        cy.waitEdaProjectSync(project);
      });
      cy.createPlatformUser({ password: 'pass' }).then((user) => {
        edaUser1 = user;
        cy.createPlatformTeam({
          name: `E2E Platform Team ${randomString(5)}`,
          organization: 1,
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

    after(() => {
      cy.deleteEdaProject(edaProject);
      cy.deletePlatformUser(edaUser1);
      cy.deletePlatformUser(edaUser2);
      cy.deletePlatformTeam(edaTeam);
    });

    it('can give permission to a resource from team access tab', () => {
      cy.navigateTo('eda', 'projects');
      cy.verifyPageTitle('Projects');
      cy.clickTableRow(edaProject.name, true);
      cy.verifyPageTitle(edaProject.name);
      cy.contains('li', 'Team Access').click();
      cy.get('a[data-cy="add-roles"]').click();
      cy.selectTableRow(edaTeam.name, true);
      cy.clickButton(/^Next$/);
      cy.selectTableRow('Project Admin', false);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Finish$/);
      cy.assertModalSuccess();
      cy.clickButton(/^Close$/);
    });

    it.skip('permissions are reflected in teams-> roles tab', () => {});

    // This is not working at present due to an API bug: https://issues.redhat.com/browse/AAP-24956
    it.skip('user can perform that specific action', () => {
      cy.platformLogout();
      // login as user with permissions
      cy.get('[data-cy="username"]').type(edaUser1.username);
      cy.get('[data-cy="password"]').type('pass');
      cy.get('[data-cy="Submit"]').click();
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser1.username}`);
      cy.navigateTo('eda', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByText(edaProject.name);
      cy.contains('tr', edaProject.name);
    });

    it.skip('other user cannot perform that action', () => {
      cy.platformLogout();
      // login as user without permissions
      cy.getByDataCy('username').type(edaUser2.username);
      cy.get('[data-cy="password"]').type('pass');
      cy.get('[data-cy="Submit"]').click();
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser2.username}`);
      cy.navigateTo('eda', 'projects');
      cy.verifyPageTitle('Projects');
      cy.get('.pf-v5-c-empty-state').should('be.visible');
      // logout as normal user
      cy.platformLogout();
      // log back in as admin to delete newly created user
      cy.platformLogin();
    });
  });
});
