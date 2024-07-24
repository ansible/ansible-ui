/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { PageFormTextInput } from '../../../framework/PageForm/Inputs/PageFormTextInput';
import { AwxPageForm } from '../../../frontend/awx/common/AwxPageForm';
import { Application } from '../../../frontend/awx/interfaces/Application';
import { requestGet, swrOptions, requestPatch } from '../../../frontend/common/crud/Data';
import { usePostRequest } from '../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../api/gateway-api-utils';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { PageFormPlatformOrganizationSelect } from '../organizations/components/PageFormPlatformOrganizationSelect';

const ClientType = {
  Confidential: 'confidential',
  Public: 'public',
};

const AuthorizationType = {
  AuthorizationCode: 'authorization-code',
  Password: 'password',
};

export function CreatePlatformApplication(props: {
  onSuccessfulCreate: (app: Application) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<Application>();
  const onSubmit: PageFormSubmitHandler<Application> = async (application: Application) => {
    const newApplication = await postRequest(gatewayV1API`/applications/`, application);
    if (props.onSuccessfulCreate) props.onSuccessfulCreate(newApplication);
    pageNavigate(PlatformRoute.ApplicationDetails, { params: { id: newApplication.id } });
  };

  const onCancel = () => navigate(-1);
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
      <AwxPageForm
        submitText={t('Create application')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <ApplicationInputs mode="create" />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditPlatformApplication() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: application } = useSWR<Application>(
    gatewayV1API`/applications/${id.toString()}/`,
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
      gatewayV1API`/applications/${id.toString()}/`,
      application
    );
    pageNavigate(PlatformRoute.ApplicationDetails, { params: { id: editedApplication.id } });
  };

  const getPageUrl = useGetPageUrl();

  const onCancel = () => navigate(-1);

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
        submitText={t('Save application')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={application}
      >
        <ApplicationInputs mode="edit" />
      </AwxPageForm>
    </PageLayout>
  );
}

function ApplicationInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();
  const authorizationGrantType = useWatch<Application>({
    name: 'authorization_grant_type',
  });
  return (
    <>
      <PageFormTextInput<Application>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<Application>
        name="description"
        label={t('Description')}
        placeholder={t('Enter a description')}
      />
      <PageFormPlatformOrganizationSelect<Application> name="organization" isRequired />
      <PageFormSelect<Application>
        isReadOnly={mode === 'edit'}
        name="authorization_grant_type"
        label={t('Authorization grant type')}
        placeholderText={t('Select a grant type')}
        options={[
          {
            label: t('Authorization code'),
            value: AuthorizationType.AuthorizationCode,
          },
          {
            label: t('Password'),
            value: AuthorizationType.Password,
          },
        ]}
        isRequired
      />
      <PageFormSelect<Application>
        name="client_type"
        label={t('Client type')}
        placeholderText={t('Select a client type')}
        options={[
          {
            label: t('Confidential'),
            value: ClientType.Confidential,
          },
          {
            label: t('Public'),
            value: ClientType.Public,
          },
        ]}
        isRequired
      />
      <PageFormTextInput<Application>
        name="redirect_uris"
        label={t('Redirect URIs')}
        placeholder={t('Enter a redriect URI')}
        isRequired={Boolean(authorizationGrantType === 'authorization-code')}
      />
    </>
  );
}