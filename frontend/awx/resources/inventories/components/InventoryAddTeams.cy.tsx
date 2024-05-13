import { InventoryAddTeams } from './InventoryAddTeams';
import { awxAPI } from '../../../common/api/awx-utils';

describe('AwxInventoryAddTeams', () => {
  const component = <InventoryAddTeams />;
  const path = '/inventories/:id/team-access/add';
  const initialEntries = [`/inventories/1/team-access/add`];
  const params = {
    path,
    initialEntries,
  };

  beforeEach(() => {
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/teams/',
      },
      {
        fixture: 'awx_teams_options.json',
      }
    ).as('getOptions');
    cy.intercept('GET', awxAPI`/inventories/*`, {
      fixture: 'inventory.json',
    });
    cy.intercept('GET', awxAPI`/teams/*`, { fixture: 'teams.json' });
    cy.intercept('GET', awxAPI`/role_definitions/*`, {
      fixture: 'awxInventoryRoles.json',
    });
    cy.mount(component, params);
  });
  it('should render with correct steps', () => {
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select team(s)');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles to apply');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('have.class', 'pf-m-current');
    cy.get('table tbody').find('tr').should('have.length', 3);
  });
  it('can filter teams by name', () => {
    cy.intercept(awxAPI`/teams/?name=Sample*`, { fixtures: 'teams.json' }).as('nameFilterRequest');
    cy.filterTableByMultiSelect('name', ['Sample']);
    cy.wait('@nameFilterRequest');
    cy.clearAllFilters();
  });
  it('should validate that at least one team is selected for moving to next step', () => {
    cy.get('table tbody').find('tr').should('have.length', 3);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one team.');
    cy.selectTableRowByCheckbox('name', 'Sample', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that at least one role is selected for moving to Review step', () => {
    cy.selectTableRowByCheckbox('name', 'Sample', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.selectTableRowByCheckbox('name', 'Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected team and role in the Review step', () => {
    cy.selectTableRowByCheckbox('name', 'Sample', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'Teams');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'Sample');
    cy.get('[data-cy="expandable-section-awxRoles"]').within(() => {
      cy.get('div > span').should('contain.text', 'Roles');
      cy.get('div > .pf-v5-c-badge').should('contain.text', '1');
      cy.get('[data-cy="name-column-cell"]').should('contain.text', 'Admin');
      cy.get('[data-cy="description-column-cell"]').should(
        'contain.text',
        'Has all permissions to a single inventory'
      );
    });
  });
  it('should trigger bulk action dialog on submit', () => {
    cy.intercept('POST', awxAPI`/role_team_assignments/`, {
      statusCode: 201,
      body: {
        team: 3,
        role_definition: 14,
        content_type: 'awx.Inventory',
        object_id: 1,
      },
    }).as('createRoleAssignment');
    cy.selectTableRowByCheckbox('name', 'Sample', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Finish$/);
    cy.wait('@createRoleAssignment');
    // Bulk action modal is displayed with success
    cy.get('.pf-v5-c-modal-box').within(() => {
      cy.get('table tbody').find('tr').should('have.length', 1);
      cy.get('table tbody').should('contain.text', 'Sample');
      cy.get('table tbody').should('contain.text', 'Admin');
      cy.get('div.pf-v5-c-progress__description').should('contain.text', 'Success');
      cy.get('div.pf-v5-c-progress__status').should('contain.text', '100%');
    });
  });
});
