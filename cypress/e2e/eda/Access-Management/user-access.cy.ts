//Tests a user's ability to perform certain actions on the Resources toolbar in the EDA UI.
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
  describe(`User Access Tab for ${resource.name} - Add User`, () => {
    let edaUser: EdaUser;
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
      cy.createEdaUser().then((user) => {
        edaUser = user;
      });
    });

    after(() => {
      resource.deletion(resource_object);
      cy.deleteEdaUser(edaUser);
    });

    it('can add users via user access tab', () => {
      cy.navigateTo('eda', resource.name);
      // filter resource by name not available for decision environment
      // or credential type
      if (resource.name === 'decision-environments') {
        cy.get('[data-cy="table-view"]').click();
        cy.filterTableByTextFilter('name', resource_object.name, { disableFilterSelection: true });
        cy.contains('td', resource_object.name).within(() => {
          cy.get('a').click();
        });
      } else {
        cy.clickTableRow(resource_object.name, true);
      }
      cy.contains('h1', resource_object.name).should('be.visible');
      cy.contains('li', 'User Access').click();
      cy.get('a[data-cy="add-roles"]').click();
      cy.selectTableRow(edaUser.username, true);
      cy.clickButton(/^Next$/);
      cy.selectTableRow(resource.role, false);
      cy.clickButton(/^Next$/);
      cy.intercept('POST', edaAPI`/role_user_assignments/`).as('assignment');
      cy.clickButton(/^Finish$/);
      cy.assertModalSuccess();
      cy.clickButton(/^Close$/);
      cy.wait('@assignment').then((assignment) => {
        expect(assignment?.response?.statusCode).to.eql(201);
        cy.contains('div', edaUser.username);
      });
      cy.deleteEdaUser(edaUser);
    });
  });

  describe(`User Access Tab for ${resource.name} - actions`, () => {
    let roleIDs: { [key: string]: number };
    let RoleID: number;
    let resource_object:
      | EdaProject
      | EdaDecisionEnvironment
      | EdaRulebookActivation
      | EdaCredential;
    let edaUser1: EdaUser;
    let edaUser2: EdaUser;
    let edaUser3: EdaUser;
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
            cy.waitEdaProjectSync(resource_object as EdaProject);
          }
        });
      }
      cy.createEdaUser().then((user1) => {
        edaUser1 = user1;
        cy.createEdaUser().then((user2) => {
          edaUser2 = user2;
          cy.createEdaUser().then((user3) => {
            edaUser3 = user3;
            cy.getEdaRoles().then((rolesArray) => {
              roleIDs = rolesArray.reduce((acc, role) => {
                const { name, id } = role;
                return { ...acc, [name]: id };
              }, {});
              RoleID = roleIDs[resource.role];
              cy.createRoleUserAssignments(
                resource_object.id.toString(),
                RoleID,
                user1.id,
                resource.content_type
              );
              cy.createRoleUserAssignments(
                resource_object.id.toString(),
                RoleID,
                user2.id,
                resource.content_type
              );
              cy.createRoleUserAssignments(
                resource_object.id.toString(),
                RoleID,
                user3.id,
                resource.content_type
              );
            });
          });
        });
      });
    });

    after(() => {
      resource.deletion(resource_object);
      cy.deleteEdaUser(edaUser1);
      cy.deleteEdaUser(edaUser2);
      cy.deleteEdaUser(edaUser3);
    });

    it('can remove user from row', () => {
      cy.navigateTo('eda', resource.name);
      // filter resource by name not available for decision environment
      // or credential type
      if (resource.name === 'decision-environments') {
        cy.get('[data-cy="table-view"]').click();
        cy.filterTableByTextFilter('name', resource_object.name, { disableFilterSelection: true });
        cy.contains('td', resource_object.name).within(() => {
          cy.get('a').click();
        });
      } else {
        cy.clickTableRow(resource_object.name, true);
      }
      cy.contains('h1', resource_object.name).should('be.visible');
      cy.contains('li', 'User Access').click();
      cy.getTableRowByText(`${edaUser1.username}`, false).within(() => {
        cy.get('[data-cy="remove-role"]').click();
      });
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Remove role');
      cy.clickButton(/^Close$/);
      cy.contains(edaUser1.username).should('not.exist');
    });

    it('can bulk remove user assignments', () => {
      cy.navigateTo('eda', resource.name);
      // filter resource by name not available for decision environment
      // or credential type
      if (resource.name === 'decision-environments') {
        cy.get('[data-cy="table-view"]').click();
        cy.filterTableByTextFilter('name', resource_object.name, { disableFilterSelection: true });
        cy.contains('td', resource_object.name).within(() => {
          cy.get('a').click();
        });
      } else {
        cy.clickTableRow(resource_object.name, true);
      }
      cy.contains('h1', resource_object.name).should('be.visible');
      cy.contains('li', 'User Access').click();
      cy.selectTableRow(`${edaUser2.username}`, false);
      cy.selectTableRow(`${edaUser3.username}`, false);
      cy.clickToolbarKebabAction('remove-roles');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Remove role');
      cy.clickButton(/^Close$/);
      cy.contains(edaUser2.username).should('not.exist');
      cy.contains(edaUser3.username).should('not.exist');
    });
  });
});
