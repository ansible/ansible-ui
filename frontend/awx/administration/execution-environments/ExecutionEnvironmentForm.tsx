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
import { useURLSearchParams } from '../../../../framework/components/useURLSearchParams';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { PageFormCredentialSelect } from '../../access/credentials/components/PageFormCredentialSelect';
import { PageFormSelectOrganization } from '../../access/organizations/components/PageFormOrganizationSelect';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../main/AwxRoutes';

const PullOption = {
  Always: 'Always pull container before running.',
  Missing: 'Only pull the image if not present before running.',
  Never: 'Never pull container before running.',
};

export function CreateExecutionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const [searchParams] = useURLSearchParams();
  const postRequest = usePostRequest<ExecutionEnvironment, ExecutionEnvironment>();
  const onSubmit: PageFormSubmitHandler<ExecutionEnvironment> = async (
    executionEnvInput: ExecutionEnvironment
  ) => {
    const newExecutionEnv = await postRequest(awxAPI`/execution_environments/`, executionEnvInput);
    pageNavigate(AwxRoute.ExecutionEnvironmentDetails, { params: { id: newExecutionEnv.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  const defaultValue: Partial<ExecutionEnvironment> = {
    image: searchParams.get('image') ?? '',
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create execution environment')}
        breadcrumbs={[
          { label: t('Execution Environments'), to: getPageUrl(AwxRoute.ExecutionEnvironments) },
          { label: t('Create execution environment') },
        ]}
      />
      <AwxPageForm<ExecutionEnvironment>
        submitText={t('Create execution environment')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
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
  const { data: execution_env } = useSWR<ExecutionEnvironment>(
    awxAPI`/execution_environments/${params.id ?? ''}/`,
    requestGet,
    swrOptions
  );
  const onSubmit: PageFormSubmitHandler<ExecutionEnvironment> = async (
    executionEnvInput: ExecutionEnvironment
  ) => {
    const editedExecutionEnv = await requestPatch<ExecutionEnvironment>(
      awxAPI`/execution_environments/${params.id ?? ''}/`,
      executionEnvInput
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

  return (
    <PageLayout>
      <PageHeader
        title={
          execution_env?.name
            ? t('Edit {{executionenvironmentName}}', {
                executionenvironmentName: execution_env?.name,
              })
            : t('Execution Environment')
        }
        breadcrumbs={[
          { label: t('Execution Environments'), to: getPageUrl(AwxRoute.ExecutionEnvironments) },
          {
            label: execution_env?.name
              ? t('Edit {{executionenvironmentName}}', {
                  executionenvironmentName: execution_env?.name,
                })
              : t('Execution Environment'),
          },
        ]}
      />
      <AwxPageForm<ExecutionEnvironment>
        submitText={t('Save execution environment')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={execution_env}
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
      <PageFormTextInput<ExecutionEnvironment>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a name')}
        isRequired
        isDisabled={props?.executionEnv?.managed || false}
        maxLength={150}
      />
      <PageFormTextInput<ExecutionEnvironment>
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
      <PageFormSelect<ExecutionEnvironment>
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
      <PageFormTextInput<ExecutionEnvironment>
        name="description"
        label={t('Description')}
        placeholder={t('Enter a description')}
        isDisabled={props?.executionEnv?.managed || false}
      />
      {props.mode === 'edit' && isOrgGloballyAvailable ? (
        <PageFormSelectOrganization<ExecutionEnvironment>
          name="organization"
          isDisabled={t(
            'Globally available execution environment can not be reassigned to a specific Organization.'
          )}
          helperText={t(
            'Leave this field blank to make the execution environment globally available.'
          )}
        />
      ) : undefined}
      {props.mode === 'edit' && !isOrgGloballyAvailable ? (
        <PageFormSelectOrganization<ExecutionEnvironment>
          name="organization"
          helperText={t(
            'Leave this field blank to make the execution environment globally available.'
          )}
        />
      ) : undefined}
      {props.mode === 'create' ? (
        <PageFormSelectOrganization<ExecutionEnvironment>
          name="organization"
          helperText={t(
            'Leave this field blank to make the execution environment globally available.'
          )}
          isRequired={false}
        />
      ) : undefined}

      <PageFormCredentialSelect<ExecutionEnvironment>
        name="credential"
        label={t('Registry credential')}
        labelHelp={t('Credential to authenticate with a protected container registry.')}
        placeholder={t('Select registry credential')}
        isDisabled={props?.executionEnv?.managed ? t('Disabled') : undefined}
        queryParams={{
          credential_type__namespace: 'registry',
        }}
      />
    </>
  );
}
