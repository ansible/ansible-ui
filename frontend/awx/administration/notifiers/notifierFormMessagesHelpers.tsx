import { MessagesType } from './NotifierFormMessages';

export function getDefaultMessages(notification_type: string | null) {
  let obj: MessagesType = {
    started: {},
    success: {},
    error: {},
    workflow_approval: { denied: {}, running: {}, approved: {}, timed_out: {} },
  };

  if (notification_type !== 'webhook') {
    obj = {
      started: {
        message: `{{ job_friendly_name }} #{{ job.id }} '{{ job.name }}' {{ job.status }}: {{ url }}`,
      },
      success: {
        message: `{{ job_friendly_name }} #{{ job.id }} '{{ job.name }}' {{ job.status }}: {{ url }}`,
      },
      error: {
        message: `{{ job_friendly_name }} #{{ job.id }} '{{ job.name }}' {{ job.status }}: {{ url }}`,
      },
      workflow_approval: {
        denied: {
          message: `The approval node "{{ approval_node_name }}" was denied. {{ workflow_url }}`,
        },
        running: {
          message: `The approval node "{{ approval_node_name }}" needs review. This node can be viewed at: {{ workflow_url }}`,
        },
        approved: {
          message: `The approval node "{{ approval_node_name }}" was approved. {{ workflow_url }}`,
        },
        timed_out: {
          message: `The approval node "{{ approval_node_name }}" has timed out. {{ workflow_url }}`,
        },
      },
    };
  }

  if (notification_type === 'email') {
    obj.error.body =
      obj.started.body =
      obj.success.body =
        `{{ job_friendly_name }} #{{ job.id }} had status {{ job.status }}, view details at {{ url }}
      
  {{ job_metadata }}`;
  }

  if (notification_type === 'pagerduty' || notification_type === 'webhook') {
    obj.error.body = obj.started.body = obj.success.body = `{{ job_metadata }}`;
  }

  if (notification_type === 'email' || notification_type === 'pagerduty') {
    obj.workflow_approval.approved.body = `The approval node "{{ approval_node_name }}" was approved. {{ workflow_url }}
  
  {{ job_metadata }}`;

    obj.workflow_approval.denied.body = `The approval node "{{ approval_node_name }}" was denied. {{ workflow_url }}
    
  {{ job_metadata }}`;

    obj.workflow_approval.running.body = `The approval node "{{ approval_node_name }}" needs review. This approval node can be viewed at: {{ workflow_url }}
    
  {{ job_metadata }}`;

    obj.workflow_approval.timed_out.body = `The approval node "{{ approval_node_name }}" has timed out. {{ workflow_url }}
    
  {{ job_metadata }}`;
  }

  if (notification_type === 'webhook') {
    obj.workflow_approval.approved.body = `{"body": "The approval node "{{ approval_node_name }}" was approved. {{ workflow_url }}"}`;
    obj.workflow_approval.denied.body = `{"body": "The approval node "{{ approval_node_name }}" was denied. {{ workflow_url }}"}`;
    obj.workflow_approval.running.body = `{"body": "The approval node "{{ approval_node_name }}" needs review. This node can be viewed at: {{ workflow_url }}"}`;
    obj.workflow_approval.timed_out.body = `{"body": "The approval node "{{ approval_node_name }}" has timed out. {{ workflow_url }}"}`;
  }

  return obj;
}
