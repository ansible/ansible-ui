import { CollectionVersionSearch } from '../administration/collection-approvals/Approval';
import { HubItemsResponse } from '../common/useHubView';
import { CollectionCard } from './CollectionCard';

describe('CollectionCard.cy.tsx', () => {
  it('renders card with expected details', () => {
    cy.fixture('application_collection_versions').then(
      (collectionVersions: HubItemsResponse<CollectionVersionSearch>) => {
        const collection = collectionVersions.data[0];
        cy.mount(<CollectionCard collection={collection} />);
        // Icon
        cy.get('svg').should('be.visible');
        // Title
        cy.get('div.pf-v5-c-card__title').should('contain', collection.collection_version?.name);
        // Description
        cy.contains('Downloads resources from the Red Hat Customer Portal.').should('be.visible');
        // Namespace
        cy.contains(`Provided by ${collection.collection_version?.namespace}`).should('be.visible');
        // Version
        cy.get('div.pf-v5-c-card__body').should(
          'contain',
          `v${collection.collection_version?.version}`
        );
        // Modules, Roles, Plugins, Dependencies
        cy.contains('dt', 'Modules').parent().siblings('dd').should('contain', 1);
        cy.contains('dt', 'Roles').parent().siblings('dd').should('contain', 1);
        cy.contains('dt', 'Plugins').parent().siblings('dd').should('contain', 0);
        cy.contains('dt', 'Dependencies').parent().siblings('dd').should('contain', 0);
        // Signed
        cy.get('.pf-m-green .pf-v5-c-label__content').should('contain', 'Signed');
      }
    );
  });
});
