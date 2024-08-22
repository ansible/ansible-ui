import { randomString } from '../../../../framework/utils/random-string';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { LogLevelEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { cyLabel } from '../../../support/cyLabel';
import { EdaCredentialType } from '../../../../frontend/eda/interfaces/EdaCredentialType';
import { RoleDefinition } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { EdaUser } from '../../../../frontend/eda/interfaces/EdaUser';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';

cyLabel(['upstream'], () => {
  describe('Users - Enable Action buttons', () => {
    let edaProject: EdaProject;
    let edaUser1: EdaUser;
    let readProjectRole: RoleDefinition;
    let readActivationRole: RoleDefinition;
    let readDERole: RoleDefinition;
    let readCredTypeRole: RoleDefinition;
    let readCredRole: RoleDefinition;
    let edaUserforID: EdaUser;
    let edaOrg: EdaOrganization;
    let edaRuleBook: EdaRulebook;
    let edadecisionEnvironment: EdaDecisionEnvironment;
    let RBA: EdaRulebookActivation;
    let edaCredentialType: EdaCredentialType;
    let edaCredential: EdaCredential;
    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
      });
      cy.createEdaProject(edaOrg?.id).then((project) => {
        edaProject = project;
        cy.waitEdaProjectSync(project);
        cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
          edaRuleBook = edaRuleBooks[0];
          cy.createEdaDecisionEnvironment(edaOrg?.id).then((decisionEnvironment) => {
            edadecisionEnvironment = decisionEnvironment;
            cy.createEdaRulebookActivation({
              rulebook_id: edaRuleBook.id,
              decision_environment_id: decisionEnvironment.id,
              k8s_service_name: 'sample',
              log_level: LogLevelEnum.Error,
            }).then((edaRulebookActivation) => {
              RBA = edaRulebookActivation;
              cy.createEdaUser({ password: 'pass' }).then((user) => {
                edaUser1 = user;
                cy.createEdaCredentialType().then((credentialtype) => {
                  edaCredentialType = credentialtype;
                  cy.createEdaCredential().then((credential) => {
                    edaCredential = credential;
                  });
                });
              });
            });
          });
        });
      });
    });

    after(() => {
      // cy.deleteEdaRulebookActivation(RBA);
      // cy.deleteEdaDecisionEnvironment(edadecisionEnvironment);
      // cy.deleteEdaProject(edaProject);
      // cy.deleteEdaUser(edaUser1);
      // cy.deleteEdaOrganization(edaOrg);
      // cy.deleteEdaCredential(edaCredential);
      // cy.deleteEdaCredentialType(edaCredentialType);
      // cy.deleteEdaRoleDefinition(readProjectRole);
      // cy.deleteEdaRoleDefinition(readActivationRole);
      // cy.deleteEdaRoleDefinition(readDERole);
      // cy.deleteEdaRoleDefinition(readCredTypeRole);
      // cy.deleteEdaRoleDefinition(readCredRole);
    });

    it('user cannot perform any actions other than read on RBA', () => {
      cy.createEdaRoleDefinition(
        'read-rba-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.activation',
        ['eda.view_activation']
      ).then((edaRole: RoleDefinition) => {
        cy.getEdaUserbyName(edaUser1.username).then((user) => {
          edaUserforID = user;
          readActivationRole = edaRole;
          cy.createRoleUserAssignments(
            RBA.id.toString(),
            readActivationRole.id,
            edaUserforID.id,
            'eda.activation'
          );
        });
      });
      cy.logout();
      // login as user without permissions
      cy.contains('Log in');
      cy.wait(1); // Seems like sometimes when the page first comes up that the login form is not ready
      cy.get('#pf-login-username-id').type(edaUser1.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.getByDataCy('nav-toggle').should('exist');
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser1.username}`);
      cy.navigateTo('eda', 'rulebook-activations');
      cy.verifyPageTitle('Create rulebook activation');
      // verify that the user can read but not create a project
      cy.filterTableByText(RBA.name);
      cy.contains('tr', RBA.name);
      cy.get('button')
        .contains(`Create rulebook activation`)
        .should('have.attr', 'aria-disabled', 'true')
        .click();
      // verify the action buttons are disabled in details view
      cy.clickTableRow(RBA.name);
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-rulebook-activation').should('have.attr', 'aria-disabled', 'true');
      // logout as normal user
      cy.logout();
      // log back in as admin to delete newly created user
      cy.login();
    });

    it('user cannot perform any actions other than read on Decision Environment', () => {
      cy.createEdaRoleDefinition(
        'read-de-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.decisionenvironment',
        ['eda.view_decisionenvironment']
      ).then((edaRole: RoleDefinition) => {
        cy.getEdaUserbyName(edaUser1.username).then((user) => {
          edaUserforID = user;
          readDERole = edaRole;
          cy.createRoleUserAssignments(
            edadecisionEnvironment.id.toString(),
            readDERole.id,
            edaUserforID.id,
            'eda.decisionenvironment'
          );
        });
      });
      cy.logout();
      // login as user without permissions
      cy.contains('Log in');
      cy.wait(1); // Seems like sometimes when the page first comes up that the login form is not ready
      cy.get('#pf-login-username-id').type(edaUser1.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.getByDataCy('nav-toggle').should('exist');
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser1.username}`);
      cy.navigateTo('eda', 'decision-environments');
      cy.verifyPageTitle('Decision Environments');
      // verify that the user can read but not create a decision environment
      cy.filterTableByText(edadecisionEnvironment.name);
      cy.contains('tr', edadecisionEnvironment.name);
      cy.get('button')
        .contains(`Create decision environment`)
        .should('have.attr', 'aria-disabled', 'true')
        .click();
      // verify the action buttons are disabled in details view
      cy.clickTableRow(edadecisionEnvironment.name);
      cy.get('button')
        .contains('Edit decision environment')
        .should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-decision-environment').should('have.attr', 'aria-disabled', 'true');
      // logout as normal user
      cy.logout();
      // log back in as admin to delete newly created user
      cy.login();
    });

    it('user cannot perform any actions other than read on Project', () => {
      cy.createEdaRoleDefinition(
        'read-project-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.project',
        ['eda.view_project']
      ).then((edaRole: RoleDefinition) => {
        cy.getEdaUserbyName(edaUser1.username).then((user) => {
          edaUserforID = user;
          readProjectRole = edaRole;
          cy.createRoleUserAssignments(
            edaProject.id.toString(),
            readProjectRole.id,
            edaUserforID.id,
            'eda.project'
          );
        });
      });
      cy.logout();
      // login as user without permissions
      cy.contains('Log in');
      cy.wait(1); // Seems like sometimes when the page first comes up that the login form is not ready
      cy.get('#pf-login-username-id').type(edaUser1.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.getByDataCy('nav-toggle').should('exist');
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser1.username}`);
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
      cy.clickTableRow(edaProject.name);
      cy.get('button').contains(`Edit project`).should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-project').should('have.attr', 'aria-disabled', 'true');
      // logout as normal user
      cy.logout();
      // log back in as admin to delete newly created user
      cy.login();
    });

    it('user cannot perform any actions other than read on credential type', () => {
      cy.createEdaRoleDefinition(
        'read-cred-type-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.credentialtype',
        ['eda.view_credentialtype']
      ).then((edaRole: RoleDefinition) => {
        cy.getEdaUserbyName(edaUser1.username).then((user) => {
          edaUserforID = user;
          readCredTypeRole = edaRole;
          cy.createRoleUserAssignments(
            edaCredentialType.id.toString(),
            readCredTypeRole.id,
            edaUserforID.id,
            'eda.edaCredentialType'
          );
        });
      });
      cy.logout();
      // login as user without permissions
      cy.contains('Log in');
      cy.wait(1); // Seems like sometimes when the page first comes up that the login form is not ready
      cy.get('#pf-login-username-id').type(edaUser1.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.getByDataCy('nav-toggle').should('exist');
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser1.username}`);
      cy.navigateTo('eda', 'credential-types');
      cy.verifyPageTitle('Credential Types');
      // verify that the user can read but not create a credential type
      cy.contains('tr', edaCredentialType.name);
      cy.get('button')
        .contains(`Create credential type`)
        .should('have.attr', 'aria-disabled', 'true')
        .click();
      // verify the action buttons are disabled in details view
      cy.clickTableRow(edaCredentialType.name, false);
      cy.get('button')
        .contains(`Edit credential type`)
        .should('have.attr', 'aria-disabled', 'true');
      cy.getByDataCy('actions-dropdown').click();
      cy.get('#delete-credential-type').should('have.attr', 'aria-disabled', 'true');
      // logout as normal user
      cy.logout();
      // log back in as admin to delete newly created user
      cy.login();
    });

    it('user cannot perform any actions other than read on credential', () => {
      cy.createEdaRoleDefinition(
        'read-cred-role' + `${randomString(5)}`,
        'This is a Custom Role.',
        'eda.credential',
        ['eda.view_credential']
      ).then((edaRole: RoleDefinition) => {
        cy.getEdaUserbyName(edaUser1.username).then((user) => {
          edaUserforID = user;
          readCredRole = edaRole;
          cy.createRoleUserAssignments(
            edaCredential.id.toString(),
            readCredRole.id,
            edaUserforID.id,
            'eda.edaCredential'
          );
        });
      });
      cy.logout();
      // login as user without permissions
      cy.contains('Log in');
      cy.wait(1); // Seems like sometimes when the page first comes up that the login form is not ready
      cy.get('#pf-login-username-id').type(edaUser1.username);
      cy.get('#pf-login-password-id').type('pass');
      cy.contains('button', 'Log in').click();
      cy.getByDataCy('nav-toggle').should('exist');
      cy.get('[data-ouia-component-id="account-menu"]').should('contain', `${edaUser1.username}`);
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
      cy.logout();
      // log back in as admin to delete newly created user
      cy.login();
    });
  });
});
