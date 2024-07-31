export interface Config {
  time_zone: string;
  license_info: ILicenseInfo;
  version: string;
  platformVersion?: string;
  eula: string;
  analytics_status: string;
  analytics_collectors: {
    config: {
      name: string;
      version: string;
      description: string;
    };
    counts: {
      name: string;
      version: string;
      description: string;
    };
    cred_type_counts: {
      name: string;
      version: string;
      description: string;
    };
    events_table: {
      name: string;
      version: string;
      description: string;
    };
    instance_info: {
      name: string;
      version: string;
      description: string;
    };
    inventory_counts: {
      name: string;
      version: string;
      description: string;
    };
    org_counts: {
      name: string;
      version: string;
      description: string;
    };
    projects_by_scm_type: {
      name: string;
      version: string;
      description: string;
    };
    query_info: {
      name: string;
      version: string;
      description: string;
    };
    unified_job_template_table: {
      name: string;
      version: string;
      description: string;
    };
    unified_jobs_table: {
      name: string;
      version: string;
      description: string;
    };
    workflow_job_node_table: {
      name: string;
      version: string;
      description: string;
    };
    workflow_job_template_node_table: {
      name: string;
      version: string;
      description: string;
    };
  };
  become_methods: string[][];
  ui_next?: boolean;
  project_base_dir: string;
  project_local_paths: unknown[];
  custom_virtualenvs: unknown[];
}

export interface ILicenseInfo {
  subscription_name: string;
  sku: string;
  support_level: string;
  instance_count: number;
  license_date: number;
  license_type: string;
  product_name: string;
  valid_key: boolean;
  usage: '';
  trial: boolean;
  satellite: null;
  pool_id: string;
  subscription_id: string;
  account_number: string;
  deleted_instances: number;
  reactivated_instances: number;
  current_instances: number;
  automated_instances: number;
  automated_since: number;
  free_instances: number;
  time_remaining: number;
  grace_period_remaining: number;
  compliant: boolean;
  date_warning: boolean;
  date_expired: boolean;
}
