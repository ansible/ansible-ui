/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageFormSubmitHandler,
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
import { usePutRequest } from '../../../common/crud/usePutRequest';
import { usePageNavigate } from '../../../../framework';

import { InnerForm } from './NotifierFormInner';

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

type NotificationTemplatEdit = Omit<NotificationTemplate, 'id'>;

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

  const putRequest = usePutRequest();
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

  const onSubmit: PageFormSubmitHandler<NotificationTemplate> = async (formData) => {
    const data: NotificationTemplate | NotificationTemplatEdit =
      mode === 'add'
        ? formData
        : ({
            description: formData.description,
            messages: formData.messages,
            name: formData.name,
            notification_configuration: formData.notification_configuration,
            notification_type: formData.notification_type,
            organization: formData.organization,
          } as NotificationTemplatEdit);

    stringToArrays(data);

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

    if (mode === 'add') {
      await postRequest(awxAPI`/notification_templates/`, data);
    } else {
      await putRequest(awxAPI`/notification_templates/${formData.id?.toString() || ''}/`, data);
    }

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

function stringToArrays(data: NotificationTemplate | NotificationTemplatEdit) {
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

  return false;
}
