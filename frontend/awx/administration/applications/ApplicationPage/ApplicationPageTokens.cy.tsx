import { ApplicationTokens } from './ApplicationPageTokens';

describe('Application Tokens', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/applications/1/tokens/*',
        },
        {
          fixture: 'applicationPageTokens.json',
        }
      );
    });

    it('Tokens list renders', () => {
      cy.mount(<ApplicationTokens />);
      cy.get('tbody').find('tr').should('have.length', 10);
    });

    it('Filter tokens by name', () => {
      cy.mount(<ApplicationTokens />);
      cy.intercept('api/v2/applications/1/tokens/?user__username__icontains=test*').as(
        'nameFilterRequest'
      );
      cy.filterTableByText('test');
      cy.wait('@nameFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Clicking name table header sorts application tokens by name', () => {
      cy.mount(<ApplicationTokens />);
      cy.intercept('/api/v2/applications/1/tokens/?order_by=-user__username*').as(
        'nameDescSortRequest'
      );
      cy.clickTableHeader(/^Name$/);
      cy.wait('@nameDescSortRequest');
      cy.intercept('/api/v2/applications/1/tokens/?order_by=user__username*').as(
        'nameAscSortRequest'
      );
      cy.clickTableHeader(/^Name$/);
      cy.wait('@nameAscSortRequest');
    });

    it('Clicking name table header sorts application tokens by scope', () => {
      cy.mount(<ApplicationTokens />);
      cy.intercept('api/v2/applications/1/tokens/?order_by=scope*').as('nameAscSortRequest');
      cy.clickTableHeader(/^Scope$/);
      cy.wait('@nameAscSortRequest');
      cy.intercept('api/v2/applications/1/tokens/?order_by=-scope*').as('nameDescSortRequest');
      cy.clickTableHeader(/^Scope$/);
      cy.wait('@nameDescSortRequest');
    });

    it('Clicking name table header sorts application tokens by expires', () => {
      cy.mount(<ApplicationTokens />);
      cy.intercept('api/v2/applications/1/tokens/?order_by=expires*').as('nameAscSortRequest');
      cy.clickTableHeader(/^Expires$/);
      cy.wait('@nameAscSortRequest');
      cy.intercept('api/v2/applications/1/tokens/?order_by=-expires*').as('nameDescSortRequest');
      cy.clickTableHeader(/^Expires$/);
      cy.wait('@nameDescSortRequest');
    });

    it('Displays error if tokens are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/applications/1/tokens/*',
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<ApplicationTokens />);
      cy.contains('Error loading tokens');
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/applications/1/tokens/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly', () => {
      cy.mount(<ApplicationTokens />);
      cy.contains(/^There are currently no tokens associated with this application$/);
      cy.contains(/^You can create a token from your user page.$/);
    });
  });
});
