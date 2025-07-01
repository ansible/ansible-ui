import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import * as useOptions from '@ansible/common-ui/crud/useOptions';
import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { Teams } from './Teams';

beforeEach(() => {
  cy.intercept(
    {
      method: 'OPTIONS',
      url: awxAPI`/teams/`,
    },
    {
      fixture: 'mock_options.json',
    }
  ).as('getOptions');
});

describe('Teams.cy.ts', () => {
  describe('Error list', () => {
    it('Displays error if teams are not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: awxAPI`/teams/*` }, { statusCode: 500 });
      cy.mount(<Teams />);
      cy.contains('Error loading teams');
    });
  });

  describe('Non-empty list', () => {
    it('Component renders', () => {
      cy.intercept({ method: 'GET', url: awxAPI`/teams/*` }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
      cy.verifyPageTitle('Teams');
      cy.get('table').find('tr').should('have.length', 4);
    });

    it('Bulk deletion confirmation contains message about selected teams that cannot be deleted', () => {
      // The team with id: 29 in the teams.json fixture has user_capabilities.delete set to false
      cy.intercept({ method: 'GET', url: awxAPI`/teams/*` }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
      cy.getByDataCy('select-all').check();
      cy.clickToolbarKebabAction('delete-teams');
      cy.contains(
        '1 of the selected teams cannot be deleted due to insufficient permissions.'
      ).should('be.visible');
    });

    it('Create Team button is disabled if the user does not have permission to create teams', () => {
      cy.intercept({ method: 'GET', url: awxAPI`/teams/*` }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
      cy.contains('a', /^Create team$/).should('have.attr', 'aria-disabled', 'true');
    });

    it('Create Team button is enabled if the user has permission to create teams', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.MultiText,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this team.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.intercept({ method: 'GET', url: awxAPI`/teams/*` }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
      cy.contains('a', /^Create team$/).should('have.attr', 'aria-disabled', 'false');
    });
  });

  describe('Empty list', () => {
    it('Empty state is displayed correctly for user with permission to create teams', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.MultiText,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this team.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.intercept({ method: 'GET', url: awxAPI`/teams/*` }, { fixture: 'emptyList.json' });
      cy.mount(<Teams />);
      cy.contains(/^No teams found$/);
      cy.contains(/^There are currently no teams assigned to your organization.$/);
      cy.contains('Create team').should('be.visible');
    });

    it('Empty state is displayed correctly for user without permission to create teams', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({ data: { actions: {} } }));
      cy.intercept({ method: 'GET', url: awxAPI`/teams/*` }, { fixture: 'emptyList.json' });
      cy.mount(<Teams />);
      cy.contains(/^No teams found$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('Create team').should('not.exist');
    });
  });
});
