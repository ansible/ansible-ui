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
import { TFunction } from 'i18next';


export function EditNotifier() {
  return <NotifierForm mode={'edit'} />;
}

export function AddNotifier() {
  return <NotifierForm mode={'add'} />;
}

type NotificationTemplateOptions = {
  actions : {
    GET : {
      notification_configuration: 
        Record<string, Record<string, { label : string, type : string, default : unknown }>>
    }
  }
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

  if (!optionsRequest.data)
  {
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
        <PageFormWatch watch="notification_type">{(notification_type : string) => 
          <>
            {notification_type && optionsRequest.data && 
              <PageFormSection singleColumn={true}>
                <PageFormGroup
                  label={t('Type Details')}
                >
                  {genericForm(t, mode, notification_type, optionsRequest.data)}
                </PageFormGroup>
              </PageFormSection>
            }
          </>
        }</PageFormWatch>
      </AwxPageForm>
    </PageLayout>
  );
}


function isRequired(mode : 'add' | 'edit', notification_type : string, label : string) : boolean
{

  return false;
}

function textType(type : string)
{
  if (type === 'password')
  {
    return 'password';
  }

  if (type === 'int')
  {
    return 'number';
  }

  return 'text';
}


function genericForm(t : TFunction<"translation", undefined>, mode: 'add' | 'edit', notification_type : string, optionsData :  NotificationTemplateOptions)
{
  try
  {
  const options = optionsData.actions.GET.notification_configuration[notification_type];
  if (!options)
  {
    return <></>;
  }

  return <>
    {Object.keys(options).map( (key) => {
      return componentFromOptions(t, mode, notification_type, key, optionsData);
    })}
  </>;
  }catch(error)
  {
    debugger;
    return <>{error}</>;
  }
}

function componentFromOptions(t : TFunction<"translation", undefined>, mode: 'add' | 'edit', notification_type : string, field : string, optionsData :  NotificationTemplateOptions)
{
  try
  {
    const options = optionsData.actions.GET.notification_configuration[notification_type];
    if (!options)
    {
      return <></>;
    }

    const option = options[field];

    if (!option)
    {
      return <></>;
    }

    const name = 'type_data.' + field;
        
    const label = t(option.label);
        
        if (option.type === 'string' || option.type === 'number' || option.type === 'password')
        {
          return (
            <>
            <PageFormTextInput<NotificationTemplate>
              type={textType(option.type)}
              name={name}
              label={label}
              placeholder={''}
              isRequired={isRequired(mode, notification_type, option.label)}
            /> 
            </>
          );
        }

        if (option.type === 'list')
        {
          return (
            <>
            <PageFormTextArea<NotificationTemplate>
              type={textType(option.type)}
              name={name}
              label={label}
              placeholder={''}
              isRequired={isRequired(mode, notification_type, option.label)}
            /> 
            </>
          );
        }

        if (option.type === 'bool')
        {
          return (
            <>
            <PageFormCheckbox<NotificationTemplate>
              type={textType(option.type)}
              name={name}
              label={label}
              placeholder={''}
              isRequired={isRequired(mode, notification_type, option.label)}
            /> 
            </>
          );
        }
        return <></>;
    }catch(error)
    {
      debugger;
      return <>{t('Error loading component')}</>;
    }
}


// list of form elements names for translations:
// this hook is here only for translator static string crawler, so he can find those
function useStaticTranslations()
{
  const {t} = useTranslation();
t('Notification configuration');
t('Host');
t('Port');
t('Username');
t('Password');
t('Use TLS');
t('Use SSL');
t('Sender Email');
t('Recipient List');
t('Timeout');
t('Token');
t('Destination Channels');
t('Account SID');
t('Account Token');
t('Source Phone Number');
t('Destination SMS Numbers');
t('Pagerduty subdomain');
t('API Token');
t('API Service/Integration Key');
t('Client Identifier');
t('Grafana URL');
t('Grafana API Key');
t('Target URL');
t('HTTP Method');
t('Verify SSL');
t('Username', {'context': 'within webhook and mattermost'});
t('Password', {'context': 'within webhook'});
t('HTTP Headers');
t('Target URL', {'context': 'within mattermost and rocketchat'});
t('Verify SSL', {'context': 'within mattermost and rocketchat'});
t('IRC Server Address');
t('IRC Server Port');
t('IRC Nick');
t('IRC Server Password');
t('SSL Connection');
t('Destination Channels or Users');
}

