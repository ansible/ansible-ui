import mockPlatformOrganizations from '../../../../cypress/fixtures/platformOrganizations.json';
import mockGatewayServices from '../../../../cypress/fixtures/platformGatewayServices.json';
import * as GatewayServices from '../../../main/GatewayServices';
import { PlatformOrganizationManageUserRoles } from './PlatformOrganizationManageUserRoles';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { GatewayService } from '../../../main/GatewayService';
import mockPlatformUsers from '../../../../cypress/fixtures/platformUsers.json';
import mockAwxUser from '../../../../cypress/fixtures/awxUser.json';
import mockEdaUser from '../../../../cypress/fixtures/edaUser.json';
import mockAwxOrg from '../../../../cypress/fixtures/organization.json';
import mockEdaOrganizations from '../../../../cypress/fixtures/edaOrganizations.json';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];
const mockPlatformUser = mockPlatformUsers.results[0];
const mockEdaOrg = mockEdaOrganizations.results[0];

describe('PlatformOrganizationManageUserRoles', () => {
  const component = <PlatformOrganizationManageUserRoles />;
  const path = '/organizations/:id/users/:userId/manage-users';
  const initialEntries = [`/organizations/1/users/2/manage-users`];
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

    cy.intercept('GET', gatewayV1API`/users/2/`, mockPlatformUser);

    // AWX
    cy.intercept('GET', awxAPI`/role_definitions/?content_type__model=organization*`, {
      fixture: 'platformAwxOrganizationRoles.json',
    });
    cy.intercept('GET', awxAPI`/%2Fusers%2F?resource__ansible_id*`, {
      count: 1,
      next: null,
      previous: null,
      results: [mockAwxUser],
    });
    cy.intercept('GET', awxAPI`/%2Forganizations%2F?resource__ansible_id*`, {
      count: 1,
      next: null,
      previous: null,
      results: [mockAwxOrg],
    });
    cy.intercept('GET', awxAPI`/role_user_assignments/*`, {
      fixture: 'awxUserOrgRoleAssignments.json',
    });

    // EDA
    cy.intercept('GET', edaAPI`/role_definitions/?content_type__model=organization*`, {
      fixture: 'platformEdaOrganizationRoles.json',
    });
    cy.intercept('GET', edaAPI`/users%2F*`, {
      count: 1,
      next: null,
      previous: null,
      results: [mockEdaUser],
    });
    cy.intercept('GET', edaAPI`/organizations%2F*`, {
      count: 1,
      next: null,
      previous: null,
      results: [mockEdaOrg],
    });
    cy.intercept('GET', edaAPI`/role_user_assignments/*`, {
      fixture: 'edaUserOrgRoleAssignments.json',
    });
  });
  it('renders with correct steps when controller and EDA services are enabled', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return (mockGatewayServices as GatewayService[])[1];
      } else if (serviceType === 'eda') {
        return (mockGatewayServices as GatewayService[])[2];
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.verifyPageTitle('Manage roles for test');
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select roles');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Automation Execution');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Automation Decisions');
    cy.get('[data-cy="wizard-nav"] li').eq(3).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
  });
  it('renders with correct steps when only one service is enabled', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return (mockGatewayServices as GatewayService[])[1];
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.get('[data-cy="wizard-nav"] li')
      .eq(0)
      .should('contain.text', 'Select Automation Execution roles');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-roles"] button').should('have.class', 'pf-m-current');
  });
  it('indicates selected controller and EDA roles for the user ', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return (mockGatewayServices as GatewayService[])[1];
      } else if (serviceType === 'eda') {
        return (mockGatewayServices as GatewayService[])[2];
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.getTableRow('name', 'Organization Project Admin', {
      disableFilter: true,
    }).within(() => {
      cy.get('input').should('have.attr', 'checked');
    });
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-edaRoles"] button').should('have.class', 'pf-m-current');
    cy.getTableRow('name', 'Contributor', {
      disableFilter: true,
    }).within(() => {
      cy.get('input').should('have.attr', 'checked');
    });
  });
  it('displays user and selected roles in the Review step', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return (mockGatewayServices as GatewayService[])[1];
      } else if (serviceType === 'eda') {
        return (mockGatewayServices as GatewayService[])[2];
      }
      return undefined;
    });
    cy.mount(component, params);

    cy.contains('Select Automation Execution roles');
    // Uncheck existing selection of AWX roles
    cy.selectTableRowByCheckbox('name', 'Organization Organization Admin', { disableFilter: true });
    cy.selectTableRowByCheckbox('name', 'Organization Project Admin', { disableFilter: true });
    // Make new selection of AWX role
    cy.selectTableRowByCheckbox('name', 'Organization Inventory Admin', { disableFilter: true });

    cy.clickButton(/^Next$/);

    cy.get('[data-cy="wizard-nav-item-edaRoles"] button').should('have.class', 'pf-m-current');
    cy.contains('Select Automation Decisions roles');
    // Make new selection of EDA role
    cy.selectTableRowByCheckbox('name', 'Operator', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    // User
    cy.hasDetail(/^User$/, `${mockPlatformUser.username}`);
    // EDA roles
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Automation Decisions roles'
    );
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', '2');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Contributor');
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Has create and update permissions with an exception of users and roles. Has enable and disable rulebook activation permissions.'
    );
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Operator');
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Has read permissions. Has permissions to enable and disable rulebook activations.'
    );
    // AWX roles
    cy.get('[data-cy="expandable-section-awxRoles"]').should(
      'contain.text',
      'Automation Execution roles'
    );
    cy.get('[data-cy="expandable-section-awxRoles"]').should('contain.text', '1');
    cy.get('[data-cy="expandable-section-awxRoles"]').should(
      'contain.text',
      'Organization Inventory Admin'
    );
    cy.get('[data-cy="expandable-section-awxRoles"]').should(
      'contain.text',
      'Has all permissions to inventories within an organization'
    );
  });
});
