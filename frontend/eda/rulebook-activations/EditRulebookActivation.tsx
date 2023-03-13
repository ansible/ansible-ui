import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { useGet } from '../../common/useItem';
import { requestPost } from '../../Data';
import { RouteObj } from '../../Routes';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { PageFormTextInput } from '../../../framework/PageForm/Inputs/PageFormTextInput';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { EdaProject } from '../interfaces/EdaProject';
import { PageFormSwitch } from '../../../framework/PageForm/Inputs/PageFormSwitch';
import { API_PREFIX } from '../constants';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaExtraVars } from '../interfaces/EdaExtraVars';

export function EditRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: rulebooks } = useGet<EdaResult<EdaRulebook>>(`${API_PREFIX}/rulebooks/`);
  const { data: projects } = useGet<EdaResult<EdaProject>>(`${API_PREFIX}/projects/`);
  const { data: extra_vars } = useGet<EdaResult<EdaExtraVars>>(`${API_PREFIX}/extra-vars/`);
  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<EdaRulebookActivation> = async (
    rulebookActivation,
    setError
  ) => {
    try {
      const newRulebookActivation = await requestPost<EdaRulebookActivation>(
        `${API_PREFIX}/activations/`,
        rulebookActivation
      );
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(
        RouteObj.EdaRulebookActivationDetails.replace(':id', newRulebookActivation.id.toString())
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unknown error'));
    }
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create rulebook activation')}
        breadcrumbs={[
          { label: t('RulebookActivations'), to: RouteObj.EdaRulebookActivations },
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
          placeholder={t('Insert name here')}
        />
        <PageFormTextInput
          name={'description'}
          label={t('Description')}
          id={'description'}
          placeholder={t('Insert description here')}
        />
        <PageFormTextInput
          name={'execution_environment'}
          label={t('Execution environment')}
          id={'execution_environment'}
          placeholder={t('Insert execution environment here')}
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
        />
        <PageFormSelectOption
          name={'restart_policy'}
          label={t('Restart policy')}
          placeholderText={t('Select  a restart policy')}
          options={[]}
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
        <PageFormTextInput
          name={'working_directory'}
          label={t('Working directory')}
          id={'working_directory'}
          placeholder={t('Insert working directory here')}
        />
        <PageFormSwitch
          label={t('Rulebook activation enabled?')}
          labelOn={'Enabled'}
          labelOff={'Disabled'}
          name="is_enabled"
        />
        <PageFormSwitch
          label={t('Throttle')}
          labelOn={'Enabled'}
          labelOff={'Disabled'}
          name="throttle"
        />
        <PageFormSelectOption
          name={'extra_var_id'}
          label={t('Extra vars')}
          placeholderText={t('Select extra vars')}
          options={
            extra_vars?.results
              ? extra_vars.results.map((item: { name: string; id: number }) => ({
                  label: item.name,
                  value: item.id,
                }))
              : []
          }
        />
      </PageForm>
    </PageLayout>
  );
}
