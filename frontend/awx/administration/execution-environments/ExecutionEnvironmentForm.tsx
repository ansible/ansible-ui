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
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { PageFormOrganizationSelect } from '../../access/organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../../access/organizations/utils/getOrganizationByName';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { Application } from '../../interfaces/Application';
import { Organization } from '../../interfaces/Organization';
import { AwxRoute } from '../../main/AwxRoutes';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { Credential } from '../../interfaces/Credential';
import { useOptions } from '../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../interfaces/OptionsResponse';
import { PageFormRegistryCredentialSelect } from './components/PageFormRegistryCredentialSelect';
import { PageFormCredentialSelect } from '../../access/credentials/components/PageFormCredentialSelect';
import { getCredentialByName } from '../../access/credentials/utils/getCredentialByName';

const PullOption = {
  Always: 'Always pull container before running.',
  Missing: 'Only pull the image if not present before running.',
  Never: 'Never pull container before running.',
};

export interface IExecutionEnvInput {
  organization?: string;
  credential?: string;
  pull: string;
  name: string;
  image: string;
  description?: string;
}

export interface IExecutionEnvBody {
  organization?: number;
  credential?: number;
  pull: string;
  name: string;
  image: string;
  description?: string;
}

export function CreateExecutionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<IExecutionEnvBody, ExecutionEnvironment>();
  const onSubmit: PageFormSubmitHandler<IExecutionEnvInput> = async (
    executionEnvInput: IExecutionEnvInput
  ) => {
    let organization: Organization | undefined;
    let credential: Credential | undefined;
    let modifiedInput: IExecutionEnvBody;

    if (executionEnvInput.organization)
      organization = await getOrganizationByName(executionEnvInput.organization);
    if (executionEnvInput.credential)
      credential = await getCredentialByName(executionEnvInput.credential);

    modifiedInput = {
      ...executionEnvInput,
      organization: organization?.id,
      credential: credential?.id,
    };

    const newExecutionEnv = await postRequest(awxAPI`/execution_environments/`, modifiedInput);
    pageNavigate(AwxRoute.ExecutionEnvironmentDetails, { params: { id: newExecutionEnv.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Execution Environment')}
        breadcrumbs={[
          { label: t('Execution Environments'), to: getPageUrl(AwxRoute.ExecutionEnvironments) },
          { label: t('Create Execution Environment') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create execution environment')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <ApplicationInputs mode="create" />
      </AwxPageForm>
    </PageLayout>
  );
}

function ApplicationInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/execution_environments/`);

  const formData = data?.actions?.POST;

  return (
    <>
      <PageFormTextInput<IExecutionEnvInput>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<IExecutionEnvInput>
        name="image"
        label={t('Image')}
        placeholder={t('Enter an image')}
        isRequired
        maxLength={150}
      />
      <PageFormSelect<IExecutionEnvInput>
        isReadOnly={mode === 'edit'}
        name="pull"
        label={t('Pull')}
        placeholderText={t('---------')}
        options={[
          {
            label: t(`${PullOption.Always}`),
            value: 'always',
          },
          {
            label: t(`${PullOption.Missing}`),
            value: 'missing',
          },
          {
            label: t(`${PullOption.Never}`),
            value: 'never',
          },
        ]}
      />
      <PageFormTextInput<IExecutionEnvInput>
        name="description"
        label={t('Description')}
        placeholder={t('Enter a description')}
      />
      <PageFormOrganizationSelect<IExecutionEnvInput> name="organization" />
      <PageFormCredentialSelect<IExecutionEnvInput>
        name="credential"
        credentialType={17}
        placeholder={t('Add registry credential')}
        selectTitle={t('Select a registry credential')}
        label={t('Registry Credential')}
      />
    </>
  );
}
