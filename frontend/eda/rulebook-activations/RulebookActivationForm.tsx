import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  PageFormDataEditor,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormSwitch,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  compareStrings,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { PageFormAsyncSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { requestGet, swrOptions } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { PageFormCredentialSelect } from '../access/credentials/components/PageFormCredentialsSelect';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaCredential } from '../interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import {
  EdaRulebookActivation,
  EdaRulebookActivationCreate,
} from '../interfaces/EdaRulebookActivation';
import { AwxToken, LogLevelEnum, RestartPolicyEnum } from '../interfaces/generated/eda-api';
import { EdaRoute } from '../main/EdaRoutes';
import { EdaProjectCell } from '../projects/components/EdaProjectCell';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';
import useSWR from 'swr';
import { EdaOrganization } from '../interfaces/EdaOrganization';
import { Alert } from '@patternfly/react-core';
import { EdaWebhook } from '../interfaces/EdaWebhook';
import { PageFormMultiSelect } from '../../../framework/PageForm/Inputs/PageFormMultiSelect';

export function CreateRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const postEdaRulebookActivation = usePostRequest<object, EdaRulebookActivation>();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;

  const onSubmit: PageFormSubmitHandler<IEdaRulebookActivationInputs> = async ({
    rulebook,
    ...rulebookActivation
  }) => {
    rulebookActivation?.organization_id, (rulebookActivation.rulebook_id = rulebook?.id);
    rulebookActivation.eda_credentials = rulebookActivation.credential_refs
      ? rulebookActivation.credential_refs.map((credential) => credential?.id)
      : undefined;
    delete rulebookActivation.credential_refs;
    const newRulebookActivation = await postEdaRulebookActivation(
      edaAPI`/activations/`,
      rulebookActivation
    );
    pageNavigate(EdaRoute.RulebookActivationPage, { params: { id: newRulebookActivation.id } });
  };
  const { data: tokens } = useGet<EdaResult<AwxToken>>(
    edaAPI`/users/me/awx-tokens/?page=1&page_size=1`
  );

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create rulebook activation')}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.RulebookActivations) },
          { label: t('Create rulebook activation') },
        ]}
      />
      {(!tokens?.results || tokens?.results.length < 1) && (
        <Alert
          variant={'info'}
          isInline
          isPlain
          style={{ paddingLeft: '24px', paddingTop: '16px' }}
          title={t(
            'Most rulebook activations require a controller token to authenticate with an Automation Controller.'
          )}
        >
          <Link to={getPageUrl(EdaRoute.CreateControllerToken)}>
            {t('Create a controller token')}
          </Link>
        </Alert>
      )}
      <EdaPageForm<IEdaRulebookActivationInputs>
        submitText={t('Create rulebook activation')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          organization_id: defaultOrganization?.id,
          restart_policy: RestartPolicyEnum.OnFailure,
          log_level: LogLevelEnum.Error,
          is_enabled: true,
          swap_single_source: false,
        }}
      >
        <RulebookActivationInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function RulebookActivationInputs() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const restartPolicyHelpBlock = (
    <>
      <p>
        {t(
          ' The policy that determines how an activation should restart after the container process running the source plugin ends.'
        )}
      </p>
      <br />
      <p>{t('Policies:')}</p>
      <p>
        {t(
          'Always: This will always restart the rulebook activation regardless of if it ends successfully or not.'
        )}
      </p>
      <p>
        {t('Never: This will never restart a rulebook activation when the container process ends.')}
      </p>
      <p>
        {t(
          'On failure: This will restart the rulebook activation only when the container process fails.'
        )}
      </p>
    </>
  );
  const { data: projects } = useGet<EdaResult<EdaProject>>(edaAPI`/projects/?page=1&page_size=200`);
  const { data: environments } = useGet<EdaResult<EdaDecisionEnvironment>>(
    edaAPI`/decision-environments/?page=1&page_size=200`
  );

  const { data: tokens } = useGet<EdaResult<AwxToken>>(
    edaAPI`/users/me/awx-tokens/?page=1&page_size=200`
  );
  const { data: webhooks } = useGet<EdaResult<EdaWebhook>>(edaAPI`/webhooks/?page=1&page_size=200`);

  const RESTART_OPTIONS = [
    { label: t('On failure'), value: 'on-failure' },
    { label: t('Always'), value: 'always' },
    { label: t('Never'), value: 'never' },
  ];

  const LOG_LEVEL_OPTIONS = [
    { label: t('Error'), value: 'error' },
    { label: t('Info'), value: 'info' },
    { label: t('Debug'), value: 'debug' },
  ];

  const projectId = useWatch<IEdaRulebookActivationInputs>({
    name: 'project_id',
  }) as number;

  const query = useCallback(async () => {
    const response = await requestGet<EdaResult<EdaRulebook>>(
      projectId !== undefined
        ? edaAPI`/rulebooks/?project_id=${projectId.toString()}&page=1&page_size=200`
        : edaAPI`/rulebooks/?page=1&page_size=200`
    );
    return Promise.resolve({
      total: response.count,
      values: response.results?.sort((l, r) => compareStrings(l.name, r.name)) ?? [],
    });
  }, [projectId]);

  return (
    <>
      <PageFormTextInput<IEdaRulebookActivationInputs>
        name="name"
        label={t('Name')}
        id={'name'}
        isRequired={true}
        placeholder={t('Enter name')}
      />
      <PageFormTextInput<IEdaRulebookActivationInputs>
        name="description"
        label={t('Description')}
        id={'description'}
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<IEdaRulebookActivationInputs> name="organization_id" />
      <PageFormSelect<IEdaRulebookActivationInputs>
        name="project_id"
        label={t('Project')}
        placeholderText={t('Select project')}
        options={
          projects?.results
            ? projects.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        footer={<Link to={getPageUrl(EdaRoute.CreateProject)}>{t('Create project')}</Link>}
        labelHelp={t('Projects are a logical collection of rulebooks.')}
        labelHelpTitle={t('Project')}
      />
      <PageFormAsyncSelect<IEdaRulebookActivationInputs>
        name="rulebook"
        label={t('Rulebook')}
        placeholder={t('Select project rulebook')}
        loadingPlaceholder={t('Loading project rulebooks')}
        loadingErrorText={t('Error loading project rulebooks')}
        query={query}
        valueToString={(rulebook: EdaRulebook) => rulebook.name}
        valueToDescription={(rulebook: EdaRulebook) => (
          <EdaProjectCell id={rulebook.project_id} disableLink />
        )}
        limit={200}
        isRequired
        labelHelp={t('Rulebooks will be shown according to the project selected.')}
        labelHelpTitle={t('Rulebook')}
      />
      <PageFormCredentialSelect<{ credential_refs: string; id: string }>
        name="credential_refs"
        credentialKinds={['vault,cloud']}
        labelHelp={t(`Select the credentials for this rulebook activation.`)}
      />
      <PageFormSelect<IEdaRulebookActivationInputs>
        name="decision_environment_id"
        label={t('Decision environment')}
        placeholderText={t('Select decision environment')}
        options={
          environments?.results
            ? environments.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        isRequired
        footer={
          <Link to={getPageUrl(EdaRoute.CreateDecisionEnvironment)}>
            Create decision environment
          </Link>
        }
        labelHelp={t('Decision environments are a container image to run Ansible rulebooks.')}
        labelHelpTitle={t('Decision environment')}
      />
      <PageFormSelect<IEdaRulebookActivationInputs>
        name="awx_token_id"
        label={t('Controller token')}
        placeholderText={t('Select controller token')}
        options={
          tokens?.results
            ? tokens.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        footer={
          <Link to={getPageUrl(EdaRoute.CreateControllerToken)}>Create controller token</Link>
        }
        labelHelpTitle={t('Controller tokens')}
        labelHelp={[
          t('Controller tokens are used to authenticate with controller API.'),
          t('Controller tokens can be added under the current user details.'),
        ]}
      />
      <PageFormSelect<IEdaRulebookActivationInputs>
        name="restart_policy"
        label={t('Restart policy')}
        placeholderText={t('Select restart policy')}
        isRequired
        options={RESTART_OPTIONS}
        labelHelp={restartPolicyHelpBlock}
        labelHelpTitle={t('Restart policy')}
      />
      <PageFormSelect<IEdaRulebookActivationInputs>
        name="log_level"
        label={t('Log level')}
        placeholderText={t('Select log level')}
        isRequired
        options={LOG_LEVEL_OPTIONS}
        labelHelp={t('The different log level options: Error, Info, and Debug.')}
        labelHelpTitle={t('Log level')}
      />
      <PageFormTextInput<IEdaRulebookActivationInputs>
        name="k8s_service_name"
        label={t('Service name')}
        id={'k8s_service_name'}
        placeholder={t('Enter service name')}
        labelHelp={t('Optional service name.')}
        labelHelpTitle={t('Service name')}
      />
      <PageFormSection>
        <PageFormMultiSelect<IEdaRulebookActivationInputs>
          name="webhooks"
          label={t('Event stream(s)')}
          options={
            webhooks?.results
              ? webhooks.results.map((item) => ({
                  label: item?.name || '',
                  value: `${item.id}`,
                }))
              : []
          }
          placeholder={t('Select event stream(s)')}
          footer={<Link to={getPageUrl(EdaRoute.CreateWebhook)}>Create event stream</Link>}
        />
        <PageFormSwitch<IEdaRulebookActivationInputs>
          id="swap_single_source"
          name="swap_single_source"
          label={t('Swap single source?')}
          labelHelp={t(
            'Event streams can be used to swap out one or more sources in your rulebook, the name of the source and the event stream have to match.'
          )}
          labelHelpTitle={t('Swap single source')}
        />
      </PageFormSection>

      <PageFormSwitch<IEdaRulebookActivationInputs>
        id="rulebook-activation"
        name="is_enabled"
        label={t('Rulebook activation enabled?')}
        labelHelp={t('Automatically enable this rulebook activation to run.')}
        labelHelpTitle={t('Rulebook activation enabled')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<IEdaRulebookActivationInputs>
          name="extra_var"
          label={t('Variables')}
          format="yaml"
          labelHelp={t(
            `The variables for the rulebook are in a JSON or YAML format. 
            The content would be equivalent to the file passed through the '--vars' flag of ansible-rulebook command.`
          )}
          labelHelpTitle={t('Variables')}
        />
      </PageFormSection>
    </>
  );
}

type IEdaRulebookActivationInputs = Omit<EdaRulebookActivationCreate, 'event_streams'> & {
  rulebook: EdaRulebook;
  event_streams?: string[];
  webhooks?: string[];
  project_id: string;
  awx_token_id: number;
  credential_refs?: EdaCredential[] | null;
  swap_single_source: boolean;
};
