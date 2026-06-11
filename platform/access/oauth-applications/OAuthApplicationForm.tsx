/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  CopyCell,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormSwitch,
  PageFormTextArea,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageDialogs,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { validateUrl } from '@ansible/awx-ui/administration/notifiers/NotifierFormInner';
import { AwxPageForm } from '@ansible/awx-ui/common/AwxPageForm';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { requestGet, requestPatch, swrOptions } from '@ansible/common-ui/crud/Data';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { Alert, Content } from '@patternfly/react-core';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { PageFormPlatformOrganizationSelect } from '../organizations/components/PageFormPlatformOrganizationSelect';
import { OAuthApplicationSecretModal } from './OAuthApplicationSecretModal';

interface FieldChoice {
  value: string;
  display_name: string;
}

interface ApplicationFieldMeta {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text?: string;
  choices?: FieldChoice[];
}

interface ApplicationOptionsResponse {
  actions?: {
    POST?: Record<string, ApplicationFieldMeta>;
  };
}

export function CreateOAuthApplication() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<Application>();
  const { clearCacheByKey } = useClearCache();
  const { pushDialog, popDialog } = usePageDialogs();

  const onSubmit: PageFormSubmitHandler<Application> = async (application: Application) => {
    const newApplication = await postRequest(gatewayAPI`/applications/`, application);
    clearCacheByKey(gatewayAPI`/app_urls/`);
    pushDialog(
      <OAuthApplicationSecretModal
        onClose={() => {
          popDialog();
          pageNavigate(PlatformRoute.ApplicationDetails, {
            params: { applicationId: newApplication.id },
          });
        }}
        applicationModalSource={newApplication}
      />
    );
  };

  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create OAuth application')}
        breadcrumbs={[
          { label: t('OAuth Applications'), to: getPageUrl(PlatformRoute.Applications) },
          { label: t('Create OAuth application') },
        ]}
      />
      <AwxPageForm<Application>
        submitText={t('Create OAuth application')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          authorization_grant_type: 'authorization-code',
          client_type: 'confidential',
          algorithm: '',
          skip_authorization: false,
        }}
      >
        <OAuthApplicationInputs mode="create" />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditOAuthApplication() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { clearCacheByKey } = useClearCache();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: application } = useSWR<Application>(
    gatewayAPI`/applications/${id.toString()}/`,
    requestGet,
    swrOptions
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
      gatewayAPI`/applications/${id.toString()}/`,
      application
    );
    clearCacheByKey(gatewayAPI`/app_urls/`);
    pageNavigate(PlatformRoute.ApplicationDetails, {
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
            { label: t('Applications'), to: getPageUrl(PlatformRoute.Applications) },
            { label: t('Edit application') },
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
            : t('OAuth Application')
        }
        breadcrumbs={[
          { label: t('OAuth Applications'), to: getPageUrl(PlatformRoute.Applications) },
          {
            label: application?.name
              ? t('Edit {{applicationName}}', { applicationName: application?.name })
              : t('OAuth Application'),
          },
        ]}
      />
      <AwxPageForm<Application>
        submitText={t('Save OAuth application')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={application}
      >
        <OAuthApplicationInputs mode="edit" />
      </AwxPageForm>
    </PageLayout>
  );
}

function choicesToOptions(choices?: FieldChoice[]) {
  return (choices ?? []).map((choice) => ({
    label: choice.display_name,
    value: choice.value,
  }));
}

function OAuthApplicationInputs(props: Readonly<{ mode: 'create' | 'edit' }>) {
  const { mode } = props;
  const { t } = useTranslation();
  const authorizationGrantType = useWatch<Application>({
    name: 'authorization_grant_type',
  });
  const { data: gatewaySettings } = useSWR<{ gateway_proxy_url: string }>(
    gatewayAPI`/settings/all/`,
    requestGet,
    swrOptions
  );
  const { data: options } = useOptions<ApplicationOptionsResponse>(gatewayAPI`/applications/`);
  const fields = options?.actions?.POST;

  return (
    <>
      <PageFormSection singleColumn>
        <Alert variant="info" isInline title={t('Configure OAuth Application')} isExpandable>
          <Content>
            <p>
              {t(
                'You are setting up an OAuth application to allow secure authentication and integration with an external service. This will allow the external service to authenticate users using AAP authentication and obtain an access token to access AAP resources on behalf of the user.'
              )}
            </p>
            <p>
              {t(
                'In this form, you will provide the necessary details required for OAuth, including grant type, client type, and credentials. These fields are typically provided by the external service when registering an application on their platform.'
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
                  "Configure the redirect URIs that will handle responses after successful authentication. Redirect URIs are endpoints in your application that will handle the authorization server's response after the user logs in. You must register these URIs with the external service."
                )}
              </li>
              <li>
                {t(
                  "Select the appropriate authorization grant type and client type based on your application's security needs and interaction with the external service."
                )}
              </li>
            </ol>
            <p>
              {t(
                'Make sure to input all the required details accurately to ensure a smooth OAuth authentication process.'
              )}
            </p>
          </Content>
        </Alert>
      </PageFormSection>
      <PageFormTextInput<Application>
        name="name"
        label={t('Name')}
        placeholder={t('Enter OAuth application name')}
        isRequired
        maxLength={150}
      />
      <PageFormPlatformOrganizationSelect<Application> name="organization" isRequired />
      <PageFormTextInput<Application>
        name="app_url"
        label={t('URL')}
        labelHelp={fields?.app_url?.help_text ?? t('The URL of this application.')}
        placeholder={t('Enter OAuth application URL')}
        validate={(value) => validateUrl(value, t)}
        fullWidth
      />
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
        options={choicesToOptions(fields?.authorization_grant_type?.choices)}
        isRequired
        defaultValue={'authorization-code'}
        labelHelp={fields?.authorization_grant_type?.help_text}
      />
      <PageFormSelect<Application>
        name="client_type"
        label={t('Client type')}
        placeholderText={t('Select client type')}
        options={choicesToOptions(fields?.client_type?.choices)}
        isRequired
        defaultValue={'confidential'}
        labelHelp={fields?.client_type?.help_text}
      />
      <PageFormSelect<Application>
        name="algorithm"
        label={t('Algorithm')}
        placeholderText={t('Select algorithm')}
        options={choicesToOptions(fields?.algorithm?.choices)}
        defaultValue={''}
        labelHelp={
          fields?.algorithm?.help_text ??
          t(
            'The algorithm used to sign OpenID Connect ID tokens. Select "No OIDC support" if this application does not use OpenID Connect.'
          )
        }
      />
      <PageFormSwitch<Application>
        name="skip_authorization"
        label={t('Skip Authorization')}
        labelHelp={fields?.skip_authorization?.help_text}
      />
      <PageFormTextInput<Application>
        name="redirect_uris"
        label={t('Redirect URIs')}
        placeholder={t('Enter redirect URIs')}
        isRequired={Boolean(authorizationGrantType === 'authorization-code')}
        labelHelp={fields?.redirect_uris?.help_text}
        validate={(value) => validateUrl(value, t)}
        fullWidth
      />
      <PageFormTextInput<Application>
        name="post_logout_redirect_uris"
        label={t('Post Logout Redirect URIs')}
        placeholder={t('Enter post logout redirect URIs')}
        labelHelp={fields?.post_logout_redirect_uris?.help_text}
        validate={(value) => validateUrl(value, t)}
        fullWidth
      />
    </>
  );
}
