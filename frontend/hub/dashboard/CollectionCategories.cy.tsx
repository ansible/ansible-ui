import { CollectionVersionSearch } from '../approvals/Approval';
import { HubUser, HubContextProvider } from '../useHubContext';
import { HubItemsResponse } from '../useHubView';
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
        cy.get('.pf-c-card__header').should('contain', 'Application collections');
        // Based on the viewport size in the cypress config, the carousel will display 3 of the 4 cards
        cy.get('div[id="page-carousel-cards-application-collections-0"]').within(() => {
          cy.get('article.pf-c-card').should('have.length', 3);
        });
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
        // The 4th collection card should not be visible at first
        cy.contains(
          'div[id="slide-container-application-collections"] div.pf-c-card__title',
          collections[3].collection_version.name
        ).should('not.be.visible');
        // Navigate to next page in the carousel to view the 4th card
        cy.get('button[aria-label="Navigate to the next page"]').click();
        cy.contains(
          'div[id="slide-container-application-collections"] div.pf-c-card__title',
          collections[3].collection_version.name
        ).should('be.visible');
      }
    );
  });

  it('renders Manage Content button for platform admin', () => {
    cy.intercept('**/_ui/v1/me/', { fixture: 'hub_admin.json' });
    cy.intercept('**/_ui/v1/settings/', { fixture: 'hub_settings.json' });
    cy.intercept('**/_ui/v1/feature-flags/', { fixture: 'hub_feature_flags.json' });
    cy.fixture('collection_versions_eda').then(
      (collectionVersionsResponse: HubItemsResponse<CollectionVersionSearch>) => {
        const collections = collectionVersionsResponse.data;
        cy.mount(
          <HubContextProvider>
            <CollectionCategoryCarousel
              collections={collections}
              category="eda"
              searchKey="tags"
              searchValue="eda"
            />
          </HubContextProvider>
        );
        cy.get('.pf-c-card__footer button').contains('Manage content').should('be.visible');
      }
    );
  });

  it('Manage Content button should not be shown for non-admin user', () => {
    cy.fixture('hub_admin').then((user: HubUser) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      cy.intercept('**/_ui/v1/me/', { ...user, is_superuser: false });
    });
    cy.intercept('**/_ui/v1/settings/', { fixture: 'hub_settings.json' });
    cy.intercept('**/_ui/v1/feature-flags/', { fixture: 'hub_feature_flags.json' });
    cy.fixture('collection_versions_eda').then(
      (collectionVersionsResponse: HubItemsResponse<CollectionVersionSearch>) => {
        const collections = collectionVersionsResponse.data;
        cy.mount(
          <HubContextProvider>
            <CollectionCategoryCarousel
              collections={collections}
              category="eda"
              searchKey="tags"
              searchValue="eda"
            />
          </HubContextProvider>
        );
        cy.contains('Manage content', 'button').should('not.exist');
      }
    );
  });
});
