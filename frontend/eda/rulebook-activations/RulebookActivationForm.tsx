import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormDataEditor,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageFormSwitch,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  compareStrings,
} from '../../../framework';
import { PageFormAsyncSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { RouteObj } from '../../Routes';
import { requestGet } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { EdaProjectCell } from '../Resources/projects/components/EdaProjectCell';
import { API_PREFIX } from '../constants';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaExtraVars } from '../interfaces/EdaExtraVars';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';

export function CreateRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const postEdaExtraVars = usePostRequest<Partial<EdaExtraVars>, { id: number }>();
  const postEdaRulebookActivation = usePostRequest<object, EdaRulebookActivation>();

  const onSubmit: PageFormSubmitHandler<IEdaRulebookActivationInputs> = async ({
    rulebook,
    variables,
    ...rulebookActivation
  }) => {
    let extra_var: { id: number } | undefined;
    if (variables && variables.trim().length > 0) {
      extra_var = await postEdaExtraVars(`${API_PREFIX}/extra-vars/`, {
        extra_var: variables,
      });
    }
    rulebookActivation.extra_var_id = extra_var?.id;
    rulebookActivation.rulebook_id = rulebook?.id;
    const newRulebookActivation = await postEdaRulebookActivation(
      `${API_PREFIX}/activations/`,
      rulebookActivation
    );
    navigate(
      RouteObj.EdaRulebookActivationDetails.replace(':id', newRulebookActivation.id.toString())
    );
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Rulebook Activation')}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: RouteObj.EdaRulebookActivations },
          { label: t('Create Rulebook Activation') },
        ]}
      />
      <PageForm<IEdaRulebookActivationInputs>
        submitText={t('Create rulebook activation')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ restart_policy: 'always', is_enabled: true, variables: '' }}
      >
        <RulebookActivationInputs />
      </PageForm>
    </PageLayout>
  );
}

export function RulebookActivationInputs() {
  const { t } = useTranslation();
  const restartPolicyHelpBlock = (
    <Trans i18nKey="restartPolicyHelpBlock">
      <p>A policy to decide when to restart a rulebook.</p>
      <br />
      <p>Policies:</p>
      <p>Always: restarts when a rulebook finishes.</p>
      <p>Never: never restarts a rulebook when it finishes.</p>
      <p>On failure: only restarts when it fails.</p>
    </Trans>
  );
  const { data: projects } = useGet<EdaResult<EdaProject>>(
    `${API_PREFIX}/projects/?page=1&page_size=200`
  );
  const { data: environments } = useGet<EdaResult<EdaDecisionEnvironment>>(
    `${API_PREFIX}/decision-environments/?page=1&page_size=200`
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
        ? `${API_PREFIX}/rulebooks/?project_id=${projectId}&page=1&page_size=200`
        : `${API_PREFIX}/rulebooks/?page=1&page_size=200`
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
      <PageFormSelectOption<IEdaRulebookActivationInputs>
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
        footer={<Link to={RouteObj.CreateEdaProject}>Create project</Link>}
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
      <PageFormSelectOption<IEdaRulebookActivationInputs>
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
        footer={<Link to={RouteObj.CreateEdaDecisionEnvironment}>Create decision environment</Link>}
        labelHelp={t('Decision environments are a container image to run Ansible rulebooks.')}
        labelHelpTitle={t('Decision environment')}
      />
      <PageFormSelectOption<IEdaRulebookActivationInputs>
        name="restart_policy"
        label={t('Restart policy')}
        placeholderText={t('Select restart policy')}
        options={RESTART_OPTIONS}
        labelHelp={restartPolicyHelpBlock}
        labelHelpTitle={t('Restart policy')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<IEdaRulebookActivationInputs>
          name="variables"
          label={t('Variables')}
          isExpandable
          defaultExpanded={false}
          labelHelp={t(
            'Pass extra command line variables to the playbook. This is the -e or --extra-vars command line parameter for ansible-playbook. Provide key/value pairs using either YAML or JSON. Refer to the documentation for example syntax.'
          )}
          labelHelpTitle={t('Variables')}
        />
      </PageFormSection>
      <PageFormSwitch<IEdaRulebookActivationInputs>
        id="rulebook-activation"
        name="is_enabled"
        formLabel={t('Rulebook activation enabled?')}
        label={t('Enabled')}
        labelOff={t('Disabled')}
        labelHelp={t('Automatically enable this rulebook activation to run.')}
        labelHelpTitle={t('Rulebook activation enabled')}
      />
    </>
  );
}

type IEdaRulebookActivationInputs = EdaRulebookActivation & {
  rulebook: EdaRulebook;
  variables: string;
};
