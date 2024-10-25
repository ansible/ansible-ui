import { Config as AwxConfig } from '../../frontend/awx/interfaces/Config';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { CredentialType } from '../../frontend/awx/interfaces/CredentialType';
import { ExecutionEnvironment } from '../../frontend/awx/interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../frontend/awx/interfaces/InventorySource';
import { Job } from '../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../frontend/awx/interfaces/JobTemplate';
import { Organization as AwxOrganization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Schedule } from '../../frontend/awx/interfaces/Schedule';
import { Team as AwxTeam } from '../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../frontend/awx/interfaces/User';
import { WorkflowApproval } from '../../frontend/awx/interfaces/WorkflowApproval';
import { WorkflowJobTemplate } from '../../frontend/awx/interfaces/WorkflowJobTemplate';
import { PlatformOrganization } from '../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../platform/interfaces/PlatformTeam';
import { PlatformUser } from '../../platform/interfaces/PlatformUser';

interface IGatewayData {
  ping: object;
  me: DeepPartial<AwxUser>[];
  login: object;
  legacy_auth: object;
  ui_auth: {
    show_login_form: boolean;
    passwords: { name: string; type: string }[];
    ssos: unknown[];
    login_redirect_override: string;
    custom_login_info: string;
    custom_logo: string;
    managed_cloud_install: boolean;
  };
  session: object;
  organizations: DeepPartial<PlatformOrganization>[];
  users: DeepPartial<PlatformUser>[];
  teams: DeepPartial<PlatformTeam>[];
}

interface IControllerData {
  'execution-environments': DeepPartial<ExecutionEnvironment>[];
  config: DeepPartial<AwxConfig>;
  credential_types: DeepPartial<CredentialType>[];
  credentials: DeepPartial<Credential>[];
  instance_groups: DeepPartial<InstanceGroup>[];
  inventories: DeepPartial<Inventory>[];
  inventory_sources: DeepPartial<InventorySource>[];
  job_templates: DeepPartial<JobTemplate>[];
  jobs: DeepPartial<Job>[];
  me: DeepPartial<AwxUser>[];
  organizations: DeepPartial<AwxOrganization>[];
  projects: DeepPartial<Project>[];
  schedules: DeepPartial<Schedule>[];
  teams: DeepPartial<AwxTeam>[];
  unified_jobs: DeepPartial<Job>[];
  users: DeepPartial<AwxUser>[];
  workflow_approvals: DeepPartial<WorkflowApproval>[];
  workflow_job_templates: DeepPartial<WorkflowJobTemplate>[];
  hosts: object[];
  labels: object[];
  dashboard: object;
  unified_job_templates: object[];
}

export interface IApiData {
  api: {
    gateway: {
      v1: IGatewayData;
    };
    controller: {
      v2: IControllerData;
    };
  };
}

// Mock data for the API
// This data is used to mock the API responses in the tests
// The data is incomplete and only contains the fields that are used in the tests
export const mockData: IApiData = {
  api: {
    gateway: {
      v1: {
        ping: {},
        me: [],
        login: {},
        legacy_auth: {
          username: '',
          linked_accounts: [],
        },
        ui_auth: {
          show_login_form: true,
          passwords: [
            {
              name: 'Local Database Authenticator',
              type: 'ansible_base.authentication.authenticator_plugins.local',
            },
          ],
          ssos: [],
          login_redirect_override: '',
          custom_login_info: '',
          custom_logo: '',
          managed_cloud_install: false,
        },
        session: {},
        organizations: [{ id: 1, name: 'Default' }],
        users: [
          {
            id: 1,
            username: 'admin',
          },
        ],
        teams: [],
      },
    },
    controller: {
      v2: {
        me: [],
        config: { license_info: { compliant: true } },
        inventory_sources: [],
        inventories: [{ id: 1, name: 'Demo Inventory' }],
        job_templates: [],
        jobs: [],
        projects: [{ id: 1, name: 'Demo Project' }],
        schedules: [],
        workflow_job_templates: [],
        organizations: [{ id: 1, name: 'Default' }],
        teams: [],
        credentials: [],
        credential_types: [],
        users: [],
        workflow_approvals: [],
        unified_jobs: [],
        'execution-environments': [],
        instance_groups: [],
        hosts: [{ id: 1, name: 'localhost' }],
        labels: [],
        unified_job_templates: [],
        dashboard: {
          related: {
            jobs_graph: '/api/controller/v2/dashboard/graphs/jobs/',
          },
          inventories: {
            url: '/api/controller/v2/inventories/',
            total: 1,
            total_with_inventory_source: 0,
            job_failed: 0,
            inventory_failed: 0,
          },
          inventory_sources: {
            ec2: {
              url: '/api/controller/v2/inventory_sources/?source=ec2',
              failures_url: '/api/controller/v2/inventory_sources/?source=ec2&status=failed',
              label: 'Amazon EC2',
              total: 0,
              failed: 0,
            },
          },
          groups: {
            url: '/api/controller/v2/groups/',
            total: 0,
            inventory_failed: 0,
          },
          hosts: {
            url: '/api/controller/v2/hosts/',
            failures_url: '/api/controller/v2/hosts/?last_job_host_summary__failed=True',
            total: 1,
            failed: 0,
          },
          projects: {
            url: '/api/controller/v2/projects/',
            failures_url: '/api/controller/v2/projects/?last_job_failed=True',
            total: 7,
            failed: 0,
          },
          scm_types: {
            git: {
              url: '/api/controller/v2/projects/?scm_type=git',
              label: 'Git',
              failures_url: '/api/controller/v2/projects/?scm_type=git&last_job_failed=True',
              total: 7,
              failed: 0,
            },
            svn: {
              url: '/api/controller/v2/projects/?scm_type=svn',
              label: 'Subversion',
              failures_url: '/api/controller/v2/projects/?scm_type=svn&last_job_failed=True',
              total: 0,
              failed: 0,
            },
            archive: {
              url: '/api/controller/v2/projects/?scm_type=archive',
              label: 'Remote Archive',
              failures_url: '/api/controller/v2/projects/?scm_type=archive&last_job_failed=True',
              total: 0,
              failed: 0,
            },
          },
          users: {
            url: '/api/controller/v2/users/',
            total: 10,
          },
          organizations: {
            url: '/api/controller/v2/organizations/',
            total: 1,
          },
          teams: {
            url: '/api/controller/v2/teams/',
            total: 0,
          },
          credentials: {
            url: '/api/controller/v2/credentials/',
            total: 8,
          },
          job_templates: {
            url: '/api/controller/v2/job_templates/',
            total: 1,
          },
        },
      },
    },
  },
};

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
