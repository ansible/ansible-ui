//Tests a user's ability within a team to perform certain actions on the Resources toolbar in the EDA UI.
import { EdaCredential } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { EdaEventStream } from '@ansible/eda-ui/interfaces/EdaEventStream';
import { EdaProject } from '@ansible/eda-ui/interfaces/EdaProject';
import { EdaRulebook } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { LogLevelEnum, Organization } from '@ansible/eda-ui/interfaces/generated/eda-api';
import { user_team_access_tab_resources } from '../../../support/constants';
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { gatewayAPI } from '../../../support/formatApiPathForPlatform';

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

  describe('Team Access Tab - Assign Team', () => {
    let edaProject: EdaProject;
    let edaRuleBook: EdaRulebook;
    let edaOrg: Organization;
    let edaCredential: EdaCredential;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRulebookActivation: EdaRulebookActivation;
    let edaEventStream: EdaEventStream;
    let eventStreamCredential: EdaCredential;
    let edaTeam1: PlatformTeam;
    let edaTeam2: PlatformTeam;
    let edaTeam3: PlatformTeam;

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
      cy.createPlatformTeam({ name: `E2E Platform Team ${randomString(5)}`, organization: 1 }).then(
        (team1) => {
          edaTeam1 = team1;
          cy.createPlatformTeam({
            name: `E2E Platform Team ${randomString(5)}`,
            organization: 1,
          }).then((team2) => {
            edaTeam2 = team2;
            cy.createPlatformTeam({
              name: `E2E Platform Team ${randomString(5)}`,
              organization: 1,
            }).then((team3) => {
              edaTeam3 = team3;
            });
          });
        }
      );
    });

    after(() => {
      cy.deleteEdaProject(edaProject);
      cy.deleteEdaOrganization(edaOrg);
      cy.deleteEdaCredential(edaCredential);
      cy.deleteEdaRulebookActivation(edaRulebookActivation);
      cy.deleteEventStream(edaEventStream);
      cy.deleteEdaCredential(eventStreamCredential);
      cy.deletePlatformTeam(edaTeam1);
      cy.deletePlatformTeam(edaTeam2);
      cy.deletePlatformTeam(edaTeam3);
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
          cy.getPlatformRoles().then((rolesArray) => {
            roleIDs = (rolesArray as { [key: string]: number }[]).reduce((acc, role) => {
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

        it(`can assign teams via team access tab`, () => {
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
          cy.get('a[data-cy="assign-teams"]').click();
          cy.verifyPageTitle('Assign teams');
          cy.getTableRowByText(edaTeam1.name, true).within(() => {
            cy.get('input[type=checkbox]').click({ force: true });
          });
          cy.intercept('GET', gatewayAPI`/role_definitions/?*`).as('edaRoles');
          cy.clickButton(/^Next$/);
          cy.wait('@edaRoles');
          cy.getTableRowByText(resource.role, false).within(() => {
            cy.get('input[type=checkbox]').click();
          });
          cy.clickButton(/^Next$/);
          cy.intercept('POST', gatewayAPI`/role_team_assignments/`).as('assignment');
          cy.clickButton(/^Finish$/);
          cy.assertModalSuccess();
          cy.wait('@assignment').then((assignment) => {
            expect(assignment?.response?.statusCode).to.eql(201);
            cy.contains('div', edaTeam1.name);
          });
        });

        it('can bulk remove team assignments', () => {
          cy.navigateTo('eda', resource.name);
          if (resource.name === 'decision-environments') {
            cy.get('[data-cy="table-view"]').click();
            cy.filterTableByTextFilter('name', resource_object.name, {
              disableFilterSelection: true,
            });
            cy.contains('td', resource_object.name).within(() => {
              cy.get('a').click({ force: true });
            });
          } else {
            cy.clickTableRow(resource_object.name, true);
          }
          cy.contains('h1', resource_object.name).should('be.visible');
          cy.clickTab('Team Access', true);
          cy.getTableRowByText(`${edaTeam2.name}`, false).within(() => {
            cy.get('input[type=checkbox]').click();
          });
          cy.getTableRowByText(`${edaTeam3.name}`, false).within(() => {
            cy.get('input[type=checkbox]').click();
          });
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
