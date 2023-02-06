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
import { RouteE } from '../../Routes';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { PageFormTextInput } from '../../../framework/PageForm/Inputs/PageFormTextInput';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { EdaProject } from '../interfaces/EdaProject';
import { EdaInventory } from '../interfaces/EdaInventory';
import { PageFormSwitch } from '../../../framework/PageForm/Inputs/PageFormSwitch';

export function EditRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: rulebooks } = useGet<EdaRulebook[]>('/eda/api/v1/rulebooks');
  const { data: projects } = useGet<EdaProject[]>('/eda/api/v1/projects');
  const { data: inventories } = useGet<EdaInventory[]>('/eda/api/v1/inventories');
  const { data: extra_vars } = useGet<EdaInventory[]>('/eda/api/v1/extra_vars');

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<EdaRulebookActivation> = async (
    rulebookActivation,
    setError
  ) => {
    try {
      const newRulebookActivation = await requestPost<EdaRulebookActivation>(
        '/eda/api/v1/activations',
        rulebookActivation
      );
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(
        RouteE.EdaRulebookActivationDetails.replace(':id', newRulebookActivation.id.toString())
      );
    } catch (err) {
      setError('TODO');
    }
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create rulebook activation')}
        breadcrumbs={[
          { label: t('RulebookActivations'), to: RouteE.EdaRulebookActivations },
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
        <PageFormSelectOption
          name={'inventory_id'}
          label={t('Inventory')}
          placeholderText={t('Select inventory')}
          options={
            inventories
              ? inventories.map((item: { name: string; id: number }) => ({
                  label: item.name,
                  value: item.id,
                }))
              : []
          }
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
            rulebooks
              ? rulebooks.map((item: { name: string; id: number }) => ({
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
            projects
              ? projects.map((item: { name: string; id: number }) => ({
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
            extra_vars
              ? extra_vars.map((item: { name: string; id: number }) => ({
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
