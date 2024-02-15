export interface SummaryFieldRecentJob {
  id: number;
  status: string;
  finished: string | null;
  canceled_on?: string | null;
  type: string;
}
export interface SummaryFieldsOrganization {
  id: number;
  name: string;
  description: string;
}

export interface SummaryFieldsByUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface SummaryFieldObjectRole {
  description: string;
  name: string;
  id: number;
  user_only?: boolean;
}

export interface SummaryFieldsExecutionEnvironment {
  id: number;
  name: string;
  description: string;
  image: string;
}

export interface SummaryFieldCredential {
  id: number;
  name: string;
  description: string;
  kind: string;
  cloud: boolean;
}

export interface SummaryFieldJob {
  id: number;
  name: string;
  description: string;
  status: string;
  failed: boolean;
  elapsed: number;
}

export interface SummaryFieldInventory {
  description: string;
  has_active_failures: boolean;
  has_inventory_sources: boolean;
  hosts_with_active_failures: number;
  id: number;
  inventory_sources_with_failures: number;
  kind: string;
  name: string;
  organization_id: number;
  total_groups: number;
  total_hosts: number;
  total_inventory_sources: number;
}
export interface SummaryFieldInstance {
  id: number;
  hostname: string;
}

export interface SummaryFieldWorkflowJob {
  id: number;
  name: string;
  description: string;
}

export interface SummaryFieldWorkflowJobTemplate {
  id: number;
  name: string;
  description: string;
}

export interface SummaryFieldWorkflowApprovalTemplate {
  id: number;
  name: string;
  description: string;
  timeout: number;
}

export interface SummaryFieldUnifiedJobTemplate {
  id: number;
  name: string;
  description: string;
  unified_job_type: string;
}

export interface SummaryFieldInventory {
  id: number;
  name: string;
  description: string;
  has_active_failures: boolean;
  total_hosts: number;
  hosts_with_active_failures: number;
  total_groups: number;
  has_inventory_sources: boolean;
  total_inventory_sources: number;
  inventory_sources_with_failures: number;
  organization_id: number;
  kind: string;
}

export interface JobSummaryFields {
  organization?: SummaryFieldsOrganization;
  inventory?: {
    id: number;
    name: string;
    description: string;
    has_active_failures: boolean;
    total_hosts: number;
    hosts_with_active_failures: number;
    total_groups: number;
    has_inventory_sources: boolean;
    total_inventory_sources: number;
    inventory_sources_with_failures: number;
    organization_id: number;
    kind: string;
  };
  execution_environment?: SummaryFieldsExecutionEnvironment;
  project?: {
    id: number;
    name: string;
    description: string;
    status: string;
    scm_type: string;
    allow_override: boolean;
  };
  project_update?: {
    id: number;
    name: string;
    description: string;
    status: string;
    failed: boolean;
  };
  job_template?: {
    id: number;
    name: string;
    description: string;
  };
  unified_job_template?: {
    id: number;
    name: string;
    description: string;
    unified_job_type: string;
  };
  instance_group?: {
    id: number;
    name: string;
    is_container_group: boolean;
  };
  created_by?: SummaryFieldsByUser;
  user_capabilities: {
    delete: boolean;
    start: boolean;
  };
  labels?: {
    count: number;
    results: { id: number; name: string }[];
  };
  credentials?: SummaryFieldCredential[];
  workflow_job_template?: {
    id: number;
    name: string;
    description: string;
  };
  modified_by?: SummaryFieldsByUser;
  source_workflow_job?: {
    id: number;
    name: string;
    description: string;
    status: string;
    failed: boolean;
    elapsed: number;
  };
  schedule?: {
    id: number;
    name: string;
    description: string;
    next_run: string;
  };
  recent_jobs?: SummaryFieldRecentJob[];
}
