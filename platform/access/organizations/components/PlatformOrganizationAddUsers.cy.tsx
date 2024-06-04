import mockPlatformOrganizations from '../../../../cypress/fixtures/platformOrganizations.json';
import { edaAPI } from '../../../../cypress/support/formatApiPathForEDA';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import * as GatewayServices from '../../../main/GatewayServices';
import { PlatformOrganizationAddUsers } from './PlatformOrganizationAddUsers';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];

describe('PlatformOrganizationAddUsers', () => {
  const component = <PlatformOrganizationAddUsers />;
  const path = '/organizations/:id/users/add-users';
  const initialEntries = [`/organizations/1/users/add-users`];
  const params = {
    path,
    initialEntries,
  };
  beforeEach(() => {
    // Platform
    cy.intercept(
      {
        method: 'GET',
        url: gatewayV1API`/organizations/1/`,
      },
      mockPlatformOrganization
    ).as('organization');
    cy.intercept('GET', gatewayV1API`/users/*`, { fixture: 'platformUsers.json' });
    cy.intercept('GET', gatewayV1API`/role_definitions/*`, {
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
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select user(s)');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Select roles');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Automation Execution');
    cy.get('[data-cy="wizard-nav"] li').eq(3).should('contain.text', 'Automation Decisions');
    cy.get('[data-cy="wizard-nav"] li').eq(4).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-users"] button').should('have.class', 'pf-m-current');
  });
  it('should render with correct steps when only one service is enabled', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select user(s)');
    cy.get('[data-cy="wizard-nav"] li')
      .eq(1)
      .should('contain.text', 'Select Automation Execution roles');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-users"] button').should('have.class', 'pf-m-current');
  });
  it('should validate that a user is selected for moving to the next step', () => {
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
    cy.get('.pf-v5-c-alert__title').should('contain.text', 'Select at least one user.');
    cy.get('[data-cy="wizard-nav-item-users"] button').should('have.class', 'pf-m-current');
    cy.selectTableRowByCheckbox('username', 'test', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-users"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
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
    cy.selectTableRowByCheckbox('username', 'test', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-users"] button').should('not.have.class', 'pf-m-current');
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-edaRoles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
  });
  it('should display selected users and roles in the Review step', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'eda') {
        return '/api/eda/';
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.selectTableRowByCheckbox('username', 'test', { disableFilter: true });
    cy.selectTableRowByCheckbox('username', 'testuser2', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
    cy.contains('Select Automation Execution roles');
    cy.selectTableRowByCheckbox('name', 'Organization Credential Admin', { disableFilter: true });
    cy.selectTableRowByCheckbox('name', 'Organization Inventory Admin', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-edaRoles"] button').should('have.class', 'pf-m-current');
    cy.contains('Select Automation Decisions roles');
    cy.selectTableRowByCheckbox('name', 'Contributor', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'Users');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', '2');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'test');
    cy.get('[data-cy="expandable-section-users"]').should('contain.text', 'testuser2');
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Automation Decisions roles'
    );
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Contributor');
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Has create and update permissions with an exception of users and roles. Has enable and disable rulebook activation permissions.'
    );
    cy.get('[data-cy="expandable-section-awxRoles"]').should(
      'contain.text',
      'Automation Execution roles'
    );
    cy.get('[data-cy="expandable-section-awxRoles"]').should('contain.text', '2');
    cy.get('[data-cy="expandable-section-awxRoles"]').should(
      'contain.text',
      'Organization Credential Admin'
    );
    cy.get('[data-cy="expandable-section-awxRoles"]').should(
      'contain.text',
      'Organization Inventory Admin'
    );
    cy.get('[data-cy="expandable-section-awxRoles"]').should(
      'contain.text',
      'Has all permissions to credentials within an organization'
    );
    cy.get('[data-cy="expandable-section-awxRoles"]').should(
      'contain.text',
      'Has all permissions to inventories within an organization'
    );
  });
});
