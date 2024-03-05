import { ToolbarFilterType } from '../../../../framework';
import * as useOptions from '../../../common/crud/useOptions';
import { AwxHost } from '../../interfaces/AwxHost';
import { Hosts } from './Hosts';

describe('Hosts.cy.ts', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/hosts/*',
        },
        {
          fixture: 'hosts.json',
        }
      ).as('hostsList');
    });

    it('should render inventory list', () => {
      cy.mount(<Hosts />);
      cy.verifyPageTitle('Hosts');
      cy.get('table').find('tr').should('have.length', 10);
    });

    it('should have filters for Name, Description, Created By and Modified By', () => {
      cy.mount(<Hosts />);
      cy.intercept('/api/v2/hosts/?description__icontains=Description*').as(
        'descriptionFilterRequest'
      );
      cy.verifyPageTitle('Hosts');
      cy.get('[data-cy="smart-inventory"]').should('have.attr', 'aria-disabled', 'true');
      cy.openToolbarFilterTypeSelect().within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^Description$/).should('be.visible');
        cy.contains(/^Created by$/).should('be.visible');
        cy.contains(/^Modified by$/).should('be.visible');
        cy.contains('button', /^Description$/).click();
      });
      cy.filterTableByText('Description');
      cy.wait('@descriptionFilterRequest');
      cy.get('[data-cy="smart-inventory"]').should('not.be.disabled');
      cy.clickButton(/^Clear all filters$/);
    });

    it('disable "create host" toolbar action if the user does not have permissions', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<Hosts />);
      cy.contains('button', /^Create host$/).as('createButton');
      cy.get('@createButton').should('have.attr', 'aria-disabled', 'true');
      cy.get('@createButton').click({ force: true });
      cy.hasTooltip(
        /^You do not have permission to create a host. Please contact your system administrator if there is an issue with your access.$/
      );
    });

    it('disable delete row action if the user does not have permissions', () => {
      cy.mount(<Hosts />);
      cy.fixture('hosts')
        .then((hosts) => {
          for (let i = 0; i < (hosts.results as AwxHost[]).length; i++) {
            hosts.results[i].summary_fields.user_capabilities.delete = false;
            hosts.results[i].name = 'test';
          }
          return hosts;
        })
        .then((hosts) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/hosts/*',
            },
            { body: hosts }
          );
        })
        .then(() => {
          cy.mount(<Hosts />);
        })
        .then(() => {
          cy.contains('tr', 'test').within(() => {
            cy.get('button.toggle-kebab').click();
            cy.get('.pf-v5-c-dropdown__menu-item')
              .contains(/^Delete host$/)
              .as('deleteButton');
          });
          cy.get('@deleteButton').should('have.attr', 'aria-disabled', 'true');
          cy.get('@deleteButton').click();
          cy.hasTooltip('This cannot be deleted due to insufficient permission');
        });
    });

    it('disable edit row action if the user does not have permissions', () => {
      cy.fixture('hosts')
        .then((hosts) => {
          for (let i = 0; i < (hosts.results as AwxHost[]).length; i++) {
            hosts.results[i].summary_fields.user_capabilities.edit = false;
            hosts.results[i].name = 'test';
          }
          return hosts;
        })
        .then((hosts) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/hosts/*',
            },
            { body: hosts }
          );
        })
        .then(() => {
          cy.mount(<Hosts />);
        })
        .then(() => {
          cy.contains('tr', 'test').within(() => {
            cy.get('button[aria-label="Edit host"]').as('editButton');
          });
          cy.get('@editButton').should('have.attr', 'aria-disabled', 'true');
          cy.get('@editButton').click();
          cy.get('@editButton').hasTooltip('This cannot be edited due to insufficient permission');
        });
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/hosts/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });

    it('display Empty State and create button for user with permission to create hosts', () => {
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
      cy.mount(<Hosts />);
      cy.contains(/^There are currently no hosts added$/);
      cy.contains(/^Please create a host by using the button below.$/);
      cy.contains('button', /^Create host$/).should('be.visible');
      cy.contains('button', /^Create host$/).click();
    });

    it('display Empty state for user without permission to create ', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<Hosts />);
      cy.contains(/^You do not have permission to create a host.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create host$/).should('not.exist');
    });
  });
});
