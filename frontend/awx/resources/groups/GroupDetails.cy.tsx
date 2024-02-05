import { formatDateString } from '../../../../framework/utils/formatDateString';
import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { GroupDetails } from './GroupDetails';

describe('GroupDetails', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/groups/**',
        hostname: 'localhost',
      },
      {
        fixture: 'groupDetails.json',
      }
    );
  });

  it('renders inventory group details', () => {
    cy.mount(<GroupDetails />, { path: '/:group_id/*', initialEntries: ['/433'] });
    cy.fixture('groupDetails.json').then((group: InventoryGroup) => {
      cy.hasDetail(/^Name$/, group.name);
      cy.hasDetail(/^Description$/, group.description ?? '');
      cy.get('[data-cy="created"] > .pf-v5-c-description-list__text').should(
        'includes.text',
        formatDateString(group.created)
      );
      cy.get('[data-cy="last-modified"] > .pf-v5-c-description-list__text').should(
        'includes.text',
        formatDateString(group.modified)
      );
      cy.hasDetail(/^Variables$/, group.variables ?? '');
    });
  });
});
