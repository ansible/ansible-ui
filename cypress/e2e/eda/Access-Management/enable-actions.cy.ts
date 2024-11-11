import { randomString } from '../../../../framework/utils/random-string';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { LogLevelEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { RoleDefinition } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaUser } from '../../../../frontend/eda/interfaces/EdaUser';
import { edaAPI } from '../../../support/formatApiPathForEDA';
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

  describe('Users - Enable Action buttons', () => {
    let edaProject: EdaProject;
    let edaUser: EdaUser;
    let edaOrg: EdaOrganization;
    let edaRuleBook: EdaRulebook;
    let edadecisionEnvironment: EdaDecisionEnvironment;
    let RBA: EdaRulebookActivation;
    let edaCredential: EdaCredential;

    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
        cy.log(edaOrg.id.toString());
        cy.createEdaProject(edaOrg.id).then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook = edaRuleBooks[0];
            cy.createEdaCredential(edaOrg.id).then((credential) => {
              edaCredential = credential;
              cy.createEdaDecisionEnvironment(
                edaOrg.id,
                edaCredential,
                'quay.io/abakshirht/galaxy-ng-locust:ansible2.13'
              ).then((decisionEnvironment) => {
                edadecisionEnvironment = decisionEnvironment;
                cy.createEdaRulebookActivation(
                  {
                    rulebook_id: edaRuleBook.id,
                    decision_environment_id: decisionEnvironment.id,
                    k8s_service_name: 'sample',
                    log_level: LogLevelEnum.Error,
                    organization_id: edaOrg.id,
                  },
                  edaOrg
                ).then((edaRulebookActivation) => {
                  RBA = edaRulebookActivation;
                  cy.createEdaUser({ password: 'pass' }).then((user) => {
                    edaUser = user;
                  });
                });
              });
            });
          });
        });
      });
    });

    after(() => {
      cy.deleteEdaRulebookActivation(RBA);
      cy.deleteEdaDecisionEnvironment(edadecisionEnvironment);
      cy.deleteEdaProject(edaProject);
      cy.deleteEdaOrganization(edaOrg);
      cy.deleteEdaCredential(edaCredential);
      cy.deleteEdaUser(edaUser);
    });

    it('user cannot perform any actions other than read on RBA', () => {
      let readActivationRole: RoleDefinition;
      cy.createEdaRoleDefinition(
        'read-rba-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.activation',
        ['eda.view_activation']
      ).then((edaRole: RoleDefinition) => {
        readActivationRole = edaRole;
        cy.createRoleUserAssignments(
          RBA.id.toString(),
          readActivationRole.id,
          edaUser.id,
          'eda.activation'
        );
      });
      cy.platformLogout();
      // login as user without permissions
      cy.contains('Log in');
      cy.get('#pf-login-username-id').type(edaUser.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.contains('button', `${edaUser.username}`).should('be.visible');
      cy.navigateTo('eda', 'rulebook-activations');
      cy.verifyPageTitle('Rulebook Activations');
      // verify that the user can read but not create a project
      cy.filterTableByText(RBA.name);
      cy.contains('tr', RBA.name);
      cy.get('button')
        .contains(`Create rulebook activation`)
        .should('have.attr', 'aria-disabled', 'true')
        .click();
      // verify the action buttons are disabled in details view
      cy.clickTableRow(RBA.name);
      cy.intercept('DELETE', edaAPI`/activations/${RBA.id.toString()}/`).as('deleteRBA');
      cy.clickPageAction('delete-rulebook-activation');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete rulebook activations');
      cy.wait('@deleteRBA').then((deleteRBA) => {
        expect(deleteRBA?.response?.statusCode).to.eql(403);
      });
      cy.contains('You do not have permission to perform this action.');
      cy.clickButton(/^Close$/);
      // logout as normal user
      cy.platformLogout();
      // log back in as admin to delete newly created user
      cy.platformLogin();
      // cy.deleteEdaRoleDefinition(readActivationRole);
    });

    it('user cannot perform any actions other than read on Decision Environment', () => {
      let readDERole: RoleDefinition;
      cy.createEdaRoleDefinition(
        'read-de-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.decisionenvironment',
        ['eda.view_decisionenvironment']
      ).then((edaRole: RoleDefinition) => {
        readDERole = edaRole;
        cy.createRoleUserAssignments(
          edadecisionEnvironment.id.toString(),
          readDERole.id,
          edaUser.id,
          'eda.decisionenvironment'
        );
      });
      cy.platformLogout();
      // login as user without permissions
      cy.contains('Log in');
      cy.get('#pf-login-username-id').type(edaUser.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.contains('button', `${edaUser.username}`).should('be.visible');
      cy.navigateTo('eda', 'decision-environments');
      cy.verifyPageTitle('Decision Environments');
      // verify that the user can read but not create a decision environment
      cy.get('button')
        .contains(`Create decision environment`)
        .should('have.attr', 'aria-disabled', 'true')
        .click();
      cy.setTableView('table');
      cy.filterTableByTextFilter('name', edadecisionEnvironment.name, {
        disableFilterSelection: true,
      });
      cy.contains('td', edadecisionEnvironment.name).within(() => {
        cy.get('a').click();
      });
      cy.verifyPageTitle(edadecisionEnvironment.name);
      // verify the action buttons are disabled in details view
      cy.get('button')
        .contains('Edit decision environment')
        .should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-decision-environment').should('have.attr', 'aria-disabled', 'true');
      // logout as normal user
      cy.platformLogout();
      // log back in as admin to delete newly created user
      cy.platformLogin();
    });

    it('user cannot perform any actions other than read on Project', () => {
      let readProjectRole: RoleDefinition;
      cy.createEdaRoleDefinition(
        'read-project-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.project',
        ['eda.view_project']
      ).then((edaRole: RoleDefinition) => {
        readProjectRole = edaRole;
        cy.createRoleUserAssignments(
          edaProject.id.toString(),
          readProjectRole.id,
          edaUser.id,
          'eda.project'
        );
      });
      cy.platformLogout();
      // login as user without permissions
      cy.contains('Log in');
      cy.get('#pf-login-username-id').type(edaUser.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.contains('button', `${edaUser.username}`).should('be.visible');
      cy.navigateTo('eda', 'projects');
      cy.verifyPageTitle('Projects');
      // verify that the user can read but not create a project
      cy.filterTableByText(edaProject.name);
      cy.contains('tr', edaProject.name);
      cy.get('button')
        .contains(`Create project`)
        .should('have.attr', 'aria-disabled', 'true')
        .click();
      // verify the action buttons are disabled in details view
      cy.clickTableRow(edaProject.name, false);
      cy.get('button').contains(`Edit project`).should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-project').should('have.attr', 'aria-disabled', 'true');
      // logout as normal user
      cy.platformLogout();
      // log back in as admin to delete newly created user
      cy.platformLogin();
    });

    it('user cannot perform any actions other than read on credential', () => {
      let readCredRole: RoleDefinition;
      cy.createEdaRoleDefinition(
        'read-cred-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.edacredential',
        ['eda.view_edacredential']
      ).then((edaRole: RoleDefinition) => {
        readCredRole = edaRole;
        cy.createRoleUserAssignments(
          edaCredential.id.toString(),
          readCredRole.id,
          edaUser.id,
          'eda.edaCredential'
        );
      });
      cy.platformLogout();
      // login as user without permissions
      cy.contains('Log in');
      cy.get('#pf-login-username-id').type(edaUser.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.contains('button', `${edaUser.username}`).should('be.visible');
      cy.navigateTo('eda', 'credentials');
      cy.verifyPageTitle('Credentials');
      // verify that the user can read but not create a credential
      cy.contains('tr', edaCredential.name);
      cy.get('button')
        .contains(`Create credential`)
        .should('have.attr', 'aria-disabled', 'true')
        .click();
      // verify the action buttons are disabled in details view
      cy.clickTableRow(edaCredential.name, false);
      cy.get('button').contains(`Edit credential`).should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-credential').should('have.attr', 'aria-disabled', 'true');
      // logout as normal user
      cy.platformLogout();
      // log back in as admin to delete newly created user
      cy.platformLogin();
    });

    it('user cannot perform any actions other than read on event stream', () => {
      let readCredRole: RoleDefinition;
      cy.createEdaRoleDefinition(
        'read-es-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.edacredential',
        ['eda.view_edacredential']
      ).then((edaRole: RoleDefinition) => {
        readCredRole = edaRole;
        cy.createRoleUserAssignments(
          edaCredential.id.toString(),
          readCredRole.id,
          edaUser.id,
          'eda.edaCredential'
        );
      });
      cy.platformLogout();
      // login as user without permissions
      cy.contains('Log in');
      cy.get('#pf-login-username-id').type(edaUser.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.contains('button', `${edaUser.username}`).should('be.visible');
      cy.navigateTo('eda', 'credentials');
      cy.verifyPageTitle('Credentials');
      // verify that the user can read but not create a credential
      cy.contains('tr', edaCredential.name);
      cy.get('button')
        .contains(`Create credential`)
        .should('have.attr', 'aria-disabled', 'true')
        .click();
      // verify the action buttons are disabled in details view
      cy.clickTableRow(edaCredential.name, false);
      cy.get('button').contains(`Edit credential`).should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-credential').should('have.attr', 'aria-disabled', 'true');
      // logout as normal user
      cy.platformLogout();
      // log back in as admin to delete newly created user
      cy.platformLogin();
    });
  });
});
