// using PlatformOrganizationForm.cy.tsx as a reference, generate tests for PlatformOrganizationDetails.cy.tsx

import { awxAPI } from '../../../../cypress/support/formatApiPathForAwx';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { GatewayService } from '../../../main/GatewayService';
import { GatewayServicesContext } from '../../../main/GatewayServices';
import { PlatformOrganizationDetails } from './PlatformOrganizationDetails';

describe('PlatformOrganizationDetails', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: gatewayV1API`/organizations/*/`,
      },
      {
        id: 1,
        name: 'organization 1',
        description: 'organization 1 description',
        ansible_id: 'e5e8d3b6-8a0b-4b0d-8e0a-6c8b5a0f5f1f',
        summary_fields: {
          related_field_counts: {
            users: 11,
            teams: 4,
          },
        },
      }
    ).as('getOrganization');
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/organizations%2F?resource__ansible_id=*`,
      },
      {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            name: 'organization 1',
            summary_fields: {
              related_field_counts: {
                admins: 15,
                inventories: 2,
                projects: 3,
                job_templates: 8,
                hosts: 4,
              },
              default_environment: {
                id: 2,
                name: 'Example execution environment',
                description: '',
                image: 'example.redhat.com/execution-environments/execution-environment:latest',
              },
            },
            default_environment: 2,
          },
        ],
      }
    ).as('getAwxOrganization');
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/organizations/*/galaxy_credentials`,
      },
      {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            name: 'galaxy credential 1',
          },
          {
            id: 2,
            name: 'galaxy credential 2',
          },
        ],
      }
    ).as('getGalaxyCredentials');
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/organizations/*/instance_groups`,
      },
      {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            name: 'instance group 1',
          },
          {
            id: 2,
            name: 'instance group 2',
          },
        ],
      }
    ).as('getInstanceGroups');
  });

  it('should display organization details when a Controller service is not registered', () => {
    cy.mount(<PlatformOrganizationDetails />);
    cy.wait(['@getOrganization']);
    cy.get('[data-cy="name"]').should('have.text', 'organization 1');
    cy.get('[data-cy="description"]').should('have.text', 'organization 1 description');
  });

  it('should display organization details when a Controller service is registered', () => {
    cy.mount(
      <GatewayServicesContext.Provider
        value={[
          [
            { summary_fields: { service_cluster: { service_type: 'gateway' } } } as GatewayService,
            {
              summary_fields: { service_cluster: { service_type: 'controller' } },
            } as GatewayService,
          ],
          () => null,
        ]}
      >
        <PlatformOrganizationDetails />
      </GatewayServicesContext.Provider>
    );
    cy.wait([
      '@getOrganization',
      '@getAwxOrganization',
      '@getGalaxyCredentials',
      '@getInstanceGroups',
    ]);
    cy.get('[data-cy="name"]').should('have.text', 'organization 1');
    cy.get('[data-cy="description"]').should('have.text', 'organization 1 description');
    cy.get('[data-cy="users').should('have.text', '11');
    cy.get('[data-cy="teams').should('have.text', '4');
    cy.get('[data-cy="default-execution-environment').contains('Example execution environment');
    cy.get('[data-cy="instance-groups').contains('instance group 1');
    cy.get('[data-cy="instance-groups').contains('instance group 2');
    cy.get('[data-cy="galaxy-credentials').contains('galaxy credential 1');
    cy.get('[data-cy="galaxy-credentials').contains('galaxy credential 2');
  });
});
