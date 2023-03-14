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
import { PageFormTextInput } from '../../../framework';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { EdaProject } from '../interfaces/EdaProject';
import { PageFormSwitch } from '../../../framework';
import { API_PREFIX } from '../constants';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaExtraVars } from '../interfaces/EdaExtraVars';
import { PageFormCodeEditor } from '../common/PageFormCodeEditor';

export function EditRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: rulebooks } = useGet<EdaResult<EdaRulebook>>(`${API_PREFIX}/rulebooks/`);
  const { data: projects } = useGet<EdaResult<EdaProject>>(`${API_PREFIX}/projects/`);
  const { data: extra_vars } = useGet<EdaResult<EdaExtraVars>>(`${API_PREFIX}/extra-vars/`);
  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<EdaRulebookActivation & { new_extra_var: string }> = async (
    rulebookActivation,
    setError
  ) => {
    let extra_var_id;
    try {
      extra_var_id = await requestPost<EdaExtraVars>(`${API_PREFIX}/extra-vars/`, {
        name: rulebookActivation.name,
        extra_var: rulebookActivation.new_extra_var,
        project: rulebookActivation.project,
      });
      (cache as unknown as { clear: () => void }).clear?.();
    } catch (err) {
      extra_var_id = undefined;
      setError(err instanceof Error ? err.message : t('Unknown error'));
    }
    try {
      const newRulebookActivation = await requestPost<EdaRulebookActivation>(
        `${API_PREFIX}/activations/`,
        extra_var_id ? { ...rulebookActivation, extra_var_id: extra_var_id } : rulebookActivation
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
          name={'project'}
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
        <PageFormSwitch<EdaRulebook>
          id="rulebook-activation"
          formLabel={t('Rulebook activation enabled?')}
          label={t('Enabled')}
          labelOff={t('Disabled')}
          name="is_enabled"
        />
        <PageFormSwitch<EdaRulebook>
          id="rulebook-throttle"
          formLabel={t('Throttle')}
          label={t('Enabled')}
          labelOff={t('Disabled')}
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
        <PageFormCodeEditor
          name={'new_extra_var'}
          shortcutsPopoverButtonText={t('Extra vars')}
          toolTipCopyExitDelay={1}
          toolTipDelay={1}
          toolTipMaxWidth={'20'}
          height={'250'}
        />
      </PageForm>
    </PageLayout>
  );
}
