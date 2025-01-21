//Tests a user's ability to give permissions to a user from the roles tab.
import { EdaCredential } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { EdaEventStream } from '@ansible/eda-ui/interfaces/EdaEventStream';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaProject } from '@ansible/eda-ui/interfaces/EdaProject';
import { EdaRulebook } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import { EdaUser } from '@ansible/eda-ui/interfaces/EdaUser';
import { LogLevelEnum } from '@ansible/eda-ui/interfaces/generated/eda-api';
import { user_team_access_tab_resources } from '../../../support/constants';
import { edaAPI } from '../../../support/formatApiPathForEDA';

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

  describe('Assign Role to a User', () => {
    let edaProject: EdaProject;
    let edaRuleBook: EdaRulebook;
    let edaOrg: EdaOrganization;
    let edaCredential: EdaCredential;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRulebookActivation: EdaRulebookActivation;
    let edaEventStream: EdaEventStream;
    let eventStreamCredential: EdaCredential;
    let edaUser: EdaUser;

    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
        cy.createEdaProject(edaOrg?.id).then((project) => {
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
                edaDecisionEnvironment = decisionEnvironment;
                cy.createEdaRulebookActivation(
                  {
                    rulebook_id: edaRuleBook.id,
                    decision_environment_id: decisionEnvironment.id,
                    k8s_service_name: 'sample',
                    log_level: LogLevelEnum.Error,
                  },
                  edaOrg
                ).then((rba) => {
                  edaRulebookActivation = rba;
                });
              });
            });
          });
        });
        cy.createBasicEventStreamCredential(edaOrg.id).then((credential) => {
          eventStreamCredential = credential;
          cy.createBasicEventStream(credential, edaOrg.id).then((EdaEventStream) => {
            edaEventStream = EdaEventStream;
          });
        });
      });
      cy.createEdaUser().then((EdaUser) => {
        edaUser = EdaUser;
      });
    });

    after(() => {
      cy.deleteEdaProject(edaProject);
      cy.deleteEdaOrganization(edaOrg);
      cy.deleteEdaCredential(edaCredential);
      cy.deleteEdaRulebookActivation(edaRulebookActivation);
      cy.deleteEventStream(edaEventStream);
      cy.deleteEdaCredential(eventStreamCredential);
      cy.deleteEdaUser(edaUser);
    });

    user_team_access_tab_resources.forEach((resource) => {
      describe('give permissions to a user from the roles tab', () => {
        let resource_object:
          | EdaProject
          | EdaDecisionEnvironment
          | EdaRulebookActivation
          | EdaCredential
          | EdaEventStream;
        beforeEach(() => {
          resource_object =
            resource.name === 'projects'
              ? edaProject
              : resource.name === 'decision-environments'
                ? edaDecisionEnvironment
                : resource.name === 'rulebook-activations'
                  ? edaRulebookActivation
                  : resource.name === 'credentials'
                    ? edaCredential
                    : edaEventStream;
        });

        it(`for ${resource.name} role type`, () => {
          cy.navigateTo('platform', 'users');
          cy.clickTableRow(edaUser.username, true);
          cy.verifyPageTitle(edaUser.username);
          cy.clickTab('Roles', true);
          cy.clickTab('Automation Decisions', true);
          cy.getByDataCy('add-roles').click();
          cy.getWizard().within(() => {
            cy.selectDropdownOptionByResourceName('resourcetype', resource.roles_tab_name);
            cy.clickButton(/^Next$/);
            cy.contains('Choose the resources that will be receiving new roles.');
            // due to filtering bug
            cy.setTablePageSize('100');
            cy.getTableRowByText(resource_object.name, false).within(() => {
              cy.get('input[type=checkbox]').click();
            });
            cy.intercept('GET', edaAPI`/role_definitions/*`).as('roleDefinitions');
            cy.clickButton(/^Next$/);
            cy.wait('@roleDefinitions');
            cy.getTableRowByText(resource.role, true).within(() => {
              cy.get('input[type=checkbox]').click();
            });
            cy.clickButton(/^Next$/);
            cy.verifyReviewStepWizardDetails('resources', [resource_object.name], '1');
            cy.intercept('POST', edaAPI`/role_user_assignments/`).as('assignment');
            cy.clickButton(/^Finish$/);
          });
          cy.assertModalSuccess();
          cy.wait('@assignment').then((assignment) => {
            expect(assignment?.response?.statusCode).to.eql(201);
            cy.verifyPageTitle(edaUser.username);
          });
        });
      });
    });
  });

  describe(`Roles Tab for Users - actions`, () => {
    let roleIDs: { [key: string]: number };
    let RoleID: number;
    let user: EdaUser;
    let cred1: EdaCredential;
    let cred2: EdaCredential;
    let cred3: EdaCredential;
    let edaOrg: EdaOrganization;

    before(() => {
      cy.createEdaUser().then((EdaUser) => {
        user = EdaUser;
      });
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
        cy.createEdaCredential(edaOrg.id).then((edaCred1) => {
          cred1 = edaCred1;
          cy.createEdaCredential(edaOrg.id).then((edaCred2) => {
            cred2 = edaCred2;
            cy.createEdaCredential(edaOrg.id).then((edaCred3) => {
              cred3 = edaCred3;
              cy.getEdaRoles().then((rolesArray) => {
                roleIDs = rolesArray.reduce((acc, role) => {
                  const { name, id } = role;
                  return { ...acc, [name]: id };
                }, {});
                RoleID = roleIDs['Eda Credential Admin'];
                cy.createRoleUserAssignments(
                  cred1.id.toString(),
                  RoleID,
                  user.id,
                  'eda.edacredential'
                );
                cy.createRoleUserAssignments(
                  cred2.id.toString(),
                  RoleID,
                  user.id,
                  'eda.edacredential'
                );
                cy.createRoleUserAssignments(
                  cred3.id.toString(),
                  RoleID,
                  user.id,
                  'eda.edacredential'
                );
              });
            });
          });
        });
      });
    });

    after(() => {
      cy.deleteEdaUser(user);
      cy.deleteEdaCredential(cred1);
      cy.deleteEdaCredential(cred2);
      cy.deleteEdaCredential(cred3);
    });

    it('can remove role from row', () => {
      cy.navigateTo('platform', 'users');
      cy.clickTableRow(user.username, true);
      cy.verifyPageTitle(user.username);
      cy.clickTab('Roles', true);
      cy.clickTab('Automation Decisions', true);
      cy.getTableRowByText(`${cred1.name}`, false).within(() => {
        cy.get('[data-cy="remove-role"]').click();
      });
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Remove role');
      cy.contains(cred1.name).should('not.exist');
    });

    it('can bulk remove roles', () => {
      cy.navigateTo('platform', 'users');
      cy.clickTableRow(user.username, true);
      cy.verifyPageTitle(user.username);
      cy.clickTab('Roles', true);
      cy.clickTab('Automation Decisions', true);
      cy.getTableRowByText(cred2.name, false).within(() => {
        cy.get('input[type=checkbox]').click();
      });
      cy.getTableRowByText(cred3.name, false).within(() => {
        cy.get('input[type=checkbox]').click();
      });
      cy.clickToolbarKebabAction('remove-roles');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Remove role');
      cy.contains(cred2.name).should('not.exist');
      cy.contains(cred3.name).should('not.exist');
    });
  });
});
