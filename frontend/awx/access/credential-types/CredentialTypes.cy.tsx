import * as useOptions from '../../../common/crud/useOptions';
import { CredentialTypes } from './CredentialTypes';

describe('Credential Types List', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/credential_types/*',
        },
        {
          fixture: 'credentialTypes.json',
        }
      );
    });

    it('Credential types list renders', () => {
      cy.mount(<CredentialTypes />);
      cy.verifyPageTitle('Credential Types');
      cy.get('tbody').find('tr').should('have.length', 10);
    });

    it('Create Credential Type button is disabled if the user does not have permission to create credential types', () => {
      cy.mount(<CredentialTypes />);
      cy.contains('a', /^Create credential type$/).should('have.attr', 'aria-disabled', 'true');
    });

    it('Delete credential type row action is disabled for a managed credential type', () => {
      cy.mount(<CredentialTypes />);
      cy.contains('tr', 'VMware vCenter').within(() => {
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete credential type$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
    });

    it('Delete credential type row action is disabled if the user does not have permission to edit credential types', () => {
      cy.mount(<CredentialTypes />);
      cy.contains('tr', 'test').within(() => {
        // user_capabilities.delete: false
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete credential type$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
    });

    it('Edit credential type row action is disabled for a managed credential type', () => {
      cy.mount(<CredentialTypes />);
      cy.contains('tr', 'VMware vCenter').within(() => {
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="edit-credential-type"]`).should('have.attr', 'aria-disabled', 'true');
        });
      });
    });

    it('Edit credential type row action is disabled if the user does not have permission to edit credential types', () => {
      cy.mount(<CredentialTypes />);
      cy.contains('tr', 'test').within(() => {
        // user_capabilities.edit: false
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="edit-credential-type"]`).should('have.attr', 'aria-disabled', 'true');
        });
      });
    });

    it('Create Credential Type button is enabled if the user has permission to create credential types', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this credential type.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<CredentialTypes />);
      cy.contains('a', /^Create credential type$/).should('have.attr', 'aria-disabled', 'false');
    });

    it('Displays error if credential types are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/credential_types/*',
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<CredentialTypes />);
      cy.contains('Error loading credential types');
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/credential_types/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create credential types', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this credential type.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<CredentialTypes />);
      cy.contains(/^There are currently no credential types added.$/);
      cy.contains(/^Please create a credential type by using the button below.$/);
      cy.contains('button', /^Create credential type$/).should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create credential types', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<CredentialTypes />);
      cy.contains(/^You do not have permission to create a credential type.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create credential type$/).should('not.exist');
    });
  });
});
