//Tests a user's ability within a team to perform certain actions on the Resources toolbar in the EDA UI.
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaTeam } from '../../../../frontend/eda/interfaces/EdaTeam';
import { LogLevelEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { user_team_access_tab_resources } from '../../../support/constants';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { EdaEventStream } from '../../../../frontend/eda/interfaces/EdaEventStream';

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

  describe('Team Access Tab - Add Team', () => {
    let edaProject: EdaProject;
    let edaRuleBook: EdaRulebook;
    let edaOrg: EdaOrganization;
    let edaCredential: EdaCredential;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRulebookActivation: EdaRulebookActivation;
    let edaEventStream: EdaEventStream;
    let eventStreamCredential: EdaCredential;
    let edaTeam1: EdaTeam;
    let edaTeam2: EdaTeam;
    let edaTeam3: EdaTeam;

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
      cy.createEdaTeam().then((team1) => {
        edaTeam1 = team1;
        cy.createEdaTeam().then((team2) => {
          edaTeam2 = team2;
          cy.createEdaTeam().then((team3) => {
            edaTeam3 = team3;
          });
        });
      });
    });

    after(() => {
      cy.deleteEdaProject(edaProject);
      cy.deleteEdaOrganization(edaOrg);
      cy.deleteEdaCredential(edaCredential);
      cy.deleteEdaRulebookActivation(edaRulebookActivation);
      cy.deleteEventStream(edaEventStream);
      cy.deleteEdaCredential(eventStreamCredential);
      cy.deleteEdaTeam(edaTeam1);
      cy.deleteEdaTeam(edaTeam2);
      cy.deleteEdaTeam(edaTeam3);
    });

    user_team_access_tab_resources.forEach((resource) => {
      describe(`For ${resource.name}`, () => {
        let resource_object:
          | EdaProject
          | EdaDecisionEnvironment
          | EdaRulebookActivation
          | EdaCredential
          | EdaEventStream;
        let roleIDs: { [key: string]: number };
        let RoleID: number;
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
          cy.getEdaRoles().then((rolesArray) => {
            roleIDs = rolesArray.reduce((acc, role) => {
              const { name, id } = role;
              return { ...acc, [name]: id };
            }, {});
            RoleID = roleIDs[resource.role];
            cy.createRoleTeamAssignments(
              resource_object.id.toString(),
              RoleID,
              edaTeam1.id,
              resource.content_type
            );
            cy.createRoleTeamAssignments(
              resource_object.id.toString(),
              RoleID,
              edaTeam2.id,
              resource.content_type
            );
            cy.createRoleTeamAssignments(
              resource_object.id.toString(),
              RoleID,
              edaTeam3.id,
              resource.content_type
            );
          });
        });

        it(`can add teams via team access tab`, () => {
          cy.navigateTo('eda', resource.name);
          if (resource.name === 'decision-environments') {
            cy.get('[data-cy="table-view"]').click();
            cy.filterTableByTextFilter('name', resource_object.name, {
              disableFilterSelection: true,
            });
            cy.contains('td', resource_object.name).within(() => {
              cy.get('a').click();
            });
          } else {
            cy.clickTableRow(resource_object.name, true);
          }
          cy.contains('h1', resource_object.name).should('be.visible');
          cy.clickTab('Team Access', true);
          cy.get('a[data-cy="add-roles"]').click();
          cy.selectTableRow(edaTeam1.name, true);
          cy.intercept('GET', edaAPI`/role_definitions/?*`).as('edaRoles');
          cy.clickButton(/^Next$/);
          cy.wait('@edaRoles');
          cy.selectTableRow(resource.role, false);
          cy.clickButton(/^Next$/);
          cy.intercept('POST', edaAPI`/role_team_assignments/`).as('assignment');
          cy.clickButton(/^Finish$/);
          cy.assertModalSuccess();
          cy.wait('@assignment').then((assignment) => {
            expect(assignment?.response?.statusCode).to.eql(201);
            cy.contains('div', edaTeam1.name);
          });
        });

        it('can remove team from row', () => {
          cy.navigateTo('eda', resource.name);
          if (resource.name === 'decision-environments') {
            cy.get('[data-cy="table-view"]').click();
            cy.filterTableByTextFilter('name', resource_object.name, {
              disableFilterSelection: true,
            });
            cy.contains('td', resource_object.name).within(() => {
              cy.get('a').click();
            });
          } else {
            cy.clickTableRow(resource_object.name, true);
          }
          cy.contains('h1', resource_object.name).should('be.visible');
          cy.clickTab('Team Access', true);
          cy.getTableRowByText(`${edaTeam1.name}`, false).within(() => {
            cy.get('[data-cy="remove-role"]').click();
          });
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Remove role');
          cy.contains(edaTeam1.name).should('not.exist');
        });

        it('can bulk remove team assignments', () => {
          cy.navigateTo('eda', resource.name);
          if (resource.name === 'decision-environments') {
            cy.get('[data-cy="table-view"]').click();
            cy.filterTableByTextFilter('name', resource_object.name, {
              disableFilterSelection: true,
            });
            cy.contains('td', resource_object.name).within(() => {
              cy.get('a').click();
            });
          } else {
            cy.clickTableRow(resource_object.name, true);
          }
          cy.contains('h1', resource_object.name).should('be.visible');
          cy.clickTab('Team Access', true);
          cy.selectTableRow(`${edaTeam2.name}`, false);
          cy.selectTableRow(`${edaTeam3.name}`, false);
          cy.clickToolbarKebabAction('remove-roles');
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Remove role');
          cy.contains(edaTeam2.name).should('not.exist');
          cy.contains(edaTeam3.name).should('not.exist');
        });
      });
    });
  });
});
