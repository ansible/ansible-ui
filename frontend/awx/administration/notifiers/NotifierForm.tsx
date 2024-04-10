/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button } from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageFormDataEditor,
  PageFormSubmitHandler,
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

export function EditNotifier() {
  return <NotifierForm mode={'edit'} />;
}

export function AddNotifier() {
  return <NotifierForm mode={'add'} />;
}

function NotifierForm(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { mode } = props;
  const params = useParams<{ id: string }>();
  let getUrl = mode === 'add' ? '' : awxAPI`/notification_templates/${params.id || ''}/`;
  const notifierRequest = useGet<NotificationTemplate>(getUrl);
  const navigate = useNavigate();

  const breadcrumbs: ICatalogBreadcrumb[] = [
    { label: t('Notifications'), to: getPageUrl(AwxRoute.NotificationTemplates) },
    { label: mode === 'add' ? t('Add') : t('Edit') },
  ];

  if (notifierRequest.error) {
    return <AwxError error={notifierRequest.error} />;
  }

  if (!notifierRequest.data && mode === 'edit') {
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
        <PageFormWatch watch="notification_type">{() => <TypeForm mode={mode} />}</PageFormWatch>
      </AwxPageForm>
    </PageLayout>
  );
}

function TypeForm(props: { mode: 'add' | 'edit' }) {
  const context = useFormContext<NotificationTemplate>();
  const notification_type = context.getValues().notification_type;

  const { mode } = props;
  switch (notification_type) {
    case 'email':
      return <EmailForm mode={mode} />;
    case 'grafana':
      return <GrafanaForm mode={mode} />;
    case 'irc':
      return <IRCForm mode={mode} />;
    case 'mattermost':
      return <MattermostForm mode={mode} />;
    case 'pagerduty':
      return <PagerdutyForm mode={mode} />;
    case 'rocketchat':
      return <RocketChatForm mode={mode} />;
    case 'slack':
      return <SlackForm mode={mode} />;
    case 'twilio':
      return <TwilioForm mode={mode} />;
    case 'webhook':
      return <WebhookForm mode={mode} />;
    default:
      return <></>;
  }
}

function EmailForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}

function GrafanaForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}

function IRCForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}

function MattermostForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}

function PagerdutyForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}

function RocketChatForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}

function SlackForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}

function TwilioForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}

function WebhookForm(props: { mode: 'add' | 'edit' }) {
  return <></>;
}
