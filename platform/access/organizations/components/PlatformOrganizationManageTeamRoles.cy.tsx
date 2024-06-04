import mockEdaOrganizations from '../../../../cypress/fixtures/edaOrganizations.json';
import mockEdaTeams from '../../../../cypress/fixtures/edaTeams.json';
import mockAwxOrg from '../../../../cypress/fixtures/organization.json';
import mockPlatformOrganizations from '../../../../cypress/fixtures/platformOrganizations.json';
import mockPlatformTeams from '../../../../cypress/fixtures/platformTeams.json';
import mockAwxTeam from '../../../../cypress/fixtures/team.json';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import * as GatewayServices from '../../../main/GatewayServices';
import { PlatformOrganizationManageTeamRoles } from './PlatformOrganizationManageTeamRoles';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];
const mockPlatformTeam = mockPlatformTeams.results[0];
const mockEdaOrg = mockEdaOrganizations.results[0];
const mockEdaTeam = mockEdaTeams.results[0];

describe('PlatformOrganizationManageTeamRoles', () => {
  const component = <PlatformOrganizationManageTeamRoles />;
  const path = '/organizations/:id/teams/:teamId/manage-roles';
  const initialEntries = [`/organizations/1/teams/2/manage-roles`];
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

    cy.intercept('GET', gatewayV1API`/teams/2/`, mockPlatformTeam);

    // AWX
    cy.intercept('GET', awxAPI`/role_definitions/?content_type__model=organization*`, {
      fixture: 'platformAwxOrganizationRoles.json',
    });
    cy.intercept('GET', awxAPI`/%2Fteams%2F?resource__ansible_id*`, {
      count: 1,
      next: null,
      previous: null,
      results: [mockAwxTeam],
    });
    cy.intercept('GET', awxAPI`/%2Forganizations%2F?resource__ansible_id*`, {
      count: 1,
      next: null,
      previous: null,
      results: [mockAwxOrg],
    });
    cy.intercept('GET', awxAPI`/role_team_assignments/*`, {
      fixture: 'awxTeamOrgRoleAssignments.json',
    });

    // EDA
    cy.intercept('GET', edaAPI`/role_definitions/?content_type__model=organization*`, {
      fixture: 'platformEdaOrganizationRoles.json',
    });
    cy.intercept('GET', edaAPI`/teams%2F*`, {
      count: 1,
      next: null,
      previous: null,
      results: [mockEdaTeam],
    });
    cy.intercept('GET', edaAPI`/organizations%2F*`, {
      count: 1,
      next: null,
      previous: null,
      results: [mockEdaOrg],
    });
    cy.intercept('GET', edaAPI`/role_team_assignments/*`, {
      fixture: 'edaTeamOrgRoleAssignments.json',
    });
  });
  it('renders with correct steps when controller and EDA services are enabled', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'eda') {
        return '/api/eda/';
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.verifyPageTitle('Manage roles for Team2');
    cy.get('[data-cy="wizard-nav"] li').eq(0).should('contain.text', 'Select roles');
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Automation Execution');
    cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Automation Decisions');
    cy.get('[data-cy="wizard-nav"] li').eq(3).should('contain.text', 'Review');
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
  });
  it('renders with correct steps when only one service is enabled', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
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
  it('indicates selected controller and EDA roles for the team ', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'eda') {
        return '/api/eda/';
      }
      return undefined;
    });
    cy.mount(component, params);
    cy.getTableRow('name', 'Organization Credential Admin', {
      disableFilter: true,
    }).within(() => {
      cy.get('input').should('have.attr', 'checked');
    });
    cy.get('[data-cy="wizard-nav-item-awxRoles"] button').should('have.class', 'pf-m-current');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-edaRoles"] button').should('have.class', 'pf-m-current');
    cy.getTableRow('name', 'Viewer', {
      disableFilter: true,
    }).within(() => {
      cy.get('input').should('have.attr', 'checked');
    });
  });
  it('displays team and selected roles in the Review step', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'eda') {
        return '/api/eda/';
      }
      return undefined;
    });
    cy.mount(component, params);

    cy.contains('Select Automation Execution roles');
    // Uncheck existing selection of AWX roles
    cy.selectTableRowByCheckbox('name', 'Organization Credential Admin', { disableFilter: true });
    // Make new selection of AWX role
    cy.selectTableRowByCheckbox('name', 'Organization Inventory Admin', { disableFilter: true });

    cy.clickButton(/^Next$/);

    cy.get('[data-cy="wizard-nav-item-edaRoles"] button').should('have.class', 'pf-m-current');
    cy.contains('Select Automation Decisions roles');
    // Make new selection of EDA role
    cy.selectTableRowByCheckbox('name', 'Operator', { disableFilter: true });
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav-item-review"] button').should('have.class', 'pf-m-current');
    // Team
    cy.hasDetail(/^Team$/, `${mockPlatformTeam.name}`);
    // EDA roles
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Automation Decisions roles'
    );
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', '2');
    cy.get('[data-cy="expandable-section-edaRoles"]').should('contain.text', 'Viewer');
    cy.get('[data-cy="expandable-section-edaRoles"]').should(
      'contain.text',
      'Has read permissions, except users and roles.'
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
