import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormCodeEditor,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageFormSwitch,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { API_PREFIX } from '../constants';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaExtraVars } from '../interfaces/EdaExtraVars';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';

export function EditRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: rulebooks } = useGet<EdaResult<EdaRulebook>>(`${API_PREFIX}/rulebooks/`);
  const { data: projects } = useGet<EdaResult<EdaProject>>(`${API_PREFIX}/projects/`);
  const { data: environments } = useGet<EdaResult<EdaDecisionEnvironment>>(
    `${API_PREFIX}/decision-environments/`
  );
  const { cache } = useSWRConfig();

  const RESTART_OPTIONS = [
    { label: t('On failure'), value: 'on-failure' },
    { label: t('Always'), value: 'always' },
    { label: t('Never'), value: 'never' },
  ];

  const postEdaExtraVars = usePostRequest<Partial<EdaExtraVars>, EdaExtraVars>();
  const postEdaRulebookActivation = usePostRequest<object, EdaRulebookActivation>();

  const onSubmit: PageFormSubmitHandler<EdaRulebookActivation & { variables: string }> = async (
    rulebookActivation
  ) => {
    let extra_var_id;
    if (rulebookActivation?.variables) {
      try {
        extra_var_id = await postEdaExtraVars(`${API_PREFIX}/extra-vars/`, {
          extra_var: rulebookActivation.variables,
        });
        (cache as unknown as { clear: () => void }).clear?.();
      } catch (err) {
        extra_var_id = undefined;
        throw err;
      }
    }
    const newRulebookActivation = await postEdaRulebookActivation(
      `${API_PREFIX}/activations/`,
      extra_var_id ? { ...rulebookActivation, extra_var_id: extra_var_id } : rulebookActivation
    );
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(
      RouteObj.EdaRulebookActivationDetails.replace(':id', newRulebookActivation.id.toString())
    );
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create rulebook activation')}
        breadcrumbs={[
          { label: t('Rulebook activations'), to: RouteObj.EdaRulebookActivations },
          { label: t('Create rulebook activation') },
        ]}
      />
      <PageForm
        submitText={t('Create rulebook activation')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <PageFormTextInput
          name={'name'}
          label={t('Name')}
          id={'name'}
          isRequired={true}
          placeholder={t('Enter name')}
        />
        <PageFormTextInput
          name={'description'}
          label={t('Description')}
          id={'description'}
          placeholder={t('Enter description')}
        />
        <PageFormSelectOption
          name={'decision_environment_id'}
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
        />
        <PageFormSelectOption
          name={'rulebook_id'}
          label={t('Rulebook')}
          placeholderText={t('Select rulebook')}
          options={
            rulebooks?.results
              ? rulebooks.results.map((item: { name: string; id: number }) => ({
                  label: item.name,
                  value: item.id,
                }))
              : []
          }
          isRequired
        />
        <PageFormSelectOption
          name={'restart_policy'}
          label={t('Restart policy')}
          placeholderText={t('Select restart policy')}
          options={RESTART_OPTIONS}
        />
        <PageFormSelectOption
          name={'project_id'}
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
        />
        <PageFormSwitch<EdaRulebook>
          id="rulebook-activation"
          formLabel={t('Rulebook activation enabled?')}
          label={t('Enabled')}
          labelOff={t('Disabled')}
          name="is_enabled"
        />
        <PageFormSection singleColumn>
          <PageFormCodeEditor name={'variables'} label={t('Variables')} />
        </PageFormSection>
      </PageForm>
    </PageLayout>
  );
}
