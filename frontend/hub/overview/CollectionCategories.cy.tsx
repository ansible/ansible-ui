import { CollectionVersionSearch } from '../administration/collection-approvals/Approval';
import { HubActiveUserContext } from '../common/useHubActiveUser';
import { HubContextProvider } from '../common/useHubContext';
import { HubItemsResponse } from '../common/useHubView';
import { HubUser } from '../interfaces/expanded/HubUser';
import { CollectionCategoryCarousel } from './CollectionCategories';

describe('CollectionCategories.cy.tsx', () => {
  it('renders carousel with expected cards', () => {
    cy.fixture('application_collection_versions').then(
      (collectionVersionsResponse: HubItemsResponse<CollectionVersionSearch>) => {
        const collections = collectionVersionsResponse.data;
        cy.mount(
          <CollectionCategoryCarousel
            collections={collections}
            category="application"
            searchKey="tags"
            searchValue="application"
          />
        );
        cy.get('.pf-v6-c-card__header').should('contain', 'Application collections');
        cy.get('#page-carousel-cards-application-collections-0').as('carousel');
        cy.get('@carousel')
          .invoke('attr', 'visiblecardsperpage')
          .then((visibleCardsPerPage) => {
            // Based on the viewport size in the cypress config, the carousel will display 2-3 of the 4 cards
            const expectedCount = parseInt(visibleCardsPerPage ?? '0', 10);
            cy.get('@carousel')
              .find('.pf-v6-c-card:visible') // Use :visible to count only displayed cards
              .should('have.length', expectedCount);
          });
        // Total number of cards should still equal 4
        cy.get('#slide-container-application-collections .pf-v6-c-card').should(
          'have.length',
          collections.length
        );
      }
    );
  });

  it('carousel navigation', () => {
    cy.fixture('application_collection_versions').then(
      (collectionVersionsResponse: HubItemsResponse<CollectionVersionSearch>) => {
        const collections = collectionVersionsResponse.data;
        cy.mount(
          <CollectionCategoryCarousel
            collections={collections}
            category="application"
            searchKey="tags"
            searchValue="application"
          />
        );

        cy.get('#page-carousel-cards-application-collections-0').as('carousel');
        cy.get('@carousel')
          .invoke('attr', 'visiblecardsperpage')
          .then((visibleCardsPerPage) => {
            // Based on the viewport size in the cypress config, the carousel will display 2-3 of the 4 cards
            const totalCards = 4;
            const visibleCardsCount = parseInt(visibleCardsPerPage ?? '0', 10);

            cy.get('@carousel')
              .find('.pf-v6-c-card:visible') // Use :visible to count only displayed cards
              .should('have.length', visibleCardsCount);

            // Click to go to page 2
            cy.get('button[aria-label="Navigate to the next page"]').click();

            cy.get(
              'div[id="slide-container-application-collections"] .pf-v6-c-card__title:visible'
            ).should('have.length', totalCards - visibleCardsCount);
          });
      }
    );
  });

  it('renders Manage Content button for platform admin', () => {
    cy.intercept('**/_ui/v1/settings/', { fixture: 'hub_settings.json' });
    cy.intercept('**/_ui/v1/feature-flags/', { fixture: 'hub_feature_flags.json' });
    cy.fixture('hub_admin').then((activeHubUser: HubUser) => {
      cy.fixture('collection_versions_eda').then(
        (collectionVersionsResponse: HubItemsResponse<CollectionVersionSearch>) => {
          const collections = collectionVersionsResponse.data;
          cy.mount(
            <HubActiveUserContext.Provider value={{ activeHubUser }}>
              <HubContextProvider>
                <CollectionCategoryCarousel
                  collections={collections}
                  category="eda"
                  searchKey="tags"
                  searchValue="eda"
                />
              </HubContextProvider>
            </HubActiveUserContext.Provider>
          );
          cy.get('.pf-v6-c-card__footer button').contains('Manage content').should('be.visible');
        }
      );
    });
  });

  it('Manage Content button should not be shown for non-admin user', () => {
    cy.intercept('**/_ui/v1/settings/', { fixture: 'hub_settings.json' });
    cy.intercept('**/_ui/v1/feature-flags/', { fixture: 'hub_feature_flags.json' });
    cy.fixture('hub_admin').then((activeHubUser: HubUser) => {
      activeHubUser.is_superuser = false;
      cy.fixture('collection_versions_eda').then(
        (collectionVersionsResponse: HubItemsResponse<CollectionVersionSearch>) => {
          const collections = collectionVersionsResponse.data;
          cy.mount(
            <HubActiveUserContext.Provider value={{ activeHubUser }}>
              <HubContextProvider>
                <CollectionCategoryCarousel
                  collections={collections}
                  category="eda"
                  searchKey="tags"
                  searchValue="eda"
                />
              </HubContextProvider>
            </HubActiveUserContext.Provider>
          );
          cy.contains('Manage content', 'button').should('not.exist');
        }
      );
    });
  });
});
