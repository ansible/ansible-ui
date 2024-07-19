import controllerOrganization from '../../../../cypress/fixtures/organization.json';
import { awxAPI } from '../../../../cypress/support/formatApiPathForAwx';
import * as useAwxConfig from '../../../../frontend/awx/common/useAwxConfig';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { GatewayServicesContext } from '../../../main/GatewayServices';
import { OrganizationWizardFormValues, PlatformOrganizationForm } from './PlatformOrganizationForm';

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
  managed: false,
} as PlatformOrganization;

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
    cy.get('[data-cy="executionEnvironment"]').should('not.exist');
    cy.get('[data-cy="instance-group-select-form-group"]').should('not.exist');
    cy.get('[data-cy="credential"]').should('not.exist');
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

  it('should submit a basic gateway organization when a Controller service is registered closed license', () => {
    const handleSubmit = cy.spy();
    cy.stub(useAwxConfig, 'useAwxConfig').callsFake(() => ({
      license_info: {
        license_type: 'enterprise',
      },
    }));
    cy.mount(
      <GatewayServicesContext.Provider value={{ gateway: '', controller: '' }}>
        <PlatformOrganizationForm handleSubmit={handleSubmit} />
      </GatewayServicesContext.Provider>
    );
    cy.get('[data-cy="organization-name"]').type('test organization');
    cy.get('[data-cy="organization-description"]').type('test description');
    cy.get('[data-cy="executionEnvironment"]').should('exist');
    cy.get('[data-cy="instance-group-select-form-group"]').should('exist');
    cy.get('[data-cy="credential"]').should('exist');
    cy.get('[data-cy="maxhosts"]').should('exist');
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

  it('should submit a basic gateway organization when a Controller service is registered open license', () => {
    const handleSubmit = cy.spy();
    cy.stub(useAwxConfig, 'useAwxConfig').callsFake(() => ({
      license_info: {
        license_type: 'open',
      },
    }));
    cy.mount(
      <GatewayServicesContext.Provider value={{ gateway: '', controller: '' }}>
        <PlatformOrganizationForm handleSubmit={handleSubmit} />
      </GatewayServicesContext.Provider>
    );
    cy.get('[data-cy="organization-name"]').type('test organization');
    cy.get('[data-cy="organization-description"]').type('test description');
    cy.get('[data-cy="executionEnvironment"]').should('exist');
    cy.get('[data-cy="instance-group-select-form-group"]').should('exist');
    cy.get('[data-cy="credential"]').should('exist');
    cy.get('[data-cy="maxhosts"]').should('not.exist');
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

  it('should validate the Max Hosts field when a Controller service is registered closed license', () => {
    const handleSubmit = cy.spy();
    cy.stub(useAwxConfig, 'useAwxConfig').callsFake(() => ({
      license_info: {
        license_type: 'enterprise',
      },
    }));
    cy.mount(
      <GatewayServicesContext.Provider value={{ gateway: '', controller: '' }}>
        <PlatformOrganizationForm handleSubmit={handleSubmit} />
      </GatewayServicesContext.Provider>
    );
    cy.get('[data-cy="wizard-nav-item-details"] button').should('have.class', 'pf-m-current');
    cy.get('[data-cy="organization-name"]').type('test organization');
    cy.get('[data-cy="organization-description"]').type('test description');
    cy.get('[data-cy="maxhosts"]').type('1.3');
    cy.clickButton('Next');
    cy.contains('This field must be an integer and have a value between 0 and 2147483647.').should(
      'be.visible'
    );
    cy.get('[data-cy="wizard-nav-item-details"] button').should('have.class', 'pf-m-current');
  });

  it('should submit a full organization when a Controller service is registered closed license', () => {
    const handleSubmit = cy.spy();
    cy.stub(useAwxConfig, 'useAwxConfig').callsFake(() => ({
      license_info: {
        license_type: 'enterprise',
      },
    }));
    cy.mount(
      <GatewayServicesContext.Provider value={{ gateway: '', controller: '' }}>
        <PlatformOrganizationForm handleSubmit={handleSubmit} />
      </GatewayServicesContext.Provider>
    );
    cy.get('[data-cy="organization-name"]').type('test organization');
    cy.get('[data-cy="organization-description"]').type('test description');
    cy.get('[data-cy="maxhosts"]').type('1');
    cy.singleSelectByDataCy('executionEnvironment', '1');
    cy.singleSelectByDataCy('instance-group-select', '1');
    cy.singleSelectByDataCy('credential', '1');
    cy.clickButton('Next');
    cy.clickButton('Finish').then(() => {
      expect(handleSubmit).to.be.called;
      const args = handleSubmit.args[0];
      const data = (args[0] || {}) as OrganizationWizardFormValues;
      expect(data.organization.name).to.equal('test organization');
      expect(data.organization.description).to.equal('test description');
      expect(data.maxHosts).to.deep.equal(1);
      expect(data.instanceGroups?.map((ig) => ig.id)).to.deep.equal([1]);
      expect(data.galaxyCredentials?.map((cred) => cred.id)).to.deep.equal([1]);
      expect(data.executionEnvironment).to.deep.equal(mockExecutionEnvironment.id);
    });
  });

  it('should handle the edit scenario where an org and related values are passed in closed license', () => {
    const handleSubmit = cy.spy();
    cy.stub(useAwxConfig, 'useAwxConfig').callsFake(() => ({
      license_info: {
        license_type: 'enterprise',
      },
    }));
    cy.mount(
      <GatewayServicesContext.Provider value={{ gateway: '', controller: '' }}>
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
    cy.get('#maxhosts').should('have.value', 0);
    cy.get('[data-cy="executionEnvironment"]').should('exist');
    cy.get('[data-cy="instance-group-select-form-group"]').should('exist');
    cy.get('[data-cy="credential"]').should('exist');
    cy.singleSelectByDataCy('executionEnvironment', '1');
    cy.singleSelectByDataCy('instance-group-select', '1');
    cy.singleSelectByDataCy('credential', '1');
    cy.clickButton('Next');
    cy.clickButton('Finish').then(() => {
      expect(handleSubmit).to.be.called;
      const args = handleSubmit.args[0];
      const data = (args[0] || {}) as OrganizationWizardFormValues;
      expect(data.organization.name).to.equal(platformOrganization.name);
      expect(data.organization.description).to.equal(platformOrganization.description);
      expect(data.instanceGroups?.map((ig) => ig.id)).to.deep.equal([1]);
      expect(data.galaxyCredentials?.map((cred) => cred.id)).to.deep.equal([1]);
      expect(data.executionEnvironment).to.deep.equal(mockExecutionEnvironment.id);
      expect(data.maxHosts).to.equal(controllerOrganization.max_hosts);
    });
  });

  it('should handle the edit scenario where an org and related values are passed in open license', () => {
    const handleSubmit = cy.spy();
    cy.stub(useAwxConfig, 'useAwxConfig').callsFake(() => ({
      license_info: {
        license_type: 'open',
      },
    }));

    cy.mount(
      <GatewayServicesContext.Provider value={{ gateway: '', controller: '' }}>
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
    cy.get('[data-cy="maxHosts"]').should('not.exist');
    cy.get('[data-cy="executionEnvironment"]').should('exist');
    cy.get('[data-cy="instance-group-select-form-group"]').should('exist');
    cy.get('[data-cy="credential"]').should('exist');
    cy.singleSelectByDataCy('executionEnvironment', '1');
    cy.singleSelectByDataCy('instance-group-select', '1');
    cy.singleSelectByDataCy('credential', '1');
    cy.clickButton('Next');
    cy.clickButton('Finish').then(() => {
      expect(handleSubmit).to.be.called;
      const args = handleSubmit.args[0];
      const data = (args[0] || {}) as OrganizationWizardFormValues;
      expect(data.organization.name).to.equal(platformOrganization.name);
      expect(data.organization.description).to.equal(platformOrganization.description);
      expect(data.instanceGroups?.map((ig) => ig.id)).to.deep.equal([1]);
      expect(data.galaxyCredentials?.map((cred) => cred.id)).to.deep.equal([1]);
      expect(data.executionEnvironment).to.deep.equal(mockExecutionEnvironment.id);
    });
  });
});
