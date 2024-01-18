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
import { PageFormAsyncSingleSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { requestGet } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaExtraVars } from '../interfaces/EdaExtraVars';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import {
  EdaRulebookActivation,
  EdaRulebookActivationCreate,
} from '../interfaces/EdaRulebookActivation';
import { AwxToken, RestartPolicyEnum } from '../interfaces/generated/eda-api';
import { EdaRoute } from '../main/EdaRoutes';
import { EdaProjectCell } from '../projects/components/EdaProjectCell';
import { EdaEventSource } from '../interfaces/EdaEventSource';
import { PageFormMultiSelect } from '../../../framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormCredentialSelect } from '../access/credentials/components/PageFormCredentialsSelect';
import { EdaCredential } from '../interfaces/EdaCredential';

export function CreateRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const postEdaExtraVars = usePostRequest<Partial<EdaExtraVars>, { id: number }>();
  const postEdaRulebookActivation = usePostRequest<object, EdaRulebookActivation>();

  const onSubmit: PageFormSubmitHandler<IEdaRulebookActivationInputs> = async ({
    rulebook,
    variables,
    ...rulebookActivation
  }) => {
    let extra_var: { id: number } | undefined;
    if (variables && variables.trim().length > 0) {
      extra_var = await postEdaExtraVars(edaAPI`/extra-vars/`, {
        extra_var: variables,
      });
    }
    rulebookActivation.extra_var_id = extra_var?.id;
    rulebookActivation.rulebook_id = rulebook?.id;
    rulebookActivation.credentials = rulebookActivation.credential_refs
      ? rulebookActivation.credential_refs.map((credential) => `${credential.id || ''}`)
      : undefined;
    const newRulebookActivation = await postEdaRulebookActivation(
      edaAPI`/activations/`,
      rulebookActivation
    );
    pageNavigate(EdaRoute.RulebookActivationPage, { params: { id: newRulebookActivation.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Rulebook Activation')}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.RulebookActivations) },
          { label: t('Create Rulebook Activation') },
        ]}
      />
      <EdaPageForm<IEdaRulebookActivationInputs>
        submitText={t('Create rulebook activation')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          restart_policy: RestartPolicyEnum.OnFailure,
          is_enabled: true,
          variables: '',
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
      <p>{t('A policy to decide when to restart a rulebook.')}</p>
      <br />
      <p>{t('Policies:')}</p>
      <p>{t('Always: restarts when a rulebook finishes.')}</p>
      <p>{t('Never: never restarts a rulebook when it finishes.')}</p>
      <p>{t('On failure: only restarts when it fails.')}</p>
    </>
  );
  const { data: projects } = useGet<EdaResult<EdaProject>>(edaAPI`/projects/?page=1&page_size=200`);
  const { data: environments } = useGet<EdaResult<EdaDecisionEnvironment>>(
    edaAPI`/decision-environments/?page=1&page_size=200`
  );

  const { data: sources } = useGet<EdaResult<EdaEventSource>>(
    edaAPI`/sources/?page=1&page_size=200`
  );

  const RESTART_OPTIONS = [
    { label: t('On failure'), value: 'on-failure' },
    { label: t('Always'), value: 'always' },
    { label: t('Never'), value: 'never' },
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

  const queryAwxTokens = useCallback(async (page: number, signal: AbortSignal) => {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const response = await requestGet<EdaResult<AwxToken>>(
      edaAPI`/users/me/awx-tokens/?${page.toString()}}`,
      signal
    );
    return Promise.resolve({
      total: response.count,
      options:
        response.results?.map((item) => ({
          label: item.name,
          value: item.id,
        })) ?? [],
    });
  }, []);

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
        footer={<Link to={getPageUrl(EdaRoute.CreateProject)}>Create project</Link>}
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
      <PageFormMultiSelect<IEdaRulebookActivationInputs>
        name="sources"
        label={t('Source(s)')}
        options={
          sources?.results
            ? sources.results.map((item) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        placeholder={t('Select source(s)')}
        footer={<Link to={getPageUrl(EdaRoute.CreateEventSource)}>Create source</Link>}
      />
      <PageFormCredentialSelect<{ credential_refs: string; id: string }>
        name="credential_refs"
        labelHelp={t(`Select the credentials for this rulebook activations.`)}
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
      <PageFormAsyncSingleSelect<IEdaRulebookActivationInputs>
        name="awx_token_id"
        label={t('Controller token')}
        placeholder={t('Select controller token')}
        queryPlaceholder={t('Loading controller tokens...')}
        queryErrorText={t('Error loading controller tokens')}
        queryOptions={queryAwxTokens}
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
        options={RESTART_OPTIONS}
        labelHelp={restartPolicyHelpBlock}
        labelHelpTitle={t('Restart policy')}
      />
      <PageFormSwitch<IEdaRulebookActivationInputs>
        id="rulebook-activation"
        name="is_enabled"
        label={t('Rulebook activation enabled?')}
        labelHelp={t('Automatically enable this rulebook activation to run.')}
        labelHelpTitle={t('Rulebook activation enabled')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<IEdaRulebookActivationInputs>
          name="variables"
          label={t('Variables')}
          isExpandable
          toggleLanguages={['yaml', 'json']}
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

type IEdaRulebookActivationInputs = Omit<EdaRulebookActivationCreate, 'sources'> & {
  rulebook: EdaRulebook;
  sources?: string[];
  project_id: string;
  variables: string;
  awx_token_id: number;
  credentials?: string[];
  credential_refs?: EdaCredential[];
};
