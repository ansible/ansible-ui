/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button } from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
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
import { genericForm } from './NotifierFormGenerator';

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

  return (
    <PageLayout>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={mode === 'edit' ? t('Edit notifier') : t('Add notifier')}
      />
      <AwxPageForm<NotificationTemplate>
        submitText={t('Save host')}
        onSubmit={() => {}}
        cancelText={t('Cancel')}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValue}
      >
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
        <PageFormWatch watch="notification_type">
          {(notification_type: string) => (
            <>
              {optionsRequest.data && (
                <PageFormSection singleColumn={true}>
                  <PageFormGroup label={t('Type Details')}>
                    <InnerForm
                      notification_type={notification_type}
                    />

                    {genericForm(optionsRequest.data)}
                  </PageFormGroup>
                </PageFormSection>
              )}
            </>
          )}
        </PageFormWatch>
      </AwxPageForm>
    </PageLayout>
  );
}

function InnerForm(props : {notification_type: string}) {
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
  const {t} = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.host'}
        label={t('Host')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'number'}
        name={'type_data.port'}
        label={t('Port')}
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

      <PageFormCheckbox<NotificationTemplate>
        name={'type_data.use_tls'}
        label={t('Use TLS')}
        placeholder={''}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'type_data.use_ssl'}
        label={t('Use SSL')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'type_data.sender'}
        label={t('Sender Email')}
        placeholder={''}
      />

      <PageFormTextArea<NotificationTemplate>
        name={'type_data.recipients'}
        label={t('Recipient List')}
        placeholder={''}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'number'}
        name={'type_data.timeout'}
        label={t('Timeout')}
        placeholder={''}
      />
    </>
  );
}

function SlackForm() {
  const {t} = useTranslation();
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
  const {t} = useTranslation();
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
  const {t} = useTranslation();
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
  const {t} = useTranslation();
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
  const {t} = useTranslation();
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
  const {t} = useTranslation();
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
  const {t} = useTranslation();
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
  const {t} = useTranslation();
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
