import { useCallback, useState } from 'react';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxWebSocketSubscription } from '../../../../common/useAwxWebSocket';
import { useAwxGetAllPages } from '../../../../common/useAwxGetAllPages';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';

export type WebSocketMessage = {
  group_name?: string;
  type?: string;
  status?: string;
  inventory_id?: number;
  unified_job_id?: number;
  workflow_node_id?: number;
};
export type WebSocketWorkflowNode = WorkflowNode & { job?: WebSocketMessage };
export function useWorkflowOuput(jobId: string) {
  const [message, setMessage] = useState<WebSocketMessage>();
  const { refresh } = useAwxGetAllPages<WorkflowNode>(
    awxAPI`/workflow_jobs/${jobId}/workflow_nodes/`
  );

  const handleWebSocketMessage = useCallback(
    (message?: WebSocketMessage) => {
      if (!message) return;
      setMessage(message);
      if (
        message?.group_name === 'workflow_jobs' &&
        message?.unified_job_id?.toString() === jobId &&
        message?.status
      ) {
        refresh();
      }
    },
    [refresh, jobId]
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
