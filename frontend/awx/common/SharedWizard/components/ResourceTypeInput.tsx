import { useTranslation } from 'react-i18next';
import { PageFormSelect } from '../../../../../framework';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { RESOURCE_TYPE } from '../../../resources/templates/WorkflowVisualizer/constants';
import { useLocation, useParams } from 'react-router-dom';

export function ResourceTypeInput() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const params = useParams();
  const isWorkflow = !pathname.split('/').includes('schedule');
  const options: { label: string; value: string }[] = [
    { label: t('Job Template'), value: RESOURCE_TYPE.job },
    { label: t('Workflow Job Template'), value: RESOURCE_TYPE.workflow_job },
    { label: t('Project Sync'), value: RESOURCE_TYPE.project_update },
    { label: t('Management Job'), value: RESOURCE_TYPE.system_job },
  ];
  if (isWorkflow) {
    options.splice(2, 0, { label: t('Approval'), value: RESOURCE_TYPE.workflow_approval });
    options.splice(4, 0, {
      label: t('Inventory Source Sync'),
      value: RESOURCE_TYPE.inventory_update,
    });
  }
  return (
    <PageFormSelect<WizardFormValues>
      isRequired={isWorkflow || !params['*']?.startsWith('schedules')}
      label={t('Resource type')}
      name="resource_type"
      data-cy="resource-type"
      options={options}
    />
  );
}
