//Tests a user's ability to perform certain actions on the Resources toolbar in the EDA UI.
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaTeam } from '../../../../frontend/eda/interfaces/EdaTeam';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('Team Access Tab - Add team', () => {
  let edaProject: EdaProject;
  let edaTeam: EdaTeam;
  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
    });
    cy.createEdaTeam().then((team) => {
      edaTeam = team;
    });
  });

  after(() => {
    cy.deleteEdaProject(edaProject);
    cy.deleteEdaTeam(edaTeam);
  });

  it('can add teams via team access tab', () => {
    cy.navigateTo('eda', 'projects');
    cy.clickTableRow(edaProject.name, true);
    cy.contains('h1', edaProject.name).should('be.visible');
    cy.contains('li', 'Team Access').click();
    cy.get('a[data-cy="add-team"]').click();
    cy.selectTableRow(edaTeam.name, true);
    cy.clickButton(/^Next$/);
    cy.selectTableRow('Project Admin', false);
    cy.clickButton(/^Next$/);
    cy.intercept('POST', edaAPI`/role_team_assignments/`).as('assignment');
    cy.clickButton(/^Finish$/);
    cy.assertModalSuccess();
    cy.clickButton(/^Close$/);
    cy.wait('@assignment').then((assignment) => {
      expect(assignment?.response?.statusCode).to.eql(201);
      cy.contains('div', edaTeam.name);
    });
    cy.deleteEdaTeam(edaTeam);
  });
});

describe('Team Access Tab - actions', () => {
  let roleIDs: { [key: string]: string };
  let ProjectRoleID: string;
  let edaProject: EdaProject;
  let edaTeam1: EdaTeam;
  let edaTeam2: EdaTeam;
  let edaTeam3: EdaTeam;
  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
      cy.createEdaTeam().then((team1) => {
        edaTeam1 = team1;
        cy.createEdaTeam().then((team2) => {
          edaTeam2 = team2;
          cy.createEdaTeam().then((team3) => {
            edaTeam3 = team3;
            cy.getEdaRoles().then((rolesArray) => {
              roleIDs = rolesArray.reduce((acc, role) => {
                const { name, id } = role;
                return { ...acc, [name]: id };
              }, {});
              ProjectRoleID = roleIDs['Project Admin'];
              cy.createRoleTeamAssignments(
                project.id.toString(),
                ProjectRoleID,
                team1.id.toString()
              );
              cy.createRoleTeamAssignments(
                project.id.toString(),
                ProjectRoleID,
                team2.id.toString()
              );
              cy.createRoleTeamAssignments(
                project.id.toString(),
                ProjectRoleID,
                team3.id.toString()
              );
            });
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteEdaProject(edaProject);
    cy.deleteEdaTeam(edaTeam1);
    cy.deleteEdaTeam(edaTeam2);
    cy.deleteEdaTeam(edaTeam3);
  });

  it('can remove team from row', () => {
    cy.navigateTo('eda', 'projects');
    cy.clickTableRow(edaProject.name, true);
    cy.contains('h1', edaProject.name).should('be.visible');
    cy.contains('li', 'Team Access').click();
    cy.getTableRowByText(`${edaTeam1.name}`, false).within(() => {
      cy.get('[data-cy="remove-team"]').click();
    });
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove team assignment');
    cy.clickButton(/^Close$/);
    cy.contains(edaTeam1.name).should('not.exist');
  });

  it('can bulk remove team assignments', () => {
    cy.navigateTo('eda', 'projects');
    cy.clickTableRow(edaProject.name, true);
    cy.contains('h1', edaProject.name).should('be.visible');
    cy.contains('li', 'Team Access').click();
    cy.selectTableRow(`${edaTeam2.name}`, false);
    cy.selectTableRow(`${edaTeam3.name}`, false);
    cy.clickToolbarKebabAction('delete-selected-team');
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove team assignment');
    cy.clickButton(/^Close$/);
    cy.contains(edaTeam2.name).should('not.exist');
    cy.contains(edaTeam3.name).should('not.exist');
  });
});
