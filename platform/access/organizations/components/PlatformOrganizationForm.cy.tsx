import { awxAPI } from '../../../../cypress/support/formatApiPathForAwx';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { GatewayService } from '../../../main/GatewayService';
import { GatewayServicesContext } from '../../../main/GatewayServices';
import { PlatformOrganizationForm } from './PlatformOrganizationForm';
import { OrganizationWizardFormValues } from './PlatformOrganizationForm';
import controllerOrganization from '../../../../cypress/fixtures/organization.json';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

const mockExecutionEnvironment = {
  id: 1,
  name: 'execution environment 1',
};

const mockGalaxyCredentials = [
  {
    id: 1,
    name: 'galaxy credential 1',
  },
  {
    id: 2,
    name: 'galaxy credential 2',
  },
];

const mockInstanceGroups = [
  {
    id: 1,
    name: 'instance group 1',
  },
  {
    id: 2,
    name: 'instance group 2',
  },
];

describe('PlatformOrganizationForm', () => {
  //   const voidFn = async () => {};

  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/credential_types/*`,
      },
      {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
          },
        ],
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/credentials/*`,
      },
      {
        count: 2,
        next: null,
        previous: null,
        results: mockGalaxyCredentials,
      }
    ).as('getGalaxyCredentials');
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/instance_groups/*`,
      },
      {
        count: 2,
        next: null,
        previous: null,
        results: mockInstanceGroups,
      }
    ).as('getInstanceGroups');
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/execution_environments/*`,
      },
      {
        count: 1,
        next: null,
        previous: null,
        results: [mockExecutionEnvironment],
      }
    ).as('getExecutionEnvironments');
  });

  it('should submit a basic gateway organization when a Controller service is not registered', () => {
    const handleSubmit = cy.spy();
    cy.mount(<PlatformOrganizationForm handleSubmit={handleSubmit} />);
    cy.get('[data-cy="organization-name"]').type('test organization');
    cy.get('[data-cy="organization-description"]').type('test description');
    cy.get('[data-cy="execution-environment-select"]').should('not.exist');
    cy.get('[data-cy="instance-group-select-form-group"]').should('not.exist');
    cy.get('[data-cy="credential-select-form-group"]').should('not.exist');
    cy.clickButton('Next');
    cy.contains(`Name`).should('be.visible');
    cy.contains(`Description`).should('be.visible');
    cy.contains(`Default execution environment`).should('not.exist');
    cy.contains(`Instance groups`).should('not.exist');
    cy.contains(`Galaxy credentials`).should('not.exist');
    cy.clickButton('Finish').then(() => {
      expect(handleSubmit).to.be.called;
      const args = handleSubmit.args[0];
      const data = (args[0] || {}) as OrganizationWizardFormValues;
      expect(data.organization.name).to.equal('test organization');
      expect(data.organization.description).to.equal('test description');
    });
  });

  it('should submit a basic gateway organization when a Controller service is registered', () => {
    const handleSubmit = cy.spy();
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
        <PlatformOrganizationForm handleSubmit={handleSubmit} />
      </GatewayServicesContext.Provider>
    );
    cy.get('[data-cy="organization-name"]').type('test organization');
    cy.get('[data-cy="organization-description"]').type('test description');
    cy.get('[data-cy="execution-environment-select"]').should('exist');
    cy.get('[data-cy="instance-group-select-form-group"]').should('exist');
    cy.get('[data-cy="credential-select-form-group"]').should('exist');
    cy.clickButton('Next');
    cy.contains(`Name`).should('be.visible');
    cy.contains(`Description`).should('be.visible');
    cy.clickButton('Finish').then(() => {
      expect(handleSubmit).to.be.called;
      const args = handleSubmit.args[0];
      const data = (args[0] || {}) as OrganizationWizardFormValues;
      expect(data.organization.name).to.equal('test organization');
      expect(data.organization.description).to.equal('test description');
    });
  });

  it('should submit a full organization when a Controller service is registered', () => {
    const handleSubmit = cy.spy();
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
        <PlatformOrganizationForm handleSubmit={handleSubmit} />
      </GatewayServicesContext.Provider>
    );
    cy.get('[data-cy="organization-name"]').type('test organization');
    cy.get('[data-cy="organization-description"]').type('test description');
    cy.wait('@getExecutionEnvironments')
      .its('response.body.results')
      .then(() => {
        cy.getByDataCy('execution-environment-select-form-group').within(() => {
          cy.getBy('[aria-label="Options menu"]').click();
        });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
            cy.get('[data-cy="checkbox-column-cell"] input').click();
          });
          cy.clickButton(/^Confirm/);
        });
      });
    cy.wait('@getInstanceGroups')
      .its('response.body.results')
      .then(() => {
        cy.get(`[data-cy*="instance-group-select-form-group"]`).within(() => {
          cy.getBy('[aria-label="Options menu"]').click();
        });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
            cy.get('[data-cy="checkbox-column-cell"] input').click({ multiple: true });
          });
          cy.clickButton(/^Confirm/);
        });
      });
    cy.wait('@getGalaxyCredentials')
      .its('response.body.results')
      .then(() => {
        cy.get(`[data-cy*="credential-select-form-group"]`).within(() => {
          cy.getBy('[aria-label="Options menu"]').click();
        });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
            cy.get('[data-cy="checkbox-column-cell"] input').click({ multiple: true });
          });
          cy.clickButton(/^Confirm/);
        });
      });
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Finish').then(() => {
      expect(handleSubmit).to.be.called;
      const args = handleSubmit.args[0];
      const data = (args[0] || {}) as OrganizationWizardFormValues;
      expect(data.organization.name).to.equal('test organization');
      expect(data.organization.description).to.equal('test description');
      expect(data.instanceGroups).to.deep.equal(mockInstanceGroups);
      expect(data.galaxyCredentials).to.deep.equal(mockGalaxyCredentials);
      expect(data.executionEnvironment).to.deep.equal(mockExecutionEnvironment);
    });
  });

  it('should handle the edit scenario where an org and related values are passed in', () => {
    const handleSubmit = cy.spy();

    const platformOrganization = {
      id: 1,
      url: '/api/platform/organizations/1/',
      name: 'Platform organization',
      description: 'Platform organization description',
      created_on: '2021-01-01T00:00:00Z',
      modified_on: '2021-01-01T00:00:00Z',
      created_by: 1,
      modified_by: 1,
      related: {
        created_by: '',
        modified_by: '',
        teams: '',
      },
      summary_fields: {
        created_by: {
          id: 1,
          username: 'admin',
          first_name: '',
          last_name: '',
          email: '',
        },
        modified_by: {
          id: 1,
          username: 'admin',
          first_name: '',
          last_name: '',
          email: '',
        },
        resource: {
          ansible_id: '12345678-1234-1234-1234-123456789012',
          resource_type: 'shared.organization',
        },
      },
    } as PlatformOrganization;

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
        <PlatformOrganizationForm
          handleSubmit={handleSubmit}
          organization={platformOrganization}
          controllerOrganization={controllerOrganization as Organization}
        />
      </GatewayServicesContext.Provider>
    );

    cy.get('[data-cy="organization-name"]').should('have.value', platformOrganization.name);
    cy.get('[data-cy="organization-description"]').should(
      'have.value',
      platformOrganization.description
    );
    cy.get('[data-cy="execution-environment-select"]').should('exist');
    cy.get('[data-cy="instance-group-select-form-group"]').should('exist');
    cy.get('[data-cy="credential-select-form-group"]').should('exist');
    cy.wait('@getExecutionEnvironments')
      .its('response.body.results')
      .then(() => {
        cy.getByDataCy('execution-environment-select-form-group').within(() => {
          cy.getBy('[aria-label="Options menu"]').click();
        });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
            cy.get('[data-cy="checkbox-column-cell"] input').click();
          });
          cy.clickButton(/^Confirm/);
        });
      });
    cy.wait('@getInstanceGroups')
      .its('response.body.results')
      .then(() => {
        cy.get(`[data-cy*="instance-group-select-form-group"]`).within(() => {
          cy.getBy('[aria-label="Options menu"]').click();
        });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
            cy.get('[data-cy="checkbox-column-cell"] input').click({ multiple: true });
          });
          cy.clickButton(/^Confirm/);
        });
      });
    cy.wait('@getGalaxyCredentials')
      .its('response.body.results')
      .then(() => {
        cy.get(`[data-cy*="credential-select-form-group"]`).within(() => {
          cy.getBy('[aria-label="Options menu"]').click();
        });
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
            cy.get('[data-cy="checkbox-column-cell"] input').click({ multiple: true });
          });
          cy.clickButton(/^Confirm/);
        });
      });
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Finish').then(() => {
      expect(handleSubmit).to.be.called;
      const args = handleSubmit.args[0];
      const data = (args[0] || {}) as OrganizationWizardFormValues;
      expect(data.organization.name).to.equal(platformOrganization.name);
      expect(data.organization.description).to.equal(platformOrganization.description);
      expect(data.instanceGroups).to.deep.equal(mockInstanceGroups);
      expect(data.galaxyCredentials).to.deep.equal(mockGalaxyCredentials);
      expect(data.executionEnvironment).to.deep.equal(mockExecutionEnvironment);
    });
  });
});
