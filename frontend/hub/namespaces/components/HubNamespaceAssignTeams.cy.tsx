import { hubAPI } from '../../common/api/formatPath';
import { HubNamespaceAssignTeams } from './HubNamespaceAssignTeams';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';

describe('HubNamespaceAssignTeams', () => {
  const component = <HubNamespaceAssignTeams />;
  const path = '/namespaces/:id/team-access/assign';
  const initialEntries = ['/namespaces/demo/team-access/assign'];
  const params = {
    path,
    initialEntries,
  };

  beforeEach(() => {
    cy.intercept('GET', hubAPI`/_ui/v1/namespaces/?limit=1&name=demo*`, {
      fixture: 'hubNamespace.json',
    });
    cy.intercept('GET', gatewayAPI`/teams/?*`, {
      fixture: 'hubV2Teams.json',
    });
    cy.intercept('GET', gatewayAPI`/role_definitions/?content_type__api_slug=galaxy.namespace*`, {
      fixture: 'hubNamespaceRoles.json',
    });
    cy.mount(component, params);
  });
  it('should render with correct steps', () => {
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select team(s)');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles to apply');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('have.class', 'pf-m-current');
    cy.get('table tbody').find('tr').should('have.length', 2);
  });
  it('should validate that at least one team is selected for moving to next step', () => {
    cy.get('table tbody').find('tr').should('have.length', 2);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v6-c-alert__title').should('contain.text', 'Select at least one team.');
    cy.selectTableRowByCheckbox('name', 'demoteam1', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-platformRoles"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that at least one role is selected for moving to Review step', () => {
    cy.get('table tbody').find('tr').should('have.length', 2);
    cy.selectTableRowByCheckbox('name', 'demoteam1', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-platformRoles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('.pf-v6-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-platformRoles"] button').should(
      'not.have.class',
      'pf-m-current'
    );
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected team and role in the Review step', () => {
    cy.get('table tbody').find('tr').should('have.length', 2);
    cy.selectTableRowByCheckbox('name', 'demoteam1', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'Teams');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'demoteam1');
    cy.get('[data-cy="expandable-section-platformRoles"]').should('contain.text', 'Roles');
    cy.get('[data-cy="expandable-section-platformRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-platformRoles"]').should(
      'contain.text',
      'galaxy.collection_publisher'
    );
    cy.get('[data-cy="expandable-section-platformRoles"]').should(
      'contain.text',
      'Upload and modify collections.'
    );
  });
  it('should trigger bulk action dialog on submit', () => {
    cy.intercept('POST', gatewayAPI`/role_team_assignments/`, {
      statusCode: 201,
      body: { team: 2, role_definition: 4, content_type: 'galaxy.namespace', object_id: 1 },
    }).as('createRoleAssignment');
    cy.selectTableRowByCheckbox('name', 'demoteam1', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Finish$/);
    cy.wait('@createRoleAssignment');
    // Bulk action modal is displayed with success
    cy.get('.pf-v6-c-modal-box').within(() => {
      cy.get('table tbody').find('tr').should('have.length', 1);
      cy.get('table tbody').should('contain.text', 'demoteam1');
      cy.get('table tbody').should('contain.text', 'galaxy.collection_publisher');
      cy.get('div.pf-v6-c-progress__description').should('contain.text', 'Success');
      cy.get('div.pf-v6-c-progress__status').should('contain.text', '100%');
    });
  });
});
