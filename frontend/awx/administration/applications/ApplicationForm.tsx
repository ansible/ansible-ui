/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../AwxPageForm';
import { AwxRoute } from '../../AwxRoutes';
import { awxAPI } from '../../api/awx-utils';
import { Application } from '../../interfaces/Application';
import { PageFormOrganizationSelect } from '../../access/organizations/components/PageFormOrganizationSelect';
import { Organization } from '../../interfaces/Organization';
import { getOrganizationByName } from '../../access/organizations/utils/getOrganizationByName';

const ClientType = {
  Confidential: 'confidential',
  Public: 'public',
};

const AuthorizationType = {
  AuthorizationCode: 'authorization-code',
  Password: 'password',
};

interface IApplicationInput {
  organization: string;
  authorization_grant_type: string;
  client_type: string;
  name: string;
  redirect_uris?: string;
  description?: string;
}

export function CreateApplication() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<Application>();
  const onSubmit: PageFormSubmitHandler<IApplicationInput> = async (
    applicationInput: IApplicationInput,
    setError,
    setFieldError
  ) => {
    if (
      applicationInput.authorization_grant_type === 'authorization-code' &&
      (applicationInput.redirect_uris === undefined || applicationInput.redirect_uris === '')
    ) {
      setFieldError('redirect_uris', {
        message: t('Need to pass a redirect URI if grant type is authorization code'),
      });
      return false;
    }
    let organization: Organization | undefined;
    let modifiedInput;
    try {
      organization = await getOrganizationByName(applicationInput.organization);
      if (!organization) throw new Error(t('Organization not found.'));
      modifiedInput = { ...applicationInput, organization: organization.id };
    } catch {
      throw new Error(t('Organization not found.'));
    }
    const newApplication = await postRequest(awxAPI`/applications/`, modifiedInput as Application);
    pageNavigate(AwxRoute.ApplicationDetails, { params: { id: newApplication.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <>
      <PageHeader
        title={t('Create Application')}
        breadcrumbs={[
          { label: t('Applications'), to: getPageUrl(AwxRoute.Applications) },
          { label: t('Create Application') },
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
    </>
  );
}

export function EditApplication() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: application } = useSWR<Application>(
    awxAPI`/applications/${id.toString()}/`,
    requestGet,
    swrOptions
  );

  const onSubmit: PageFormSubmitHandler<IApplicationInput> = async (
    applicationInput: IApplicationInput,
    setError,
    setFieldError
  ) => {
    if (
      applicationInput.authorization_grant_type === 'authorization-code' &&
      (applicationInput.redirect_uris === undefined || applicationInput.redirect_uris === '')
    ) {
      setFieldError('redirect_uris', {
        message: t('Need to pass a redirect URI if grant type is authorization code'),
      });
      return false;
    }
    let organization: Organization | undefined;
    let modifiedInput;
    try {
      organization = await getOrganizationByName(applicationInput.organization);
      if (!organization) throw new Error(t('Organization not found.'));
      modifiedInput = { ...applicationInput, organization: organization.id };
    } catch {
      throw new Error(t('Organization not found.'));
    }
    const editedApplication = await requestPatch<Application>(
      awxAPI`/applications/${id.toString()}/`,
      modifiedInput
    );
    pageNavigate(AwxRoute.ApplicationDetails, { params: { id: editedApplication.id } });
  };

  const getPageUrl = useGetPageUrl();

  const onCancel = () => navigate(-1);

  if (!application) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Applications'), to: getPageUrl(AwxRoute.Applications) },
            { label: t('Edit Application') },
          ]}
        />
      </PageLayout>
    );
  }

  const defaultValue: Partial<IApplicationInput> = {
    organization: application.summary_fields.organization.name,
    authorization_grant_type: application.authorization_grant_type,
    client_type: application.client_type,
    name: application.name,
    redirect_uris: application.redirect_uris,
    description: application.description,
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Application')}
        breadcrumbs={[
          { label: t('Applications'), to: getPageUrl(AwxRoute.Applications) },
          { label: t('Edit Application') },
        ]}
      />
      <AwxPageForm<IApplicationInput>
        submitText={t('Save application')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
      >
        <ApplicationInputs mode="edit" />
      </AwxPageForm>
    </PageLayout>
  );
}

function ApplicationInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<IApplicationInput>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<IApplicationInput>
        name="description"
        label={t('Description')}
        placeholder={t('Enter a description')}
      />
      <PageFormOrganizationSelect<IApplicationInput> name="organization" isRequired />
      <PageFormSingleSelect<IApplicationInput>
        isReadOnly={mode === 'edit'}
        name="authorization_grant_type"
        label={t('Authorization grant type')}
        placeholder={t('Select a grant type')}
        options={[
          {
            label: t('Authorization code'),
            description: t('use authorization code as grant type'),
            value: AuthorizationType.AuthorizationCode,
          },
          {
            label: t('Password'),
            description: t('use password as grant type'),
            value: AuthorizationType.Password,
          },
        ]}
        isRequired
      />
      <PageFormSingleSelect<IApplicationInput>
        name="client_type"
        label={t('Client type')}
        placeholder={t('Select a client type')}
        options={[
          {
            label: t('Confidential'),
            description: t('use authorization code as grant type'),
            value: ClientType.Confidential,
          },
          {
            label: t('Public'),
            description: t('use password as grant type'),
            value: ClientType.Public,
          },
        ]}
        isRequired
      />
      <PageFormTextInput<IApplicationInput>
        name="redirect_uris"
        label={t('Redirect URIs')}
        placeholder={t('Enter a redriect URI')}
      />
    </>
  );
}
