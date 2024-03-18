import { useCallback, useState } from 'react';
import { useAwxWebSocketSubscription } from '../../../../common/useAwxWebSocket';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { Job } from '../../../../interfaces/Job';

export type WebSocketMessage = {
  group_name?: string;
  type?: string;
  status?: string;
  inventory_id?: number;
  unified_job_id?: number;
  workflow_node_id?: number;
  finished?: string;
};
export type WebSocketWorkflowNode = WorkflowNode & { job?: WebSocketMessage };
export function useWorkflowOutput(reloadJob: () => void, job?: Job) {
  const [message, setMessage] = useState<WebSocketMessage>();

  const handleWebSocketMessage = useCallback(
    (message?: WebSocketMessage) => {
      if (!message) return;
      setMessage(message);
      if (
        message?.group_name === 'jobs' &&
        message?.unified_job_id?.toString() === job?.id.toString() &&
        message?.status
      ) {
        reloadJob();
      }
    },
    [job?.id, reloadJob]
  );
  useAwxWebSocketSubscription(
    {
      control: ['limit_reached_1'],
      group: ['workflow_jobs'],
      jobs: ['status_changed'],
    },
    handleWebSocketMessage as (message: unknown) => void
  );

  return message;
}
