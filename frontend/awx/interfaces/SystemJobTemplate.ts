import { SystemJobTemplate as SwaggerSystemJobTemplate } from './generated-from-swagger/api';

export interface SystemJobTemplate
  extends Omit<
    SwaggerSystemJobTemplate,
    'id' | 'name' | 'description' | 'type' | 'summary_fields' | 'related' | 'job_type'
  > {
  id: number;
  name: string;
  description: string;
  type: 'system_job_template';
  job_type: 'cleanup_jobs' | 'cleanup_activitystream' | 'cleanup_sessions' | 'cleanup_tokens';
  related: {
    last_job: string;
    next_schedule: string;
    jobs: string;
    schedules: string;
    launch: string;
    notification_templates_started: string;
    notification_templates_success: string;
    notification_templates_error: string;
  };
  summary_fields: {
    last_job: {
      id: number;
      name: string;
      description: string;
      finished: string;
      status: string;
      failed: boolean;
    };
    last_update: {
      id: number;
      name: string;
      description: string;
      status: string;
      failed: boolean;
    };
    resolved_environment: {
      id: number;
      name: string;
      description: string;
      image: string;
    };
  };
}
