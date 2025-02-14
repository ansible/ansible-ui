import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { CredentialType } from '@ansible/awx-ui/interfaces/CredentialType';
import { ExecutionEnvironment } from '@ansible/awx-ui/interfaces/ExecutionEnvironment';
import { WorkflowJob } from '@ansible/awx-ui/interfaces/generated-from-swagger/api';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { InventorySource } from '@ansible/awx-ui/interfaces/InventorySource';
import { Job } from '@ansible/awx-ui/interfaces/Job';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Label } from '@ansible/awx-ui/interfaces/Label';
import { Organization as AwxOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { Schedule } from '@ansible/awx-ui/interfaces/Schedule';
import { Team as AwxTeam } from '@ansible/awx-ui/interfaces/Team';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { WorkflowApproval } from '@ansible/awx-ui/interfaces/WorkflowApproval';
import { WorkflowJobTemplate } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import { Config as AwxConfig } from '@ansible/common-ui/interfaces/Config';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';

interface IGatewayData {
  ping: object;
  me: DeepPartial<PlatformUser>[];
  login: object;
  legacy_auth: object;
  ui_auth: object;
  session: object;
  organizations: DeepPartial<PlatformOrganization>[];
  users: DeepPartial<PlatformUser>[];
  teams: DeepPartial<PlatformTeam>[];
  applications: object[];
}

interface IControllerData {
  auth: DeepPartial<object>;
  config: DeepPartial<AwxConfig>;
  credential_types: DeepPartial<CredentialType>[];
  credentials: DeepPartial<Credential>[];
  instance_groups: DeepPartial<InstanceGroup>[];
  inventories: DeepPartial<Inventory>[];
  inventory_sources: DeepPartial<InventorySource>[];
  job_templates: DeepPartial<JobTemplate>[];
  jobs: DeepPartial<Job>[];
  workflow_jobs: DeepPartial<WorkflowJob>[];
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
  labels: DeepPartial<Label>[];
  dashboard: object;
  execution_environments: DeepPartial<ExecutionEnvironment>[];
}

export interface IApiData {
  api: {
    gateway: {
      v1: IGatewayData;
    };
    controller: {
      v2: IControllerData;
    };
    galaxy: object;
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
          legacy_controller_sso_url: 'https://legacy_controller',
          legacy_automation_hub_sso_url: 'https://legacy_hub',
          legacy_auth_enabled: true,
        },
        session: {},
        organizations: [{ id: 1, name: 'Default' }],
        users: [
          {
            id: 1,
            username: process.env.PLATFORM_USERNAME,
            password: process.env.PLATFORM_PASSWORD,
          },
        ],
        teams: [],
        applications: [],
      },
    },
    controller: {
      v2: {
        me: [],
        auth: {
          oidc: {
            login_url: '/sso/login/oidc/',
            complete_url: `https://localhost:4100/sso/complete/oidc/`,
          },
          'saml:keycloak': {
            login_url: '/sso/login/saml/?idp=keycloak',
            complete_url: 'https://localhost:4100/sso/complete/saml/',
            metadata_url: '/sso/metadata/saml/',
          },
        },
        config: { license_info: { compliant: true } },
        inventory_sources: [],
        inventories: [{ id: 1, name: 'Demo Inventory' }],
        jobs: [],
        projects: [{ id: 1, name: 'Demo Project' }],
        schedules: [],
        job_templates: [{ id: 1, name: 'Demo Job Template', type: 'job_template' }],
        workflow_job_templates: [],
        organizations: [{ id: 1, name: 'Default' }],
        teams: [],
        credentials: [],
        credential_types: [],
        users: [],
        workflow_approvals: [],
        unified_jobs: [],
        workflow_jobs: [],
        execution_environments: [{ id: 1, name: 'Default' }],
        instance_groups: [],
        hosts: [{ id: 1, name: 'localhost' }],
        labels: [],
        dashboard: {
          related: { jobs_graph: '/api/controller/v2/dashboard/graphs/jobs/' },
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
    galaxy: {
      _ui: {
        v1: {
          settings: {
            GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS: false,
            GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_DOWNLOAD: false,
            GALAXY_FEATURE_FLAGS: {
              legacy_roles: false,
              external_authentication: true,
              display_repositories: true,
              execution_environments: true,
              ai_deny_index: false,
              dab_resource_registry: true,
              collection_signing: true,
              require_upload_signatures: false,
              signatures_enabled: true,
              can_upload_signatures: false,
              can_create_signatures: true,
              collection_auto_sign: true,
              display_signatures: true,
              container_signing: true,
              _messages: [],
            },
            GALAXY_TOKEN_EXPIRATION: 1440,
            GALAXY_REQUIRE_CONTENT_APPROVAL: true,
            GALAXY_COLLECTION_SIGNING_SERVICE: 'ansible-default',
            GALAXY_AUTO_SIGN_COLLECTIONS: true,
            GALAXY_SIGNATURE_UPLOAD_ENABLED: false,
            GALAXY_REQUIRE_SIGNATURE_FOR_APPROVAL: false,
            GALAXY_MINIMUM_PASSWORD_LENGTH: null,
            GALAXY_AUTH_LDAP_ENABLED: null,
            GALAXY_CONTAINER_SIGNING_SERVICE: 'container-default',
            GALAXY_LDAP_MIRROR_ONLY_EXISTING_GROUPS: false,
            GALAXY_LDAP_DISABLE_REFERRALS: null,
            KEYCLOAK_URL: 'https://keycloak',
            ANSIBLE_BASE_JWT_VALIDATE_CERT: true,
            ANSIBLE_BASE_JWT_KEY: 'https://3.86.39.249:443',
            ALLOW_LOCAL_RESOURCE_MANAGEMENT: true,
            ANSIBLE_BASE_ROLES_REQUIRE_VIEW: false,
            DYNACONF_AFTER_GET_HOOKS: ['read_settings_from_cache_or_db', 'alter_hostname_settings'],
            ANSIBLE_API_HOSTNAME: 'https://3.86.39.249:443',
            ANSIBLE_CONTENT_HOSTNAME: 'https://3.86.39.249:443',
            CONTENT_ORIGIN: 'https://3.86.39.249:443',
            TOKEN_SERVER: 'https://3.86.39.249:443/token/',
            TOKEN_AUTH_DISABLED: null,
          },
        },
      },
    },
  },
};

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
