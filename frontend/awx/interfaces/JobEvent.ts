import { SetRequired } from 'type-fest';
import { JobEvent as SwaggerJobEvent } from './generated-from-swagger/api';
import { SummaryFieldJob } from './summary-fields/summary-fields';

export interface JobEvent extends Omit<SetRequired<SwaggerJobEvent, 'counter'>, 'summary_fields'> {
  summary_fields: {
    job: SummaryFieldJob;
  };
  event_data?: {
    host?: string;
    task_action?: string;
    res?: { stderr?: string; result?: { stdout?: string | string[] | object } } & Record<
      string,
      unknown
    >;
  } & Record<string, unknown>;
}
