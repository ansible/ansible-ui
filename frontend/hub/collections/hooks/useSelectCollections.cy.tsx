import { CollectionVersionSearch } from '../../administration/collection-approvals/Approval';
import { HubItemsResponse } from '../../common/useHubView';
import { CollectionMultiSelectDialog } from './useSelectCollections';

/**
 * TODO: The category and corresponding fixture needs to be changed to "featured".
 * Since we don't have the API to retrieve "featured" collections yet,
 * this is set to "eda" temporarily to be able to view and test the UI.
 */
describe('CollectionMultiSelectDialog', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '**/plugin/ansible/search/collection-versions/*',
        query: {
          offset: '0',
        },
        hostname: 'localhost',
      },
      {
        fixture: 'collection_versions_offset0.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '**/plugin/ansible/search/collection-versions/*',
        query: {
          offset: '10',
        },
        hostname: 'localhost',
      },
      {
        fixture: 'collection_versions_offset10.json',
      }
    );
  });
  it('renders dialog to select collections', () => {
    /**
     * TODO: The category and corresponding fixture needs to be changed to "featured".
     * Since we don't have the API to retrieve "featured" collections yet,
     * this is set to "eda" temporarily to be able to view and test the UI.
     */
    cy.fixture('collection_versions_eda').then(
      (edaCollections: HubItemsResponse<CollectionVersionSearch>) => {
        cy.mount(
          <CollectionMultiSelectDialog
            // eslint-disable-next-line i18next/no-literal-string
            title="Select featured collections content"
            // eslint-disable-next-line i18next/no-literal-string
            description="Please select content below to be shown on the dashboard. Note: The max amount of selections is 12."
            onSelect={async function (collections?: CollectionVersionSearch[]) {
              return new Cypress.Promise((resolve, _) => {
                // Verify number of selections
                expect(collections?.length).to.equal(10);
                resolve(collections);
              });
            }}
            defaultSelection={edaCollections.data}
            maxSelections={12}
            allowZeroSelections
          />
        );
        cy.contains('Select featured collections content').should('be.visible');
        cy.contains(
          'Please select content below to be shown on the dashboard. Note: The max amount of selections is 12.'
        ).should('be.visible');
        cy.clickModalButton('Select');
      }
    );
  });
  it('should display selected items and allow expanding and collapsing labels', () => {
    cy.fixture('collection_versions_eda').then(
      (edaCollections: HubItemsResponse<CollectionVersionSearch>) => {
        cy.mount(
          <CollectionMultiSelectDialog
            // eslint-disable-next-line i18next/no-literal-string
            title="Select featured collections content"
            // eslint-disable-next-line i18next/no-literal-string
            description="Please select content below to be shown on the dashboard. Note: The max amount of selections is 12."
            onSelect={async function (collections?: CollectionVersionSearch[]) {
              return new Cypress.Promise((resolve, _) => {
                resolve(collections);
              });
            }}
            defaultSelection={edaCollections.data}
            maxSelections={12}
            allowZeroSelections
          />
        );
        cy.contains('Selected')
          .next('div.pf-v5-c-label-group')
          .within(() => {
            cy.get('li.pf-v5-c-label-group__list-item').should('have.length', 4);
            cy.get('li.pf-v5-c-label-group__list-item').should('contain', 'test_collection10');
            cy.get('li.pf-v5-c-label-group__list-item').should('contain', 'test_collection9');
            cy.get('li.pf-v5-c-label-group__list-item').should('contain', 'test_collection8');
            cy.get('li.pf-v5-c-label-group__list-item').should('contain', '7 more');
            cy.get('button').contains('7 more').click();
            cy.get('li.pf-v5-c-label-group__list-item').should('have.length', 11);
            cy.get('button').contains('Show Less').click();
            cy.get('li.pf-v5-c-label-group__list-item').should('have.length', 4);
          });
      }
    );
  });

  it.skip('should enable selecting up to a maximum of 12 collections', () => {
    cy.fixture('collection_versions_eda').then(
      (edaCollections: HubItemsResponse<CollectionVersionSearch>) => {
        cy.mount(
          <CollectionMultiSelectDialog
            // eslint-disable-next-line i18next/no-literal-string
            title="Select featured collections content"
            // eslint-disable-next-line i18next/no-literal-string
            description="Please select content below to be shown on the dashboard. Note: The max amount of selections is 12."
            onSelect={async function (collections?: CollectionVersionSearch[]) {
              return new Cypress.Promise((resolve, _) => {
                resolve(collections);
              });
            }}
            defaultSelection={edaCollections.data}
            maxSelections={12}
            allowZeroSelections
          />
        );
        /** Since 10 collections are already selected and bulk selecting on this page
         * will push the selected items over the limit of 12, bulk selection is disabled
         */
        cy.get('div.pf-m-bulk-select').should('contain', '10 selected');
        cy.get('div.pf-m-bulk-select').within(() => {
          cy.get('div.pf-v5-c-dropdown__toggle').should('have.class', 'pf-m-disabled');
        });

        // Select 12 collections
        cy.selectTableRow('test_collection3');
        cy.selectTableRow('test_collection4');
        // Max 12 selections
        cy.get('div.pf-m-bulk-select').should('contain', '12 selected');
        // Remaining checkboxes are disabled after max selections
        cy.getTableRowByText('test_collection5').within(() => {
          cy.get('input[type=checkbox]').should('have.attr', 'disabled');
        });
        // Unselect an existing selection to re-enable the checkboxes
        cy.selectTableRow('test_collection4');
        cy.get('div.pf-m-bulk-select').should('contain', '11 selected');
        cy.getTableRowByText('test_collection5').within(() => {
          cy.get('input[type=checkbox]').should('not.have.attr', 'disabled');
        });
      }
    );
  });
});
