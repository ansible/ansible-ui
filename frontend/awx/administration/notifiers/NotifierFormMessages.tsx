import { useFormContext } from 'react-hook-form';
import { PageFormTextArea } from '../../../../framework';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { PageFormTextInput } from '../../../../framework';

import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { NotificationTemplateEdit } from './NotifierForm';

export function NotifierFormMessages(props: {
  customize_messages: boolean;
  data: NotificationTemplate | NotificationTemplateEdit | undefined;
}) {
  const { t } = useTranslation();
  const formContext = useFormContext<NotificationTemplate>();
  const notification_type = formContext.getValues('notification_type');
  const [oldType, setOldType] = useState('');

  let type_changed = false;

  if (oldType) {
    if (notification_type !== oldType) {
      if (oldType !== '') {
        type_changed = true;
      }
      setOldType(notification_type || '');
    }
  }

  let hasMessages = true;
  let hasBody = false;

  if (notification_type === 'email' || notification_type === 'pagerduty') {
    hasBody = true;
  }

  if (notification_type === 'webhook') {
    hasBody = true;
    hasMessages = false;
  }

  const { data, customize_messages } = props;

  const defaultMessages = getDefaultMessages(notification_type);
  const setValue = formContext.setValue;
  const getValues = formContext.getValues;

  if (type_changed && customize_messages === true) {
    setValue('messages', defaultMessages);
  }

  if (customize_messages === true && type_changed === false) {
    // For error.message
    if (hasMessages) {
      if (!data?.messages?.error?.message) {
        setValue('messages.error.message', defaultMessages.error.message);
      } else {
        if (!getValues('messages.error.message')) {
          setValue('messages.error.message', data.messages.error.message);
        }
      }
    }

    if (hasBody) {
      // For error.body
      if (!data?.messages?.error?.body) {
        setValue('messages.error.body', defaultMessages.error.body);
      } else {
        if (!getValues('messages.error.body')) {
          setValue('messages.error.body', data.messages.error.body);
        }
      }
    }

    if (hasMessages) {
      // For started.message
      if (!data?.messages?.started?.message) {
        setValue('messages.started.message', defaultMessages.started.message);
      } else {
        if (!getValues('messages.started.message')) {
          setValue('messages.started.message', data.messages.started.message);
        }
      }
    }

    if (hasBody) {
      // For started.body
      if (!data?.messages?.started?.body) {
        setValue('messages.started.body', defaultMessages.started.body);
      } else {
        if (!getValues('messages.started.body')) {
          setValue('messages.started.body', data.messages.started.body);
        }
      }
    }

    if (hasMessages) {
      // For success.message
      if (!data?.messages?.success?.message) {
        setValue('messages.success.message', defaultMessages.success.message);
      } else {
        if (!getValues('messages.success.message')) {
          setValue('messages.success.message', data.messages.success.message);
        }
      }
    }

    if (hasBody) {
      // For success.body
      if (!data?.messages?.success?.body) {
        setValue('messages.success.body', defaultMessages.success.body);
      } else {
        if (!getValues('messages.success.body')) {
          setValue('messages.success.body', data.messages.success.body);
        }
      }
    }

    if (hasMessages) {
      // For workflow_approval.approved.message
      if (!data?.messages?.workflow_approval?.approved?.message) {
        setValue(
          'messages.workflow_approval.approved.message',
          defaultMessages.workflow_approval.approved.message
        );
      } else {
        if (!getValues('messages.workflow_approval.approved.message')) {
          setValue(
            'messages.workflow_approval.approved.message',
            data.messages.workflow_approval.approved.message
          );
        }
      }
    }

    if (hasBody) {
      // For workflow_approval.approved.body
      if (!data?.messages?.workflow_approval?.approved?.body) {
        setValue(
          'messages.workflow_approval.approved.body',
          defaultMessages.workflow_approval.approved.body
        );
      } else {
        if (!getValues('messages.workflow_approval.approved.body')) {
          setValue(
            'messages.workflow_approval.approved.body',
            data.messages.workflow_approval.approved.body
          );
        }
      }
    }

    if (hasMessages) {
      // For workflow_approval.denied.message
      if (!data?.messages?.workflow_approval?.denied?.message) {
        setValue(
          'messages.workflow_approval.denied.message',
          defaultMessages.workflow_approval.denied.message
        );
      } else {
        if (!getValues('messages.workflow_approval.denied.message')) {
          setValue(
            'messages.workflow_approval.denied.message',
            data.messages.workflow_approval.denied.message
          );
        }
      }
    }

    if (hasBody) {
      if (!data?.messages?.workflow_approval?.denied?.body) {
        // For workflow_approval.denied.body
        setValue(
          'messages.workflow_approval.denied.body',
          defaultMessages.workflow_approval.denied.body
        );
      } else {
        if (!getValues('messages.workflow_approval.denied.body')) {
          setValue(
            'messages.workflow_approval.denied.body',
            data.messages.workflow_approval.denied.body
          );
        }
      }
    }

    if (hasMessages) {
      // For workflow_approval.running.message
      if (!data?.messages?.workflow_approval?.running?.message) {
        setValue(
          'messages.workflow_approval.running.message',
          defaultMessages.workflow_approval.running.message
        );
      } else {
        if (!getValues('messages.workflow_approval.running.message')) {
          setValue(
            'messages.workflow_approval.running.message',
            data.messages.workflow_approval.running.message
          );
        }
      }
    }

    if (hasBody) {
      // For workflow_approval.running.body
      if (!data?.messages?.workflow_approval?.running?.body) {
        setValue(
          'messages.workflow_approval.running.body',
          defaultMessages.workflow_approval.running.body
        );
      } else {
        if (!getValues('messages.workflow_approval.running.body')) {
          setValue(
            'messages.workflow_approval.running.body',
            data.messages.workflow_approval.running.body
          );
        }
      }
    }

    if (hasMessages) {
      // For workflow_approval.timed_out.message
      if (!data?.messages?.workflow_approval?.timed_out?.message) {
        setValue(
          'messages.workflow_approval.timed_out.message',
          defaultMessages.workflow_approval.timed_out.message
        );
      } else {
        if (!getValues('messages.workflow_approval.timed_out.message')) {
          setValue(
            'messages.workflow_approval.timed_out.message',
            data.messages.workflow_approval.timed_out.message
          );
        }
      }
    }

    if (hasBody) {
      // For workflow_approval.timed_out.body
      if (!data?.messages?.workflow_approval?.timed_out?.body) {
        setValue(
          'messages.workflow_approval.timed_out.body',
          defaultMessages.workflow_approval.timed_out.body
        );
      } else {
        if (!getValues('messages.workflow_approval.timed_out.body')) {
          setValue(
            'messages.workflow_approval.timed_out.body',
            data.messages.workflow_approval.timed_out.body
          );
        }
      }
    }
  }

  if (customize_messages !== true) {
    return <></>;
  }

  return (
    <>
      {hasMessages && (
        <PageFormTextInput<NotificationTemplate>
          name="messages.started.message"
          label={t('Start message')}
        />
      )}
      {hasBody && (
        <PageFormTextArea<NotificationTemplate>
          name="messages.started.body"
          label={t('Start message body')}
        />
      )}

      {hasMessages && (
        <PageFormTextInput<NotificationTemplate>
          name="messages.success.message"
          label={t('success message')}
        />
      )}

      {hasBody && (
        <PageFormTextArea<NotificationTemplate>
          name="messages.success.body"
          label={t('success message body')}
        />
      )}

      {hasMessages && (
        <PageFormTextInput<NotificationTemplate>
          name="messages.error.message"
          label={t('Error message')}
        />
      )}

      {hasBody && (
        <PageFormTextArea<NotificationTemplate>
          name="messages.error.body"
          label={t('Error message body')}
        />
      )}

      {hasMessages && (
        <PageFormTextInput<NotificationTemplate>
          name="messages.workflow_approval.approved.message"
          label={t('Workflow approved message')}
        />
      )}

      {hasBody && (
        <PageFormTextArea<NotificationTemplate>
          name="messages.workflow_approval.approved.body"
          label={t('Workflow approved body')}
        />
      )}

      {hasMessages && (
        <PageFormTextInput<NotificationTemplate>
          name="messages.workflow_approval.denied.message"
          label={t('Workflow denied message')}
        />
      )}

      {hasBody && (
        <PageFormTextArea<NotificationTemplate>
          name="messages.workflow_approval.denied.body"
          label={t('Workflow denied message body')}
        />
      )}

      {hasMessages && (
        <PageFormTextInput<NotificationTemplate>
          name="messages.workflow_approval.running.message"
          label={t('Workflow pending message')}
        />
      )}

      {hasBody && (
        <PageFormTextArea<NotificationTemplate>
          name="messages.workflow_approval.running.body"
          label={t('Workflow pending message body')}
        />
      )}

      {hasMessages && (
        <PageFormTextInput<NotificationTemplate>
          name="messages.workflow_approval.timed_out.message"
          label={t('Workflow timed out message')}
        />
      )}

      {hasBody && (
        <PageFormTextArea<NotificationTemplate>
          name="messages.workflow_approval.timed_out.body"
          label={t('Workflow timed out message body')}
        />
      )}
    </>
  );
}

type NotificationType = {
  message?: string | undefined;
  body?: string | undefined;
};

type WorkflowApprovalMessages = {
  denied: NotificationType;
  running: NotificationType;
  approved: NotificationType;
  timed_out: NotificationType;
};

type MessagesType = {
  error: NotificationType;
  started: NotificationType;
  success: NotificationType;
  workflow_approval: WorkflowApprovalMessages;
};

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

export function areMessagesEmpty(data: NotificationTemplate) {
  if (
    data?.messages?.error?.message ||
    data?.messages?.error?.body ||
    data?.messages?.started?.message ||
    data?.messages?.started?.body ||
    data?.messages?.success?.message ||
    data?.messages?.success?.body ||
    data?.messages?.workflow_approval?.approved?.message ||
    data?.messages?.workflow_approval?.approved?.body ||
    data?.messages?.workflow_approval?.denied?.message ||
    data?.messages?.workflow_approval?.denied?.body ||
    data?.messages?.workflow_approval?.running?.message ||
    data?.messages?.workflow_approval?.running?.body ||
    data?.messages?.workflow_approval?.timed_out?.message ||
    data?.messages?.workflow_approval?.timed_out?.body
  ) {
    return false;
  }

  return true;
}
