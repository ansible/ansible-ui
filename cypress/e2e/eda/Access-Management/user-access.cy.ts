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
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { EdaEventStream } from '../../../../frontend/eda/interfaces/EdaEventStream';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { Settings } from '../../../../frontend/awx/interfaces/Settings';
import { SAAS_URL } from '../../../support/constants';

describe('If SaaS Build', () => {
  before(function () {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      const saasBaseUrl = data.TOWER_URL_BASE;
      const parseSaas = saasBaseUrl.split('.').slice(2).join('.').toString();
      if (parseSaas === SAAS_URL) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('User Access Tab - Add User', () => {
    let edaProject: EdaProject;
    let edaRuleBook: EdaRulebook;
    let edaOrg: EdaOrganization;
    let edaCredential: EdaCredential;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRulebookActivation: EdaRulebookActivation;
    let edaEventStream: EdaEventStream;
    let eventStreamCredential: EdaCredential;
    let edaUser1: EdaUser;
    let edaUser2: EdaUser;
    let edaUser3: EdaUser;

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
      cy.createEdaUser().then((user1) => {
        edaUser1 = user1;
        cy.createEdaUser().then((user2) => {
          edaUser2 = user2;
          cy.createEdaUser().then((user3) => {
            edaUser3 = user3;
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
      cy.deleteEdaUser(edaUser1);
      cy.deleteEdaUser(edaUser2);
      cy.deleteEdaUser(edaUser3);
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
            cy.createRoleUserAssignments(
              resource_object.id.toString(),
              RoleID,
              edaUser1.id,
              resource.content_type
            );
            cy.createRoleUserAssignments(
              resource_object.id.toString(),
              RoleID,
              edaUser2.id,
              resource.content_type
            );
            cy.createRoleUserAssignments(
              resource_object.id.toString(),
              RoleID,
              edaUser3.id,
              resource.content_type
            );
          });
        });

        it(`can add users via user access tab`, () => {
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
          cy.clickTab('User Access', true);
          cy.get('a[data-cy="add-roles"]').click();
          cy.selectTableRow(edaUser1.username, true);
          cy.intercept('GET', edaAPI`/role_definitions/*`).as('edaRoles');
          cy.clickButton(/^Next$/);
          cy.wait('@edaRoles');
          cy.selectTableRow(resource.role, false);
          cy.clickButton(/^Next$/);
          cy.intercept('POST', edaAPI`/role_user_assignments/`).as('assignment');
          cy.clickButton(/^Finish$/);
          cy.assertModalSuccess();
          cy.clickButton(/^Close$/);
          cy.wait('@assignment').then((assignment) => {
            expect(assignment?.response?.statusCode).to.eql(201);
            cy.contains('div', edaUser1.username);
          });
        });

        it('can remove user from row', () => {
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
          cy.clickTab('User Access', true);
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
          cy.clickTab('User Access', true);
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
  });
});
