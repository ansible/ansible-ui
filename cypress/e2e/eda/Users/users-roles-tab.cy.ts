//Tests a user's ability to give permissions to a user from the roles tab.
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaUser } from '../../../../frontend/eda/interfaces/EdaUser';
import { LogLevelEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { user_team_access_tab_resources } from '../../../support/constants';
import { edaAPI } from '../../../support/formatApiPathForEDA';

user_team_access_tab_resources.forEach((resource) => {
  // fails due to filtering bug https://issues.redhat.com/browse/AAP-24181
  describe.skip(`Assign Role to a User `, () => {
    let user: EdaUser;
    let resource_object:
      | EdaProject
      | EdaDecisionEnvironment
      | EdaRulebookActivation
      | EdaCredential;
    before(() => {
      // If the resource is a RBA, create all dependency resources, else just the one resource
      if (resource.name === 'rulebook-activations') {
        let edaProject: EdaProject;
        let edaRuleBook: EdaRulebook;
        cy.createEdaProject().then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
              cy.createEdaRulebookActivation({
                rulebook_id: edaRuleBook.id,
                decision_environment_id: decisionEnvironment.id,
                k8s_service_name: 'sample',
                log_level: LogLevelEnum.Error,
              }).then((edaRulebookActivation) => {
                resource_object = edaRulebookActivation;
              });
            });
          });
        });
      } else if (resource.creation !== null) {
        resource.creation().then((resource_instance) => {
          resource_object = resource_instance;
          if (resource.name === 'projects') {
            cy.waitEdaProjectSync(resource_instance as EdaProject);
          }
        });
      }
      cy.createEdaUser().then((EdaUser) => {
        user = EdaUser;
      });
    });

    after(() => {
      resource.deletion(resource_object);
      cy.deleteEdaUser(user);
    });

    it(`for ${resource.name} role type`, () => {
      cy.navigateTo('eda', 'users');
      cy.clickTableRow(user.username, true);
      cy.verifyPageTitle(user.username);
      cy.clickTab('Roles', true);
      cy.getByDataCy('add-roles').click();
      cy.getWizard().within(() => {
        cy.selectDropdownOptionByResourceName('resourcetype', resource.roles_tab_name);
        cy.clickButton(/^Next$/);
        // temporary solution due to a bug in filtering
        cy.get('[aria-label="Go to last page"]').click({ force: true });
        cy.selectTableRow(resource_object.name, false);
        cy.clickButton(/^Next$/);
        cy.selectTableRow(resource.role, false);
        cy.clickButton(/^Next$/);
        cy.verifyReviewStepWizardDetails('resources', [resource_object.name], '1');
        cy.intercept('POST', edaAPI`/role_user_assignments/`).as('assignment');
        cy.clickButton(/^Finish$/);
      });
      cy.assertModalSuccess();
      cy.clickButton(/^Close$/);
      cy.wait('@assignment').then((assignment) => {
        expect(assignment?.response?.statusCode).to.eql(201);
        cy.verifyPageTitle(user.username);
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
  before(() => {
    cy.createEdaUser().then((EdaUser) => {
      user = EdaUser;
    });
    cy.createEdaCredential().then((edaCred1) => {
      cred1 = edaCred1;
      cy.createEdaCredential().then((edaCred2) => {
        cred2 = edaCred2;
        cy.createEdaCredential().then((edaCred3) => {
          cred3 = edaCred3;
          cy.getEdaRoles().then((rolesArray) => {
            roleIDs = rolesArray.reduce((acc, role) => {
              const { name, id } = role;
              return { ...acc, [name]: id };
            }, {});
            RoleID = roleIDs['Eda Credential Admin'];
            cy.createRoleUserAssignments(cred1.id.toString(), RoleID, user.id, 'eda.edacredential');
            cy.createRoleUserAssignments(cred2.id.toString(), RoleID, user.id, 'eda.edacredential');
            cy.createRoleUserAssignments(cred3.id.toString(), RoleID, user.id, 'eda.edacredential');
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
    cy.navigateTo('eda', 'users');
    cy.clickTableRow(user.username, true);
    cy.verifyPageTitle(user.username);
    cy.clickTab('Roles', true);
    cy.getTableRowByText(`${cred1.name}`, false).within(() => {
      cy.get('[data-cy="remove-role"]').click();
    });
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove role');
    cy.clickButton(/^Close$/);
    cy.contains(cred1.name).should('not.exist');
  });

  it('can bulk remove roles', () => {
    cy.navigateTo('eda', 'users');
    cy.clickTableRow(user.username, true);
    cy.verifyPageTitle(user.username);
    cy.clickTab('Roles', true);
    cy.selectTableRow(`${cred2.name}`, false);
    cy.selectTableRow(`${cred3.name}`, false);
    cy.clickToolbarKebabAction('remove-roles');
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove role');
    cy.clickButton(/^Close$/);
    cy.contains(cred2.name).should('not.exist');
    cy.contains(cred3.name).should('not.exist');
  });
});
