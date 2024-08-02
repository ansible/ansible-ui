import controllerOrganization from '../../../../cypress/fixtures/organization.json';
import { awxAPI } from '../../../../cypress/support/formatApiPathForAwx';
import * as useAwxConfig from '../../../../frontend/awx/common/useAwxConfig';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { GatewayServicesContext } from '../../../main/GatewayServices';
import { OrganizationWizardFormValues, PlatformOrganizationForm } from './PlatformOrganizationForm';

const mockExecutionEnvironment = {
  id: 3,
  type: 'execution_environment',
  url: '/api/controller/v2/execution_environments/3/',
  related: {
    activity_stream: '/api/controller/v2/execution_environments/3/activity_stream/',
    unified_job_templates: '/api/controller/v2/execution_environments/3/unified_job_templates/',
    copy: '/api/controller/v2/execution_environments/3/copy/',
  },
  summary_fields: {
    user_capabilities: {
      edit: true,
      delete: false,
      copy: true,
    },
  },
  created: '2024-08-01T05:16:26.427687Z',
  modified: '2024-08-01T05:16:26.434865Z',
  name: 'Execution Environment 1',
  description: '',
  organization: null,
  image: 'brew.registry.redhat.io/rh-osbs/ansible-automation-platform-25-ee-supported-rhel8',
  managed: true,
  credential: null,
  pull: '',
};

const mockGalaxyCredentials = [
  {
    id: 1,
    type: 'credential',
    url: '/api/controller/v2/credentials/2/',
    related: {
      created_by: '/api/controller/v2/users/1/',
      modified_by: '/api/controller/v2/users/1/',
      activity_stream: '/api/controller/v2/credentials/2/activity_stream/',
      access_list: '/api/controller/v2/credentials/2/access_list/',
      object_roles: '/api/controller/v2/credentials/2/object_roles/',
      owner_users: '/api/controller/v2/credentials/2/owner_users/',
      owner_teams: '/api/controller/v2/credentials/2/owner_teams/',
      copy: '/api/controller/v2/credentials/2/copy/',
      input_sources: '/api/controller/v2/credentials/2/input_sources/',
      credential_type: '/api/controller/v2/credential_types/19/',
    },
    summary_fields: {
      credential_type: {
        id: 19,
        name: 'Ansible Galaxy/Automation Hub API Token',
        description: '',
      },
      created_by: {
        id: 1,
        username: 'admin',
        first_name: '',
        last_name: '',
      },
      modified_by: {
        id: 1,
        username: 'admin',
        first_name: '',
        last_name: '',
      },
      object_roles: {
        admin_role: {
          description: 'Can manage all aspects of the credential',
          name: 'Admin',
          id: 29,
        },
        use_role: {
          description: 'Can use the credential in a job template',
          name: 'Use',
          id: 30,
        },
        read_role: {
          description: 'May view settings for the credential',
          name: 'Read',
          id: 31,
        },
      },
      user_capabilities: {
        edit: false,
        delete: false,
        copy: true,
        use: true,
      },
      owners: [],
    },
    created: '2024-08-01T05:16:46.876532Z',
    modified: '2024-08-01T05:16:46.876540Z',
    name: 'Credential 1',
    description: '',
    organization: null,
    credential_type: 19,
    managed: true,
    inputs: {
      url: 'https://galaxy.ansible.com/',
    },
    kind: 'galaxy_api_token',
    cloud: false,
    kubernetes: false,
  },
];

const mockInstanceGroups = [
  {
    id: 1,
    type: 'instance_group',
    url: '/api/controller/v2/instance_groups/2/',
    related: {
      jobs: '/api/controller/v2/instance_groups/2/jobs/',
      instances: '/api/controller/v2/instance_groups/2/instances/',
      access_list: '/api/controller/v2/instance_groups/2/access_list/',
      object_roles: '/api/controller/v2/instance_groups/2/object_roles/',
    },
    name: 'Instance Group 1',
    created: '2024-08-01T05:16:36.353639Z',
    modified: '2024-08-01T05:16:36.402985Z',
    capacity: 297,
    consumed_capacity: 0,
    percent_capacity_remaining: 100.0,
    jobs_running: 0,
    max_concurrent_jobs: 0,
    max_forks: 0,
    jobs_total: 0,
    instances: 1,
    is_container_group: false,
    credential: null,
    policy_instance_percentage: 0,
    policy_instance_minimum: 0,
    policy_instance_list: ['dev-aap.gcp.testing.ansible.com'],
    pod_spec_override: '',
    summary_fields: {
      object_roles: {
        admin_role: {
          description: 'Can manage all aspects of the instance group',
          name: 'Admin',
          id: 6,
        },
        use_role: {
          description: 'Can use the instance group in a job template',
          name: 'Use',
          id: 7,
        },
        read_role: {
          description: 'May view settings for the instance group',
          name: 'Read',
          id: 8,
        },
      },
      user_capabilities: {
        edit: true,
        delete: false,
      },
    },
  },
];

const platformOrganization = {
  id: 1,
  url: '/api/platform/organizations/1/',
  name: 'Platform organization',
  description: 'Platform organization description',
  created: '2021-01-01T00:00:00Z',
  modified: '2021-01-01T00:00:00Z',
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
