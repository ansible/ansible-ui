/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  CopyCell,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { validateUrl } from '@ansible/awx-ui/administration/notifiers/NotifierFormInner';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxPageForm } from '@ansible/awx-ui/common/AwxPageForm';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { requestGet, requestPatch } from '@ansible/common-ui/crud/Data';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { Alert, Content } from '@patternfly/react-core';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PageFormPlatformOrganizationSelect } from '../../organizations/components/PageFormPlatformOrganizationSelect';

export function EditLegacyApplication() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { clearCacheByKey } = useClearCache();
  const params = useParams<{ applicationId?: string }>();
  const id = Number(params.applicationId);
  const { data: application } = useSWR<Application>(
    awxAPI`/applications/${id.toString()}/`,
    requestGet
  );

  const onSubmit: PageFormSubmitHandler<Application> = async (
    application: Application,
    setError,
    setFieldError
  ) => {
    if (
      application.authorization_grant_type === 'authorization-code' &&
      (application.redirect_uris === undefined || application.redirect_uris === '')
    ) {
      setFieldError('redirect_uris', {
        message: t('Need to pass a redirect URI if grant type is authorization code'),
      });
      return false;
    }
    const editedApplication = await requestPatch<Application>(
      awxAPI`/applications/${id.toString()}/`,
      application
    );
    clearCacheByKey(awxAPI`/app_urls/`);
    pageNavigate(PlatformRoute.LegacyApplicationDetails, {
      params: { applicationId: editedApplication.id },
    });
  };

  const getPageUrl = useGetPageUrl();

  const onCancel = () => void navigate(-1);

  if (!application) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Legacy Applications'), to: getPageUrl(PlatformRoute.LegacyApplications) },
            { label: t('Edit legacy application') },
          ]}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={
          application?.name
            ? t('Edit {{applicationName}}', { applicationName: application?.name })
            : t('Legacy Application')
        }
        breadcrumbs={[
          { label: t('Legacy Applications'), to: getPageUrl(PlatformRoute.LegacyApplications) },
          {
            label: application?.name
              ? t('Edit {{applicationName}}', { applicationName: application?.name })
              : t('Legacy Application'),
          },
        ]}
      />
      <AwxPageForm<Application>
        submitText={t('Save legacy application')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={application}
      >
        <LegacyApplicationInputs mode="edit" />
      </AwxPageForm>
    </PageLayout>
  );
}

function LegacyApplicationInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();
  const authorizationGrantType = useWatch<Application>({
    name: 'authorization_grant_type',
  });
  const { data: gatewaySettings } = useSWR<{ gateway_proxy_url: string }>(
    awxAPI`/settings/all/`,
    requestGet
  );
  return (
    <>
      <PageFormSection singleColumn>
        <Alert variant="info" isInline title={t('Configure Legacy Application')} isExpandable>
          <Content>
            <p>
              {t(
                'You are setting up a legacy application to allow secure authentication and integration with an external service. This will allow the external service to authenticate users using AAP authentication and obtain an access token to access AAP resources on behalf of the user.'
              )}
            </p>
            <p>
              {t(
                'In this form, you will provide the necessary details required for Legacy, including grant type, client type, and credentials. These fields are typically provided by the external service when registering an application on their platform.'
              )}
            </p>
            <p>{t('To complete this setup:')}</p>
            <ol>
              <li>
                <p>
                  {t(
                    'Register the application on the external service and obtain the required information, such as the Client ID and Client Secret.'
                  )}
                </p>
                <p>{t('The external service will need:')}</p>
                <ul>
                  <li>
                    {t('Auth URL')}
                    <CopyCell
                      text={t('{{server}}/o/authorize/', {
                        server: gatewaySettings?.gateway_proxy_url ?? 'https://your-aap',
                      })}
                    />
                  </li>
                  <li>
                    {t('Token URL')}
                    <CopyCell
                      text={t('{{server}}/o/token/', {
                        server: gatewaySettings?.gateway_proxy_url ?? 'https://your-aap',
                      })}
                    />
                  </li>
                </ul>
              </li>
              <li>
                {t(
                  'Configure the redirect URIs that will handle responses after successful authentication. Redirect URIs are endpoints in your application that will handle the authorization server’s response after the user logs in. You must register these URIs with the external service.'
                )}
              </li>
              <li>
                {t(
                  'Select the appropriate authorization grant type and client type based on your application’s security needs and interaction with the external service.'
                )}
              </li>
            </ol>
            <p>
              {t(
                'Make sure to input all the required details accurately to ensure a smooth Legacy authentication process.'
              )}
            </p>
          </Content>
        </Alert>
      </PageFormSection>
      <PageFormTextInput<Application>
        name="name"
        label={t('Name')}
        placeholder={t('Enter legacy application name')}
        isRequired
        maxLength={150}
      />
      <PageFormPlatformOrganizationSelect<Application> name="organization" isRequired />
      <PageFormTextArea<Application>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormSelect<Application>
        isReadOnly={mode === 'edit'}
        name="authorization_grant_type"
        label={t('Authorization grant type')}
        placeholderText={t('Select authorization grant type')}
        options={[
          {
            label: t('Authorization code'),
            value: 'authorization-code',
            description: t(
              'Use this for server-side applications that can securely store a client secret. This grant type is more secure because it requires user authorization and an authorization code exchange.'
            ),
          },
          {
            label: t('Password'),
            value: 'password',
            description: t(
              'Use this for trusted first-party clients only. The user provides their username and password directly to the client, which exchanges them for an access token.'
            ),
          },
        ]}
        isRequired
        defaultValue={'authorization-code'}
        labelHelp={t(
          'Defines the method by which the client application will obtain the access token. The grant type determines the security level and the interaction between the client, user, and authorization server.'
        )}
      />
      <PageFormSelect<Application>
        name="client_type"
        label={t('Client type')}
        placeholderText={t('Select client type')}
        options={[
          {
            label: t('Confidential'),
            value: 'confidential',
            description:
              'Select this if the client can securely store a client secret (e.g., server-side applications).',
          },
          {
            label: t('Public'),
            value: 'public',
            description:
              'Select this if the client cannot securely store a client secret (e.g., single-page applications, mobile apps).',
          },
        ]}
        isRequired
        defaultValue={'confidential'}
        labelHelp={t(
          'Defines the security level of the client application based on whether it can securely store sensitive information like a client secret.'
        )}
      />
      <PageFormTextInput<Application>
        name="redirect_uris"
        label={t('Redirect URIs')}
        placeholder={t('Enter redirect URIs')}
        isRequired={Boolean(authorizationGrantType === 'authorization-code')}
        labelHelp={t(
          'Provide one or more URIs where the authorization server will send the user after successful authentication. These URIs must be registered with the authorization server.'
        )}
        validate={(value) => validateUrl(value, t)}
        fullWidth
      />
    </>
  );
}
