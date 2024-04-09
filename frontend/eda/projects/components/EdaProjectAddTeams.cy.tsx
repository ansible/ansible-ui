import { edaAPI } from '../../common/eda-utils';
import { EdaProjectAddTeams } from './EdaProjectAddTeams';

describe('EdaProjectAddTeams', () => {
  const component = <EdaProjectAddTeams />;
  const path = '/projects/:id/team-access/add-teams';
  const initialEntries = [`/projects/1/team-access/add-teams`];
  const params = {
    path,
    initialEntries,
  };

  beforeEach(() => {
    cy.intercept('GET', edaAPI`/projects/*`, { fixture: 'edaProject.json' });
    cy.intercept('GET', edaAPI`/teams/?order_by=name*`, { fixture: 'edaTeams.json' });
    cy.intercept('GET', edaAPI`/role_definitions/?content_type__model=project*`, {
      fixture: 'edaProjectRoles.json',
    });
    cy.mount(component, params);
  });
  it('should render with correct steps', () => {
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select team(s)');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles to apply');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('have.class', 'pf-m-current');
    cy.get('table tbody').find('tr').should('have.length', 4);
  });
  it('can filter teams by name', () => {
    cy.intercept(edaAPI`/teams/?name=Gal*`).as('nameFilterRequest');
    cy.get('[data-cy="text-input"]').within(() => {
      cy.get('input').clear().type('Gal', { delay: 0 });
    });
    cy.getByDataCy('apply-filter').click();
    cy.wait('@nameFilterRequest');
    cy.clearAllFilters();
  });
  it('should validate that at least one team is selected for moving to next step', () => {
    cy.get('table tbody').find('tr').should('have.length', 4);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one team.');
    cy.selectTableRowByCheckbox('name', 'Demo', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that at least one role is selected for moving to Review step', () => {
    cy.selectTableRowByCheckbox('name', 'Demo', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one role.');
    cy.selectTableRowByCheckbox('name', 'Project Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected team and role in the Review step', () => {
    cy.selectTableRowByCheckbox('name', 'Demo', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'Project Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'Teams');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'Demo');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Roles');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Project Admin');
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Has all permissions to a single project and its child resources - rulebook'
    );
  });
  it('should trigger bulk action dialog on submit', () => {
    cy.intercept('POST', edaAPI`/role_team_assignments/`, {
      statusCode: 201,
      body: { team: 3, role_definition: 14, content_type: 'eda.project', object_id: 1 },
    }).as('createRoleAssignment');
    cy.selectTableRowByCheckbox('name', 'Demo', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.selectTableRowByCheckbox('name', 'Project Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Finish$/);
    cy.wait('@createRoleAssignment');
    // Bulk action modal is displayed with success
    cy.get('.pf-v5-c-modal-box').within(() => {
      cy.get('table tbody').find('tr').should('have.length', 1);
      cy.get('table tbody').should('contain.text', 'Demo');
      cy.get('table tbody').should('contain.text', 'Project Admin');
      cy.get('div.pf-v5-c-progress__description').should('contain.text', 'Success');
      cy.get('div.pf-v5-c-progress__status').should('contain.text', '100%');
    });
  });
});
