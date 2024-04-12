import * as useOptions from '../../../common/crud/useOptions';
import { InstanceGroups } from './InstanceGroups';

describe('Instance Groups List', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/instance_groups/*',
        },
        {
          fixture: 'instance_groups.json',
        }
      );
    });
    it('Instance groups list renders', () => {
      cy.mount(<InstanceGroups />);
      cy.verifyPageTitle('Instance Groups');
      cy.get('tbody').find('tr').should('have.length', 3);
    });
    it('Filter instance groups by name', () => {
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/instance_groups/' },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<InstanceGroups />);
      cy.filterTableBySingleSelect('name', 'default');
      cy.get('tr').should('have.length.greaterThan', 0);
      cy.getByDataCy('filter-input').click();
      cy.clickButton(/^Clear all filters$/);
    });
    it('Create group button is disabled if the user does not have permission to create instance groups', () => {
      cy.mount(<InstanceGroups />);
      cy.get('button[data-cy="create-group"]').should('have.attr', 'disabled');
    });
    it('Delete instance group row action is disabled if the user does not have permission to edit instance groups', () => {
      cy.mount(<InstanceGroups />);
      cy.contains('tr', 'Container Group 01').within(() => {
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete container group$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
    });
    it('Edit instance group row action is disabled if the user does not have permission to edit instance groups', () => {
      cy.mount(<InstanceGroups />);
      cy.contains('tr', 'Container Group 01').within(() => {
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="edit-container-group"]`).should('have.attr', 'aria-disabled', 'true');
        });
      });
    });
    it('Create Group button is enabled if the user has permission to create instance groups', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this instance group.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<InstanceGroups />);
      cy.get('button[data-cy="create-group"]').should('not.have.attr', 'disabled');
    });
    it('Displays error if instance groups are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/instance_groups/*',
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<InstanceGroups />);
      cy.contains('Error loading instance groups');
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/instance_groups/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create instance groups', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this instance group.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<InstanceGroups />);
      cy.contains(/^No instance groups yet$/);
      cy.contains(/^Please create an instance group by using the button below.$/);
      cy.contains('button', /^Create group$/).should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create instance groups', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<InstanceGroups />);
      cy.contains(/^You do not have permission to create an instance group.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.get('button[data-cy="create-group"]').should('not.exist');
    });
  });
});
