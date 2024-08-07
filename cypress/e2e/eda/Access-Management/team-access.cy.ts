//Tests a user's ability to perform certain actions on the Resources toolbar in the EDA UI.
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaCredentialType } from '../../../../frontend/eda/interfaces/EdaCredentialType';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaTeam } from '../../../../frontend/eda/interfaces/EdaTeam';
import { LogLevelEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { user_team_access_tab_resources } from '../../../support/constants';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe.skip('Team Access Tab', () => {
  type ResourceObject =
    | EdaProject
    | EdaDecisionEnvironment
    | EdaRulebookActivation
    | EdaCredential
    | EdaCredentialType;

  user_team_access_tab_resources?.forEach((resource) => {
    describe(`Team Access Tab for ${resource.name} - Add team`, () => {
      let edaTeam: EdaTeam;
      let resource_object: ResourceObject;
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
          resource.creation().then((resource_instance: ResourceObject) => {
            resource_object = resource_instance;
            if (resource.name === 'projects') {
              cy.waitEdaProjectSync(resource_instance as EdaProject);
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
        // filter resource by name not available for decision environment
        // or credential type
        if (resource.name === 'decision-environments') {
          cy.get('[data-cy="table-view"]').click();
          cy.filterTableByTextFilter('name', resource_object.name, {
            disableFilterSelection: true,
          });
          cy.contains('td', resource_object.name).within(() => {
            cy.get('a').click();
          });
        } else {
          if (resource.name === 'credential-types') {
            cy.clickTableRow(resource_object.name, false);
          } else {
            cy.clickTableRow(resource_object.name, true);
          }
        }

        cy.contains('h1', resource_object.name).should('be.visible');
        cy.contains('li', 'Team Access').click();
        cy.get('a[data-cy="add-roles"]').click();
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
      });
    });

    describe(`Team Access Tab for ${resource.name} - actions`, () => {
      let roleIDs: { [key: string]: number };
      let RoleID: number;
      let resource_object:
        | EdaProject
        | EdaDecisionEnvironment
        | EdaRulebookActivation
        | EdaCredential
        | EdaCredentialType;
      let edaTeam1: EdaTeam;
      let edaTeam2: EdaTeam;
      let edaTeam3: EdaTeam;
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
                RoleID = roleIDs[resource.role];
                cy.createRoleTeamAssignments(
                  resource_object.id.toString(),
                  RoleID,
                  team1.id,
                  resource.content_type
                );
                cy.createRoleTeamAssignments(
                  resource_object.id.toString(),
                  RoleID,
                  team2.id,
                  resource.content_type
                );
                cy.createRoleTeamAssignments(
                  resource_object.id.toString(),
                  RoleID,
                  team3.id,
                  resource.content_type
                );
              });
            });
          });
        });
      });
      after(() => {
        resource.deletion(resource_object);
        cy.deleteEdaTeam(edaTeam1);
        cy.deleteEdaTeam(edaTeam2);
        cy.deleteEdaTeam(edaTeam3);
      });

      it('can remove team from row', () => {
        cy.navigateTo('eda', resource.name);
        // filter resource by name not available for decision environment
        // or credential type
        if (resource.name === 'decision-environments') {
          cy.log('in DE');
          cy.get('[data-cy="table-view"]').click();
          cy.filterTableByTextFilter('name', resource_object.name, {
            disableFilterSelection: true,
          });
          cy.contains('td', resource_object.name).within(() => {
            cy.get('a').click();
          });
        } else {
          if (resource.name === 'credential-types') {
            cy.log('in Credential Type');
            cy.clickTableRow(resource_object.name, false);
          } else {
            cy.log('in Else');
            cy.clickTableRow(resource_object.name, true);
          }
        }
        cy.contains('h1', resource_object.name).should('be.visible');
        cy.contains('li', 'Team Access').click();
        cy.getTableRowByText(`${edaTeam1.name}`, false).within(() => {
          cy.get('[data-cy="remove-role"]').click();
        });
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Remove role');
        cy.clickButton(/^Close$/);
        cy.contains(edaTeam1.name).should('not.exist');
      });

      it('can bulk remove team assignments', () => {
        cy.navigateTo('eda', resource.name);
        // filter resource by name not available for decision environment
        // or credential type
        if (resource.name === 'decision-environments') {
          cy.get('[data-cy="table-view"]').click();
          cy.filterTableByTextFilter('name', resource_object.name, {
            disableFilterSelection: true,
          });
          cy.contains('td', resource_object.name).within(() => {
            cy.get('a').click();
          });
        } else {
          if (resource.name === 'credential-types') {
            cy.clickTableRow(resource_object.name, false);
          } else {
            cy.clickTableRow(resource_object.name, true);
          }
        }
        cy.contains('h1', resource_object.name).should('be.visible');
        cy.contains('li', 'Team Access').click();
        cy.selectTableRow(`${edaTeam2.name}`, false);
        cy.selectTableRow(`${edaTeam3.name}`, false);
        cy.clickToolbarKebabAction('remove-roles');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Remove role');
        cy.clickButton(/^Close$/);
        cy.contains(edaTeam2.name).should('not.exist');
        cy.contains(edaTeam3.name).should('not.exist');
      });
    });
  });
});
