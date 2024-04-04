import { TeamAccess } from './TeamAccess';
import { edaAPI } from '../../common/eda-utils';

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
    cy.mount(<TeamAccess id={'1'} type={'activation'} />);
    cy.get('.pf-v5-c-table__th').should('have.length', 5);
    cy.contains('Team');
    cy.contains('Role');
    cy.contains('Role description');
  });

  it('can remove teamAccess', () => {
    cy.mount(<TeamAccess id={'1'} type={'activation'} />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/role_team_assignments/1/` },
      {
        statusCode: 204,
      }
    );
    cy.get('input[id="select-all"]').first().click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-selected-roles"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('Team Assignment 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Remove team assignment').click();
    });
    cy.get('[data-cy="status-column-cell"] > span').contains('Success');
    cy.clickButton(/^Close$/);
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
    cy.mount(<TeamAccess id={'1'} type={'activation'} />);
    cy.contains(/^There are currently no roles assigned to this object.$/);
    cy.contains(/^Please add a role by using the button below.$/);
    // cy.contains('button', /^Add role$/).should('be.visible'); TODO to be added later
  });
});
