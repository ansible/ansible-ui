import mockPlatformOrganizations from '@ansible/cypress/fixtures/platformOrganizations.json';
import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { edaAPI } from '@ansible/cypress/support/formatApiPathForEDA';
import * as GatewayServices from '../../../main/GatewayServices';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformOrganizationTeamsAddRoles } from './PlatformOrganizationTeamsAddRoles';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];

describe('PlatformOrganizationTeamsAddRoles', () => {
  const component = <PlatformOrganizationTeamsAddRoles />;
  const path = '/organizations/:id/teams/add-roles';
  const initialEntries = [`/organizations/1/teams/add-roles`];
  const params = {
    path,
    initialEntries,
  };
  beforeEach(() => {
    // Platform
    cy.intercept(
      {
        method: 'GET',
        url: gatewayAPI`/organizations/1/`,
      },
      mockPlatformOrganization
    ).as('organization');
    cy.intercept('GET', gatewayAPI`/organizations/1/teams/*`, {
      fixture: 'platformOrganizationTeams.json',
    });
    cy.intercept('GET', gatewayAPI`/role_definitions/*`, {
      fixture: 'platformOrganizationMemberRole.json',
    });
    // AWX
    cy.intercept('GET', awxAPI`/role_definitions/?content_type__model=organization*`, {
      fixture: 'platformAwxOrganizationRoles.json',
    });
    // EDA
    cy.intercept('GET', edaAPI`/role_definitions/?content_type__model=organization*`, {
      fixture: 'platformEdaOrganizationRoles.json',
    });
  });

  it('should render with correct steps when controller and EDA services are enabled', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'eda') {
        return '/api/eda/';
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select team(s)');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select organization roles');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('have.class', 'pf-m-current');
  });

  it('should validate that a team is selected for moving to the next step', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'eda') {
        return '/api/eda/';
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.clickButton(/^Next$/);
    cy.get('.pf-v6-c-alert__title').should('contain.text', 'Select at least one team.');
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('have.class', 'pf-m-current');
    cy.selectTableRowByCheckbox('name', 'Test team 1', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });

  it('selection of service-specific roles is optional', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'eda') {
        return '/api/eda/';
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.selectTableRowByCheckbox('name', 'Test team 1', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-teams"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });

  it('should display selected teams and roles in the Review step', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'eda') {
        return '/api/eda/';
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.selectTableRowByCheckbox('name', 'Test team 1', { disableFilter: true });
    cy.selectTableRowByCheckbox('name', 'Test team 2', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
    cy.contains('Select organization roles');
    cy.selectTableRowByCheckbox('name', 'Organization Member', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'Teams');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', '2');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'Test team 1');
    cy.get('[data-cy="expandable-section-teams"]').should('contain.text', 'Test team 2');
    cy.get('[data-cy="expandable-section-awxRoles"]').should('contain.text', 'Organization roles');
    cy.get('[data-cy="expandable-section-awxRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-awxRoles"]').should('contain.text', 'Organization Member');
    cy.get('[data-cy="components-column-cell"]').should('be.visible');
  });
});
