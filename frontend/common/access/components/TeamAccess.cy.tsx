import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { TeamAccess } from './TeamAccess';

describe('TeamAccess.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/role_team_assignments/*` },
      {
        count: 1,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            id: 1,
            summary_fields: {
              object_role: {
                id: 1,
              },
              role_definition: {
                id: 13,
                name: 'Activation Admin',
                description:
                  'Has all permissions to a single activation and its child resources - rulebook process, audit rule',
                managed: true,
              },
              team: {
                id: 4,
                name: 'Team Assignment 1',
              },
            },
            object_role: 1,
            role_definition: 13,
            team: 4,
          },
        ],
      }
    );
  });

  it('Renders the correct teamAccess columns', () => {
    cy.mount(<TeamAccess service="eda" id={'1'} type={'activation'} addRolesRoute="xyz" />);
    cy.contains('Team Assignment 1');
    cy.contains('Activation Admin');
    cy.contains('Team name');
    cy.contains('Role');
    cy.get('[data-cy="remove-role"]').should('exist');
  });

  it('can remove teamAccess', () => {
    cy.mount(<TeamAccess service="eda" id={'1'} type={'activation'} addRolesRoute="xyz" />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/role_team_assignments/1/` },
      {
        statusCode: 204,
      }
    );
    cy.getByDataCy('select-all').check();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="remove-roles"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('Team Assignment 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Remove role').click();
    });
    cy.get('[data-cy="status-column-cell"] > span').contains('Success');
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/eda/v1/role_team_assignments/*',
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<TeamAccess service="eda" id={'1'} type={'activation'} addRolesRoute="xyz" />);
    cy.contains(/^No teams assigned to rulebook activation$/);
    cy.contains(/^To get started, assign teams to this rulebook activation.$/);
    cy.contains('a[data-cy="assign-teams"]', /^Assign teams$/).should('be.visible');
  });
});
