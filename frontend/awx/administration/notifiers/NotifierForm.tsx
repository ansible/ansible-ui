/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextArea,
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
import { requestCommon } from '../../../common/crud/requestCommon';
import { usePageNavigate } from '../../../../framework';

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

function NotifierForm(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { mode } = props;
  const params = useParams<{ id: string }>();
  let getUrl = mode === 'add' ? '' : awxAPI`/notification_templates/${params.id || ''}/`;
  const notifierRequest = useGet<NotificationTemplate>(getUrl);
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

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

  const onSubmit: PageFormSubmitHandler<NotificationTemplate> = async (formData) => {
    const data: NotificationTemplate =
      mode === 'add'
        ? formData
        : {
            description: formData.description,
            messages: formData.messages,
            name: formData.name,
            notification_configuration: formData.notification_configuration,
            notification_type: formData.notification_type,
            organization: formData.organization,
          };

    stringToArrays(data);

    // delete unused parameters
    if (mode === 'edit') {
      delete data.created;
      delete data.id;
      delete data.related;
      delete data.summary_fields;
      delete data.modified;
      delete data.type;
      delete data.url;
    }

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
            notification_configuration[field] as string
          );
        }

        if (fieldValue.type === 'bool' && notification_configuration[field] === '') {
          notification_configuration[field] = false;
        }
      }
    }

    await requestCommon({
      url:
        mode === 'add'
          ? awxAPI`/notification_templates/`
          : awxAPI`/notification_templates/${formData.id?.toString() || ''}/`,
      method: mode === 'edit' ? 'PATCH' : 'POST',
      body: data,
    });

    pageNavigate(AwxRoute.NotificationTemplates);
  };

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
      </AwxPageForm>
    </PageLayout>
  );
}

function InnerForm(props: { notification_type: string }) {
  const notification_type = props.notification_type;
  if (notification_type === 'email') {
    return <EmailForm />;
  }

  if (notification_type === 'slack') {
    return <SlackForm />;
  }

  if (notification_type === 'twilio') {
    return <TwilioForm />;
  }

  if (notification_type === 'pagerduty') {
    return <PagerdutyForm />;
  }

  if (notification_type === 'grafana') {
    return <GrafanaForm />;
  }

  if (notification_type === 'webhook') {
    return <WebhookForm />;
  }

  if (notification_type === 'mattermost') {
    return <MattermostForm />;
  }

  if (notification_type === 'rocketchat') {
    return <RocketchatForm />;
  }

  if (notification_type === 'irc') {
    return <IrcForm />;
  }

  return <></>;
}

function EmailForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.username'}
        label={t('Username')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'notification_configuration.password'}
        label={t('Password')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.host'}
        label={t('Host')}
        isRequired
      />

      <PageFormTextArea<NotificationTemplate>
        name={'notification_configuration.recipients'}
        label={t('Recipient List')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.sender'}
        label={t('Sender Email')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'number'}
        name={'notification_configuration.port'}
        label={t('Port')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'number'}
        name={'notification_configuration.timeout'}
        label={t('Timeout')}
        isRequired
      />

      <PageFormGroup label={t('Email Options ')}>
        <PageFormCheckbox<NotificationTemplate>
          name={'notification_configuration.use_tls'}
          label={t('Use TLS')}
        />

        <PageFormCheckbox<NotificationTemplate>
          name={'notification_configuration.use_ssl'}
          label={t('Use SSL')}
        />
      </PageFormGroup>
    </>
  );
}

function SlackForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        name={'type_data.token'}
        label={t('Token')}
        placeholder={''}
      />

      <PageFormTextArea<NotificationTemplate>
        name={'type_data.channels'}
        label={t('Destination Channels')}
        placeholder={''}
      />
    </>
  );
}

function TwilioForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.account_sid'}
        label={t('Account SID')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        name={'type_data.account_token'}
        label={t('Account Token')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.from_number'}
        label={t('Source Phone Number')}
        placeholder={''}
      />

      <PageFormTextArea<NotificationTemplate>
        name={'type_data.to_numbers'}
        label={t('Destination SMS Numbers')}
        placeholder={''}
      />
    </>
  );
}

function PagerdutyForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.subdomain'}
        label={t('Pagerduty subdomain')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        name={'type_data.token'}
        label={t('API Token')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.service_key'}
        label={t('API Service/Integration Key')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.client_name'}
        label={t('Client Identifier')}
        placeholder={''}
      />
    </>
  );
}

function GrafanaForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.grafana_url'}
        label={t('Grafana URL')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        name={'type_data.grafana_key'}
        label={t('Grafana API Key')}
        placeholder={''}
      />
    </>
  );
}

function WebhookForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.url'}
        label={t('Target URL')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.http_method'}
        label={t('HTTP Method')}
        placeholder={''}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'type_data.disable_ssl_verification'}
        label={t('Verify SSL')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.username'}
        label={t('Username')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'type_data.password'}
        label={t('Password')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        name={'type_data.headers'}
        label={t('HTTP Headers')}
        placeholder={''}
      />
    </>
  );
}

function MattermostForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.mattermost_url'}
        label={t('Target URL')}
        placeholder={''}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'type_data.mattermost_no_verify_ssl'}
        label={t('Verify SSL')}
        placeholder={''}
      />
    </>
  );
}

function RocketchatForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.rocketchat_url'}
        label={t('Target URL')}
        placeholder={''}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'type_data.rocketchat_no_verify_ssl'}
        label={t('Verify SSL')}
        placeholder={''}
      />
    </>
  );
}

function IrcForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.server'}
        label={t('IRC Server Address')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        name={'type_data.port'}
        label={t('IRC Server Port')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.nickname'}
        label={t('IRC Nick')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'type_data.password'}
        label={t('IRC Server Password')}
        placeholder={''}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'type_data.use_ssl'}
        label={t('SSL Connection')}
        placeholder={''}
      />

      <PageFormTextArea<NotificationTemplate>
        name={'type_data.targets'}
        label={t('Destination Channels or Users')}
        placeholder={''}
      />
    </>
  );
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

function stringToArrays(data: NotificationTemplate) {
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

  return false;
}
