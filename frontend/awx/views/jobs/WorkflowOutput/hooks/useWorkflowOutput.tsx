import { useWSThrottle } from '@ansible/awx-ui/common/useWSThrottle';
import { useCallback, useEffect, useState } from 'react';
import { useAwxWebSocketSubscription } from '../../../../common/useAwxWebSocket';
import { Job } from '../../../../interfaces/Job';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';

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

  const handleWebSocketMessage = useCallback((message?: WebSocketMessage) => {
    if (message) {
      setMessage(message);
    }
  }, []);
  useAwxWebSocketSubscription(
    {
      control: ['limit_reached_1'],
      group: ['workflow_jobs'],
      jobs: ['status_changed'],
    },
    handleWebSocketMessage as (message: unknown) => void
  );
  const throttledMessage = useWSThrottle({
    value: message,
    limit: 500,
  });
  useEffect(() => {
    if (
      throttledMessage?.group_name === 'jobs' &&
      throttledMessage.unified_job_id?.toString() === job?.id.toString() &&
      throttledMessage.status
    ) {
      reloadJob();
    }
  }, [throttledMessage, job?.id, reloadJob]);

  return throttledMessage;
}
