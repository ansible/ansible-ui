export interface Task {
  name: string;
  pulp_href: string;
  pulp_created: string;
  started_at: string;
  finished_at: string;
  state: 'completed' | 'failed' | 'running' | 'waiting';
  error?: TaskError;
}

interface TaskError {
  code: string;
  description: string;
  traceback: string;
}
export interface TaskResponse {
  task: string;
}
