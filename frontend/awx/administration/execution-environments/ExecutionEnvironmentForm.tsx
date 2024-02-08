import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { PageFormOrganizationSelect } from '../../access/organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../../access/organizations/utils/getOrganizationByName';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { Organization } from '../../interfaces/Organization';
import { AwxRoute } from '../../main/AwxRoutes';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { Credential } from '../../interfaces/Credential';
import { PageFormCredentialSelect } from '../../access/credentials/components/PageFormCredentialSelect';
import { getCredentialByName } from '../../access/credentials/utils/getCredentialByName';
import useSWR from 'swr';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { executionAsyncId } from 'async_hooks';
import { Tooltip } from '@patternfly/react-core';

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
  organization?: number | null;
  credential?: number | null;
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
    let modifiedInput: IExecutionEnvBody = {
      pull: '',
      name: '',
      image: '',
    };

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
        <ExecutionEnvironmentInputs mode="create" />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditExecutionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: execution_env } = useSWR<ExecutionEnvironment>(
    awxAPI`/execution_environments/${id.toString()}/`,
    requestGet,
    swrOptions
  );
  const onSubmit: PageFormSubmitHandler<IExecutionEnvInput> = async (
    executionEnvInput: IExecutionEnvInput
  ) => {
    let credential: Credential | undefined;
    let organization: Organization | undefined;
    let modifiedInput: IExecutionEnvBody = {
      pull: '',
      name: '',
      image: '',
    };

    if (executionEnvInput.credential)
      credential = await getCredentialByName(executionEnvInput.credential);

    if (executionEnvInput.organization)
      organization = await getOrganizationByName(executionEnvInput.organization);

    modifiedInput = {
      ...executionEnvInput,
      organization: organization?.id ?? null,
      credential: credential?.id ?? null,
    };

    const editedExecutionEnv = await requestPatch<ExecutionEnvironment>(
      awxAPI`/execution_environments/${id.toString()}/`,
      modifiedInput
    );
    pageNavigate(AwxRoute.ExecutionEnvironmentDetails, { params: { id: editedExecutionEnv.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!execution_env) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Execution Environments'), to: getPageUrl(AwxRoute.ExecutionEnvironments) },
            { label: t('Edit Execution Environment') },
          ]}
        />
      </PageLayout>
    );
  }

  const defaultValue: Partial<IExecutionEnvInput> = {
    name: execution_env.name,
    image: execution_env.image,
    pull: execution_env.pull,
    description: execution_env.description,
    credential: execution_env.summary_fields.credential?.name,
    organization: execution_env.summary_fields.organization?.name,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Execution Environment')}
        breadcrumbs={[
          { label: t('Execution Environments'), to: getPageUrl(AwxRoute.ExecutionEnvironments) },
          { label: t('Edit Execution Environment') },
        ]}
      />
      <AwxPageForm<IExecutionEnvInput>
        submitText={t('Save')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
      >
        <ExecutionEnvironmentInputs mode="edit" executionEnv={execution_env} />
      </AwxPageForm>
    </PageLayout>
  );
}

function ExecutionEnvironmentInputs(props: {
  mode: 'edit' | 'create';
  executionEnv?: ExecutionEnvironment;
}) {
  const { t } = useTranslation();
  const isOrgGloballyAvailable = !props.executionEnv?.organization;

  return (
    <>
      <PageFormTextInput<IExecutionEnvInput>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a name')}
        isRequired
        isDisabled={props?.executionEnv?.managed || false}
        maxLength={150}
      />
      <PageFormTextInput<IExecutionEnvInput>
        name="image"
        label={t('Image')}
        labelHelp={
          <span>
            {t(
              'The full image location, including the container registry, image name, and version tag.'
            )}
            <br />
            <br />
            {t(`Examples`)}
            <ul>
              <li>
                <code>
                  <b>quay.io/ansible/awx-ee:latest</b>
                </code>
              </li>
              <li>
                <code>
                  <b>repo/project/image-name:tag</b>
                </code>
              </li>
            </ul>
          </span>
        }
        isDisabled={props?.executionEnv?.managed || false}
        placeholder={t('Enter an image')}
        isRequired
        maxLength={150}
      />
      <PageFormSelect<IExecutionEnvInput>
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
        isDisabled={props?.executionEnv?.managed || false}
      />
      {props.mode === 'edit' && isOrgGloballyAvailable ? (
        <PageFormOrganizationSelect<IExecutionEnvInput> name="organization" isDisabled={true} />
      ) : undefined}
      {props.mode === 'edit' && !isOrgGloballyAvailable ? (
        <PageFormOrganizationSelect<IExecutionEnvInput>
          name="organization"
          helpText={t(
            'Leave this field blank to make the execution environment globally available.'
          )}
        />
      ) : undefined}
      {props.mode === 'create' ? (
        <PageFormOrganizationSelect<IExecutionEnvInput>
          name="organization"
          helpText={t(
            'Leave this field blank to make the execution environment globally available.'
          )}
        />
      ) : undefined}

      <PageFormCredentialSelect<IExecutionEnvInput>
        name="credential"
        labelHelp={t('Credential to authenticate with a protected container registry.')}
        credentialType={17}
        placeholder={t('Add registry credential')}
        selectTitle={t('Select a registry credential')}
        label={t('Registry Credential')}
        isDisabled={props?.executionEnv?.managed || false}
      />
    </>
  );
}
