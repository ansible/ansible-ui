import { ActivityStream as SwaggerActivityStream } from './generated-from-swagger/api';
// import {
//   SummaryFieldCredential,
//   SummaryFieldInventory,
//   SummaryFieldsByUser,
//   SummaryFieldsOrganization,
//   SummaryFieldJob,
//   SummaryFieldWorkflowJob,
//   SummaryFieldWorkflowApprovalTemplate,
//   SummaryFieldInstance,
// } from './summary-fields/summary-fields';
interface IActor {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}
export interface ActivityStream
  extends Omit<
    SwaggerActivityStream,
    'related' | 'summary_fields' | 'changes' | 'id' | 'operation' | 'object1' | 'object2' | 'role'
  > {
  operation: string;
  object1: keyof Omit<ActivityStream['summary_fields'], 'actor'>;
  object2: keyof Omit<ActivityStream['summary_fields'], 'actor'>;
  id: number;
  summary_fields: {
    [key: string]: Record<string, string>[] | undefined;
  } & {
    actor?: IActor;
  };
  // summary_fields: {
  //   user?: SummaryFieldsByUser[];
  //   organization?: SummaryFieldsOrganization[];
  //   credential?: SummaryFieldCredential[];
  //   inventory?: SummaryFieldInventory[];
  //   instance?: SummaryFieldInstance[];
  //   job_template?: SummaryFieldJob[];
  //   workflow_job_template?: SummaryFieldWorkflowJob[];
  //   workflow_job?: SummaryFieldWorkflowJob[];
  //   workflow_approval?: SummaryFieldWorkflowApprovalTemplate[];
  //   workflow_approval_template?: SummaryFieldWorkflowApprovalTemplate[];
  //   setting?: {
  //     id: number;
  //     name: string;
  //     category: string;
  //   }[];
  //   project?: {
  //     id: number;
  //     name: string;
  //     description: string;
  //     status: string;
  //     scm_type: string;
  //     allow_override: boolean;
  //   }[];
  //   system_job_template?: {
  //     id: number;
  //   }[];
  //   role?: {
  //     id: number;
  //     role_field: string;
  //   }[];
  //   actor?: {
  //     id?: number;
  //     username?: string;
  //     first_name?: string;
  //     last_name?: string;
  //   };
  // };
  changes?: {
    inventory: string;
    id: number;
    object1_pk: number;
    name: string;
  };
}
