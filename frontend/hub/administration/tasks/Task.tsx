export interface Task {
  name: string;
  pulp_href: string;
  pulp_created: string;
  created_by: string;
  started_at: string;
  finished_at: string;
  state: 'completed' | 'failed' | 'running' | 'waiting' | 'canceled' | 'skipped';
  error?: TaskError;
  worker: string;
  logging_cid: string;
  task_group: string;
  parent_task: string;
  child_tasks: string[];
  progress_reports: [];
  created_resources: unknown[];
  reserved_resources_record: string[];
}

interface TaskError {
  code: string;
  description: string;
  traceback: string;
}

export interface TaskResponse {
  task: string;
}
