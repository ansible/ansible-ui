//Tests a user's ability to perform certain actions on the Resources toolbar in the EDA UI.
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
<<<<<<< HEAD
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaTeam } from '../../../../frontend/eda/interfaces/EdaTeam';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { LogLevelEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { edaAPI } from '../../../support/formatApiPathForEDA';

const resources = [
  {
    "name": "projects",
    "creation": cy.createEdaProject,
    "deletion": cy.deleteEdaProject,
    "role": "Project Admin"
  },
  {
    "name": "decision-environments",
    "creation": cy.createEdaDecisionEnvironment,
    "deletion": cy.deleteEdaDecisionEnvironment,
    "role": "Decision Environment Admin"
  },
  {
    "name": "rulebook-activations",
    "creation": cy.createEdaRulebookActivation,
    "deletion": cy.deleteEdaRulebookActivation,
    "role": "Activation Admin"
  },
  {
    "name": "credentials",
    "creation": cy.createEdaCredential,
    "deletion": cy.deleteEdaCredential,
    "role": "Eda Credential Admin"
  },
  {
    "name": "credential-types",
    "creation": cy.createEdaCredential,
    "deletion": cy.deleteEdaCredential,
    "role": "Eda Credential Admin"
  },  
];

resources.forEach((resource) => {
  describe(`Team Access Tab for ${resource.name} - Add team`, () => {
    let edaTeam: EdaTeam;
    let resource_object: EdaProject 
    | EdaDecisionEnvironment
    | EdaRulebookActivation
    | EdaCredential;
    before(() => {
      cy.edaLogin();
      if (resource.name == "rulebook-activations"){
        let edaProject: EdaProject;
        let edaDecisionEnvironment: EdaDecisionEnvironment;
        let edaRuleBook: EdaRulebook;
        cy.createEdaProject().then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
              edaDecisionEnvironment = decisionEnvironment;
              cy.createEdaRulebookActivation({
                rulebook_id: edaRuleBook.id,
                decision_environment_id: decisionEnvironment.id,
                k8s_service_name: 'sample',
                log_level: LogLevelEnum.error,
              }).then((edaRulebookActivation) => {
                resource_object = edaRulebookActivation;
              });
            });
          });
        });
      }
      else
      {
        resource.creation().then((resource_instance) => {
          resource_object = resource_instance;
          if (resource.name == "projects"){
            cy.waitEdaProjectSync(resource_instance);
          }
        });
      }
      cy.createEdaTeam().then((team) => {
        edaTeam = team;
      });
    });

    after(() => {
      resource.deletion(resource_object);
      cy.deleteEdaTeam(edaTeam);
    });

    it('can add teams via team access tab', () => {
      cy.navigateTo('eda', resource.name);
      if (resource.name == "decision-environments"){
        cy.get('[data-cy="table-view"]').click();
        cy.clickTableRow(resource_object.name, false);
      }
      else {
        cy.clickTableRow(resource_object.name, true);
      }
      cy.contains('h1', resource_object.name).should('be.visible');
      cy.contains('li', 'Team Access').click();
      cy.get('a[data-cy="add-team"]').click();
      cy.selectTableRow(edaTeam.name, true);
      cy.clickButton(/^Next$/);
      cy.selectTableRow(resource.role, false);
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

  describe(`Team Access Tab for ${resource.name} - actions`, () => {
    let roleIDs: { [key: string]: number };
    let RoleID: number;
    let resource_object: EdaProject 
    | EdaDecisionEnvironment
    | EdaRulebookActivation
    | EdaCredential;
    let edaTeam1: EdaTeam;
    let edaTeam2: EdaTeam;
    let edaTeam3: EdaTeam;
    before(() => {
      cy.edaLogin();
      if (resource.name == "rulebook-activations"){
        let edaProject: EdaProject;
        let edaDecisionEnvironment: EdaDecisionEnvironment;
        let edaRuleBook: EdaRulebook;
        cy.createEdaProject().then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
              edaDecisionEnvironment = decisionEnvironment;
              cy.createEdaRulebookActivation({
                rulebook_id: edaRuleBook.id,
                decision_environment_id: decisionEnvironment.id,
                k8s_service_name: 'sample',
                log_level: LogLevelEnum.error,
              }).then((edaRulebookActivation) => {
                resource_object = edaRulebookActivation;
              });
            });
          });
        });
      }
      else
      {
        resource.creation().then((resource_instance) => {
          resource_object = resource_instance;
          if (resource.name == "projects"){
            cy.waitEdaProjectSync(resource_object);
          }
        });
      }
=======
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
  let roleIDs: { [key: string]: number };
  let ProjectRoleID: number;
  let edaProject: EdaProject;
  let edaTeam1: EdaTeam;
  let edaTeam2: EdaTeam;
  let edaTeam3: EdaTeam;
  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
>>>>>>> 736af524 (add custom commands and user access tab tests)
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
<<<<<<< HEAD
              RoleID = roleIDs[resource.role];
              cy.createRoleTeamAssignments(resource_object.id.toString(), RoleID, team1.id);
              cy.createRoleTeamAssignments(resource_object.id.toString(), RoleID, team2.id);
              cy.createRoleTeamAssignments(resource_object.id.toString(), RoleID, team3.id);
=======
              ProjectRoleID = roleIDs['Project Admin'];
<<<<<<< HEAD
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
>>>>>>> 736af524 (add custom commands and user access tab tests)
=======
              cy.createRoleTeamAssignments(project.id.toString(), ProjectRoleID, team1.id);
              cy.createRoleTeamAssignments(project.id.toString(), ProjectRoleID, team2.id);
              cy.createRoleTeamAssignments(project.id.toString(), ProjectRoleID, team3.id);
>>>>>>> 067459c2 (eslint/tsc fixes)
            });
          });
        });
      });
    });
<<<<<<< HEAD

    after(() => {
      resource.deletion(resource_object);
      cy.deleteEdaTeam(edaTeam1);
      cy.deleteEdaTeam(edaTeam2);
      cy.deleteEdaTeam(edaTeam3);
    });

    it('can remove team from row', () => {
      cy.navigateTo('eda', resource.name);
      if (resource.name == "decision-environments"){
        cy.get('[data-cy="table-view"]').click();
        cy.clickTableRow(resource_object.name, false);
      }
      else {
        cy.clickTableRow(resource_object.name, true);
      }
      cy.contains('h1', resource_object.name).should('be.visible');
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
      cy.navigateTo('eda', resource.name);
      if (resource.name == "decision-environments"){
        cy.get('[data-cy="table-view"]').click();
        cy.clickTableRow(resource_object.name, false);
      }
      else{
        cy.clickTableRow(resource_object.name, true);
      }
      cy.contains('h1', resource_object.name).should('be.visible');
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
});
=======
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
>>>>>>> 736af524 (add custom commands and user access tab tests)
