/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageFormSubmitHandler,
  PageFormSwitch,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { AwxPageForm } from '../../common/AwxPageForm';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { AwxRoute } from '../../main/AwxRoutes';

import { awxAPI } from '../../common/api/awx-utils';
import { useGet } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { PageFormSelectOrganization } from '../../access/organizations/components/PageFormOrganizationSelect';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';

import { useOptions } from '../../../common/crud/useOptions';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePageNavigate } from '../../../../framework';

import { InnerForm } from './NotifierFormInner';
import { Trans } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

export function EditNotifier() {
  return <NotifierForm mode={'edit'} />;
}

export function AddNotifier() {
  return <NotifierForm mode={'add'} />;
}

export type NotificationTemplateOptions = {
  actions: {
    GET: {
      notification_configuration: Record<
        string,
        Record<string, { label: string; type: string; default: unknown }>
      >;
    };
  };
};

type NotificationTemplateEdit = Omit<NotificationTemplate, 'id'> & { customize_messages?: boolean };
type CustomizeMessageType = NotificationTemplate & { customize_messages?: boolean };

// TODO - finish rest of the form in the next PR
function NotifierForm(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { mode } = props;
  const params = useParams<{ id: string }>();
  const getUrl = mode === 'add' ? '' : awxAPI`/notification_templates/${params.id || ''}/`;
  const notifierRequest = useGet<NotificationTemplate>(getUrl);
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const patchRequest = usePatchRequest();
  const postRequest = usePostRequest();

  const optionsRequest = useOptions<NotificationTemplateOptions>(awxAPI`/notification_templates/`);

  const breadcrumbs: ICatalogBreadcrumb[] = [
    { label: t('Notifications'), to: getPageUrl(AwxRoute.NotificationTemplates) },
    { label: mode === 'add' ? t('Add') : t('Edit') },
  ];

  if (notifierRequest.error) {
    return <AwxError error={notifierRequest.error} />;
  }

  if (optionsRequest.error) {
    return <AwxError error={optionsRequest.error} />;
  }

  if (!notifierRequest.data && mode === 'edit') {
    return <LoadingPage />;
  }

  if (!optionsRequest.data) {
    return <LoadingPage />;
  }

  const defaultValue = mode === 'add' ? {} : notifierRequest.data;

  if (defaultValue && mode === 'edit') {
    arraysToString(defaultValue as NotificationTemplate);
  }

  const defaultValueMessages = defaultValue as NotificationTemplate;
  const messagesEmpty = areMessagesEmpty(defaultValueMessages);

  if (defaultValue && messagesEmpty) {
    (defaultValue as CustomizeMessageType).customize_messages = false;
  }

  if (defaultValue && !messagesEmpty) {
    (defaultValue as CustomizeMessageType).customize_messages = true;
  }

  // fill customize messages

  if (messagesEmpty) defaultValueMessages.messages = getDefaultMessages();

  const onSubmit: PageFormSubmitHandler<NotificationTemplate> = async (formData) => {
    const data: NotificationTemplate | NotificationTemplateEdit =
      mode === 'add'
        ? formData
        : ({
            description: formData.description,
            messages: formData.messages,
            name: formData.name,
            notification_configuration: formData.notification_configuration,
            notification_type: formData.notification_type,
            organization: formData.organization,
            customize_messages: (formData as CustomizeMessageType).customize_messages,
          } as NotificationTemplateEdit);

    stringToArrays(data);

    if ((data as CustomizeMessageType).customize_messages === false) {
      data.messages = null;
    }
    delete (data as CustomizeMessageType).customize_messages;

    let fieldValue;
    // fix notification data types
    const fields =
      optionsRequest.data?.actions.GET.notification_configuration[data.notification_type || ''];
    if (fields) {
      const notification_configuration = data.notification_configuration;
      for (const field in fields) {
        if (!notification_configuration[field]) {
          fieldValue = fields[field];
          notification_configuration[field] = '';
        }

        // convert them
        fieldValue = fields[field];
        if (fieldValue.type === 'int' && typeof notification_configuration[field] === 'string') {
          notification_configuration[field] = Number.parseInt(
            notification_configuration[field] as string,
            10
          );
        }

        if (fieldValue.type === 'bool' && notification_configuration[field] === '') {
          notification_configuration[field] = false;
        }
      }
    }

    if (data.notification_type === 'webhook') {
      if (!data.notification_configuration.headers) {
        data.notification_configuration.headers = {};
      }
    }

    let result: { id?: number } = {};
    if (mode === 'add') {
      result = (await postRequest(awxAPI`/notification_templates/`, data)) as { id: number };
    } else {
      await patchRequest(awxAPI`/notification_templates/${formData.id?.toString() || ''}/`, data);
    }

    const id = mode === 'add' ? result?.id : formData.id;

    pageNavigate(AwxRoute.NotificationTemplateDetails, { params: { id } });
  };

  const job_friendly_name = '{{job_friendly_name}}';
  const url = '{{url}}';
  const status = '{{status}}';

  return (
    <PageLayout>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={mode === 'edit' ? t('Edit notifier') : t('Add notifier')}
      />
      <AwxPageForm<NotificationTemplate>
        submitText={t('Save host')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValue}
      >
        <PageFormSection>
          <PageFormTextInput<NotificationTemplate>
            name="name"
            label={t('Name')}
            placeholder={t('Enter a name')}
            isRequired
            maxLength={150}
          />
          <PageFormTextInput<NotificationTemplate>
            name="description"
            label={t('Description')}
            placeholder={t('Enter a description')}
          />
          <PageFormSelectOrganization<NotificationTemplate> name="organization" isRequired />
          <PageFormSingleSelect
            name="notification_type"
            id="notification_type"
            label={t(`Type`)}
            placeholder={t('Choose a Notification Type')}
            isRequired={true}
            options={[
              { value: 'email', label: t('Email') },
              { value: 'grafana', label: t('Grafana') },
              { value: 'irc', label: t('IRC') },
              { value: 'mattermost', label: t('Mattermost') },
              { value: 'pagerduty', label: t('Pagerduty') },
              { value: 'rocketchat', label: t('Rocket.Chat') },
              { value: 'slack', label: t('Slack') },
              { value: 'twilio', label: t('Twilio') },
              { value: 'webhook', label: t('Webhook') },
            ]}
          />
        </PageFormSection>
        <PageFormSection>
          <PageFormWatch watch="notification_type">
            {(notification_type: string) => (
              <>
                <PageFormGroup label={t('Type Details')}>
                  <InnerForm notification_type={notification_type} />
                </PageFormGroup>
              </>
            )}
          </PageFormWatch>
        </PageFormSection>
        <PageFormSection>
          <PageFormSwitch
            labelHelp={
              <Trans>
                Use custom messages to change the content of notifications sent when a job starts,
                succeeds, or fails. Use curly braces to access information about the job: <br />
                <br />
                {{ job_friendly_name }}, {{ url }}, {{ status }}.<br />
                <br />
                You may apply a number of possible variables in the message. For more information,
                refer to the
                <a href="https://docs.ansible.com/automation-controller/latest/html/userguide/notifications.html#create-custom-notifications">
                  Ansible Controller Documentation.
                </a>
              </Trans>
            }
            name={'customize_messages'}
            label={t('Customize messages...')}
          />
        </PageFormSection>
        <PageFormSection singleColumn>
          <PageFormWatch watch="customize_messages">
            {(customize_messages: boolean) => {
              return (
                <>
                  {
                    <CustomizeMessagesForm
                      customize_messages={customize_messages}
                      data={notifierRequest.data}
                    />
                  }
                </>
              );
            }}
          </PageFormWatch>
        </PageFormSection>
      </AwxPageForm>
    </PageLayout>
  );
}

function CustomizeMessagesForm(props: {
  customize_messages: boolean;
  data: NotificationTemplate | NotificationTemplateEdit | undefined;
}) {
  const { t } = useTranslation();

  const formContext = useFormContext<NotificationTemplate>();

  const { data, customize_messages } = props;
  const setValue = formContext.setValue;
  const defaultMessages = getDefaultMessages();
  if (customize_messages === true) {
    if (!data?.messages?.error?.message) {
      setValue('messages.error.message', defaultMessages.error.message);
    } else {
      setValue('messages.error.message', data.messages.error.message);
    }

    if (!data?.messages?.started?.message) {
      setValue('messages.started.message', defaultMessages.started.message);
    } else {
      setValue('messages.started.message', data.messages.started.message);
    }

    if (!data?.messages?.success?.message) {
      setValue('messages.success.message', defaultMessages.success.message);
    } else {
      setValue('messages.success.message', data.messages.success.message);
    }

    if (!data?.messages?.workflow_approval?.approved?.message) {
      setValue(
        'messages.workflow_approval.approved.message',
        defaultMessages.workflow_approval.approved.message
      );
    } else {
      setValue(
        'messages.workflow_approval.approved.message',
        data.messages.workflow_approval.approved.message
      );
    }

    if (!data?.messages?.workflow_approval?.denied?.message) {
      setValue(
        'messages.workflow_approval.denied.message',
        defaultMessages.workflow_approval.denied.message
      );
    } else {
      setValue(
        'messages.workflow_approval.denied.message',
        data.messages.workflow_approval.denied.message
      );
    }

    if (!data?.messages?.workflow_approval?.running?.message) {
      setValue(
        'messages.workflow_approval.running.message',
        defaultMessages.workflow_approval.running.message
      );
    } else {
      setValue(
        'messages.workflow_approval.running.message',
        data.messages.workflow_approval.running.message
      );
    }

    if (!data?.messages?.workflow_approval?.timed_out?.message) {
      setValue(
        'messages.workflow_approval.timed_out.message',
        defaultMessages.workflow_approval.timed_out.message
      );
    } else {
      setValue(
        'messages.workflow_approval.timed_out.message',
        data.messages.workflow_approval.timed_out.message
      );
    }
  }

  if (customize_messages !== true) {
    return <></>;
  }

  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        name="messages.started.message"
        label={t('Start message')}
      />

      <PageFormTextInput<NotificationTemplate>
        name="messages.success.message"
        label={t('success message')}
      />

      <PageFormTextInput<NotificationTemplate>
        name="messages.error.message"
        label={t('Error message')}
      />

      <PageFormTextInput<NotificationTemplate>
        name="messages.workflow_approval.approved.message"
        label={t('Workflow approved message')}
      />

      <PageFormTextInput<NotificationTemplate>
        name="messages.workflow_approval.denied.message"
        label={t('Workflow denied message')}
      />

      <PageFormTextInput<NotificationTemplate>
        name="messages.workflow_approval.running.message"
        label={t('Workflow pending message')}
      />

      <PageFormTextInput<NotificationTemplate>
        name="messages.workflow_approval.timed_out.message"
        label={t('Workflow timed out message')}
      />
    </>
  );
}

function getDefaultMessages() {
  return {
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

function areMessagesEmpty(data: NotificationTemplate) {
  if (
    data?.messages?.error?.message ||
    data?.messages?.started?.message ||
    data?.messages?.success?.message ||
    data?.messages?.workflow_approval?.approved?.message ||
    data?.messages?.workflow_approval?.denied?.message ||
    data?.messages?.workflow_approval?.running?.message ||
    data?.messages?.workflow_approval?.timed_out?.message
  ) {
    return false;
  }

  return true;
}

function arraysToString(data: NotificationTemplate) {
  if (!data.notification_configuration) {
    return;
  }

  for (const key in data.notification_configuration) {
    if (!isList(key, data.notification_type || '')) {
      continue;
    }

    // transform array of strings into string
    const arr = data?.notification_configuration[key] as string[];
    if (arr && arr.join) {
      data.notification_configuration[key] = arr.join('\n');
    }
  }
}

function stringToArrays(data: NotificationTemplate | NotificationTemplateEdit) {
  if (!data.notification_configuration) {
    return;
  }

  for (const key in data.notification_configuration) {
    if (!isList(key, data.notification_type || '')) {
      continue;
    }

    // transform array of strings into string
    const str = data?.notification_configuration[key] as string;
    if (str && str.split) {
      data.notification_configuration[key] = str.split('\n');
    }
  }
}

function isList(key: string, notification_type: string) {
  if (key === 'recipients' && notification_type === 'email') {
    return true;
  }

  if (key === 'channels' && notification_type === 'slack') {
    return true;
  }

  if (key === 'to_numbers' && notification_type === 'twilio') {
    return true;
  }

  if (key === 'annotation_tags' && notification_type === 'grafana') {
    return true;
  }

  if (key === 'targets' && notification_type === 'irc') {
    return true;
  }

  return false;
}
