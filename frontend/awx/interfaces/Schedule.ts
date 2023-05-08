import { Schedule as SwaggerSchedule } from './generated-from-swagger/api';

export interface Schedule
  extends Omit<SwaggerSchedule, 'summary_fields' | 'id' | 'name' | 'related'> {
  id: number;
  name: string;
  related: { unified_job_template: string };
  summary_fields: {
    unified_job_template: {
      id: number;
      name: string;
      description: string;
      unified_job_type: string;
      job_type: string;
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
}
