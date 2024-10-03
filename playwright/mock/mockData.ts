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
        inventories: [],
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
      },
    },
  },
};

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
