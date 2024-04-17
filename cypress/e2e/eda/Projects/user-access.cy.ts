//Tests a user's ability to perform certain actions on the Resources toolbar in the EDA UI.
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaUser } from '../../../../frontend/eda/interfaces/EdaUser';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('User Access Tab - Add User', () => {
  let edaProject: EdaProject;
  let edaUser: EdaUser;
  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
    });
    cy.createEdaUser().then((user) => {
      edaUser = user;
    });
  });

  after(() => {
    cy.deleteEdaProject(edaProject);
    cy.deleteEdaUser(edaUser);
  });

  it('can add users via user access tab', () => {
    cy.navigateTo('eda', 'projects');
    cy.clickTableRow(edaProject.name, true);
    cy.contains('h1', edaProject.name).should('be.visible');
    cy.contains('li', 'User Access').click();
    cy.get('a[data-cy="add-user"]').click();
    cy.selectTableRow(edaUser.username, true);
    cy.clickButton(/^Next$/);
    cy.selectTableRow('Project Admin', false);
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

describe('User Access Tab - actions', () => {
  let roleIDs: { [key: string]: number };
  let ProjectRoleID: number;
  let edaProject: EdaProject;
  let edaUser1: EdaUser;
  let edaUser2: EdaUser;
  let edaUser3: EdaUser;
  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
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
              ProjectRoleID = roleIDs['Project Admin'];
              cy.createRoleUserAssignments(project.id.toString(), ProjectRoleID, user1.id);
              cy.createRoleUserAssignments(project.id.toString(), ProjectRoleID, user2.id);
              cy.createRoleUserAssignments(project.id.toString(), ProjectRoleID, user3.id);
            });
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteEdaProject(edaProject);
    cy.deleteEdaUser(edaUser1);
    cy.deleteEdaUser(edaUser2);
    cy.deleteEdaUser(edaUser3);
  });

  it('can remove user from row', () => {
    cy.navigateTo('eda', 'projects');
    cy.clickTableRow(edaProject.name, true);
    cy.contains('h1', edaProject.name).should('be.visible');
    cy.contains('li', 'User Access').click();
    cy.getTableRowByText(`${edaUser1.username}`, false).within(() => {
      cy.get('[data-cy="remove-user"]').click();
    });
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove user assignment');
    cy.clickButton(/^Close$/);
    cy.contains(edaUser1.username).should('not.exist');
  });

  it('can bulk remove user assignments', () => {
    cy.navigateTo('eda', 'projects');
    cy.clickTableRow(edaProject.name, true);
    cy.contains('h1', edaProject.name).should('be.visible');
    cy.contains('li', 'User Access').click();
    cy.selectTableRow(`${edaUser2.username}`, false);
    cy.selectTableRow(`${edaUser3.username}`, false);
    cy.clickToolbarKebabAction('delete-selected-user');
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove user assignment');
    cy.clickButton(/^Close$/);
    cy.contains(edaUser2.username).should('not.exist');
    cy.contains(edaUser3.username).should('not.exist');
  });
});
