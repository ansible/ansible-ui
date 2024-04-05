import { EdaRolePage } from './EdaRolePage';

describe('EdaRolePage', () => {
  describe('Built-in role', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/eda/v1/role_definitions/*/', hostname: 'localhost' },
        { fixture: 'edaBuiltInRoleDefinition.json' }
      );
      cy.mountEda(<EdaRolePage />);
    });
    it('Component renders and displays team in breadcrumb', () => {
      cy.contains('nav[aria-label="Breadcrumb"]', 'Project Admin').should('exist');
    });
    it('Edit button is visible and disabled', () => {
      cy.contains('button', 'Edit role').should('have.attr', 'aria-disabled', 'true');
    });
    it('Delete button is visible and disabled', () => {
      cy.get('button[aria-label="Actions"]').click();
      cy.contains('a.pf-v5-c-dropdown__menu-item', 'Delete role').should(
        'have.attr',
        'aria-disabled',
        'true'
      );
    });
    it('Displays tab for Details', () => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', 2);
      cy.get('.pf-v5-c-tabs__item').eq(0).should('have.text', 'Back to Roles');
      cy.get('.pf-v5-c-tabs__item').eq(1).should('have.text', 'Details');
    });
  });
  describe('Custom role', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/eda/v1/role_definitions/*/', hostname: 'localhost' },
        { fixture: 'edaCustomRoleDefinition.json' }
      );
    });
    it('Component renders and displays team in breadcrumb', () => {
      cy.mountEda(<EdaRolePage />);
      cy.contains('nav[aria-label="Breadcrumb"]', 'View projects').should('exist');
    });
    it('Edit button is visible and enabled for superuser', () => {
      cy.mountEda(<EdaRolePage />);
      cy.contains('button', 'Edit role').should('have.attr', 'aria-disabled', 'false');
    });
    it('Delete button is visible and enabled for superuser', () => {
      cy.mountEda(<EdaRolePage />);
      cy.get('button[aria-label="Actions"]').click();
      cy.contains('a.pf-v5-c-dropdown__menu-item', 'Delete role').should(
        'have.attr',
        'aria-disabled',
        'false'
      );
    });
    it('Edit button is visible and disabled when user is not superuser', () => {
      cy.mountEda(<EdaRolePage />, undefined, 'edaNormalUser.json');
      cy.contains('button', 'Edit role').should('have.attr', 'aria-disabled', 'true');
    });
    it('Delete button is visible and disabled when user is not superuser', () => {
      cy.mountEda(<EdaRolePage />, undefined, 'edaNormalUser.json');
      cy.get('button[aria-label="Actions"]').click();
      cy.contains('a.pf-v5-c-dropdown__menu-item', 'Delete role').should(
        'have.attr',
        'aria-disabled',
        'true'
      );
    });
    it('Displays tab for Details', () => {
      cy.mountEda(<EdaRolePage />);
      cy.get('.pf-v5-c-tabs__item').should('have.length', 2);
      cy.get('.pf-v5-c-tabs__item').eq(0).should('have.text', 'Back to Roles');
      cy.get('.pf-v5-c-tabs__item').eq(1).should('have.text', 'Details');
    });
  });
});
