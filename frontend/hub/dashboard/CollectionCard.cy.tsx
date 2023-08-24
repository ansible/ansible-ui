import { CollectionVersionSearch } from '../approvals/Approval';
import { HubItemsResponse } from '../useHubView';
import { CollectionCard } from './CollectionCard';

describe('CollectionCard.cy.tsx', () => {
  it('renders card with expected details', () => {
    cy.fixture('application_collection_versions').then(
      (collectionVersions: HubItemsResponse<CollectionVersionSearch>) => {
        const collection = collectionVersions.data[0];
        cy.mount(<CollectionCard collection={collection} />);
        cy.get('div.pf-c-card__title').should('contain', collection.collection_version.name);
        cy.get('div.pf-c-card__body').should(
          'contain',
          `v${collection.collection_version.version}`
        );
        cy.contains('dt', 'Roles').parent().siblings('dd').should('contain', 1);
        cy.get('.pf-c-label__content').should('contain', 'Signed');
      }
    );
  });
});
