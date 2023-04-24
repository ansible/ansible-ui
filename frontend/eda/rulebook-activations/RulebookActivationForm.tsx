import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
    PageForm,
    PageFormCodeEditor,
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
    if (variables) {
      try {
        extra_var = await postEdaExtraVars(`${API_PREFIX}/extra-vars/`, {
          extra_var: variables,
        });
      } catch (err) {
        extra_var = undefined;
        throw err;
      }
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
        defaultValue={{ restart_policy: 'always', is_enabled: true }}
      >
        <RulebookActivationInputs />
      </PageForm>
    </PageLayout>
  );
}

export function RulebookActivationInputs() {
  const { t } = useTranslation();
  const { data: projects } = useGet<EdaResult<EdaProject>>(`${API_PREFIX}/projects/`);
  const { data: environments } = useGet<EdaResult<EdaDecisionEnvironment>>(
    `${API_PREFIX}/decision-environments/`
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
        ? `${API_PREFIX}/rulebooks/?project_id=${projectId}`
        : `${API_PREFIX}/rulebooks/`
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
        footer={<Link to={RouteObj.CreateEdaProject}>Create Decision Environment</Link>}
      />
      <PageFormSelectOption<IEdaRulebookActivationInputs>
        name="restart_policy"
        label={t('Restart policy')}
        placeholderText={t('Select restart policy')}
        options={RESTART_OPTIONS}
      />
      <PageFormSection singleColumn>
        <PageFormCodeEditor<IEdaRulebookActivationInputs>
          name="variables"
          label={t('Variables')}
          isExpandable
          defaultExpanded={false}
        />
      </PageFormSection>
      <PageFormSwitch<IEdaRulebookActivationInputs>
        id="rulebook-activation"
        name="is_enabled"
        formLabel={t('Rulebook activation enabled?')}
        label={t('Enabled')}
        labelOff={t('Disabled')}
      />
    </>
  );
}

type IEdaRulebookActivationInputs = EdaRulebookActivation & {
  rulebook: EdaRulebook;
  variables: string;
};
